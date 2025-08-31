import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "@/lib/db";
import { PDFProcessor } from "@/lib/pdf-processor";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let formData, file, zipCode, interests;
    try {
      formData = await request.formData();
      file = formData.get('file') as File;
      zipCode = formData.get('zipCode') as string;
      interests = JSON.parse(formData.get('interests') as string);
    } catch (err) {
      console.error('Form data parsing error:', err);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    let buffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      
      console.log('File info:', {
        name: file.name,
        type: file.type,
        size: file.size,
        bufferLength: buffer.length
      });
      
      // Check for suspicious file path content
      if (PDFProcessor.detectFilePath(buffer)) {
        console.error('Buffer appears to contain file path instead of file content');
        return NextResponse.json({ 
          error: 'Invalid file upload: received file path instead of file content' 
        }, { status: 400 });
      }
      
    } catch (err) {
      console.error('File buffer error:', err);
      return NextResponse.json({ error: 'Failed to read file buffer' }, { status: 500 });
    }

    // Extract text content
    let content = '';
    try {
      if (file.type === 'application/pdf') {
        console.log('Processing PDF with buffer length:', buffer.length);
        
        const result = await PDFProcessor.extractText(buffer);
        
        if (!result.success) {
          console.error('PDF processing failed:', result.error);
          return NextResponse.json({ 
            error: `PDF processing failed: ${result.error}` 
          }, { status: 400 });
        }
        
        content = result.text || '';
        console.log(`PDF processed successfully: ${result.pageCount} pages, ${content.length} characters`);
        
        if (!content.trim()) {
          return NextResponse.json({ 
            error: 'PDF file appears to be empty or contains no extractable text' 
          }, { status: 400 });
        }
        
      } else {
        // Handle text files
        content = buffer.toString('utf-8');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      return NextResponse.json({ error: 'Failed to parse file content' }, { status: 500 });
    }

    // Save document to database
    let documentId;
    try {
      const documentResult = await query(
        `INSERT INTO documents (title, content, document_type, zip_code, file_path, processed) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          content,
          'uploaded',
          zipCode,
          file.name, // or use null if file_path is not needed
          false
        ]
      );
      documentId = documentResult.rows[0].id;
    } catch (err) {
      console.error('Database insert error:', err);
      return NextResponse.json({ error: 'Failed to save document to database' }, { status: 500 });
    }

    // Process document asynchronously
    processDocument(documentId, content, interests, zipCode);

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'Document uploaded successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

async function processDocument(documentId: string, content: string, interests: string[], zipCode: string) {
  try {
    // Generate insights using OpenAI
    const prompt = `Analyze this government document and provide insights for residents interested in: ${interests.join(', ')}.

Document content:
${content.substring(0, 4000)} // Limit content to avoid token limits

Please provide:
1. A summary of key points relevant to the specified interests
2. Impact level (1-5 scale) for each relevant category
3. Specific action items residents can take
4. Key points that directly affect residents

Format your response as JSON with this structure:
{
  "insights": [
    {
      "category": "housing",
      "summary": "Brief summary",
      "impact_level": 3,
      "key_points": ["point 1", "point 2"],
      "action_items": ["action 1", "action 2"]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log('Raw Gemini response:', analysisText);

    // Clean the response text to extract JSON
    let cleanedText = analysisText || '{"insights": []}';
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleanedText = cleanedText.trim();
    
    // If the response doesn't start with {, try to find JSON within the text
    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      } else {
        cleanedText = '{"insights": []}';
      }
    }

    console.log('Cleaned text for parsing:', cleanedText);

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', cleanedText);
      
      // Fallback: create a basic structure
      analysisResult = {
        insights: [{
          category: "general",
          summary: "Document processed but AI analysis failed to generate proper JSON format",
          impact_level: 3,
          key_points: ["Document uploaded successfully"],
          action_items: ["Review document manually for insights"]
        }]
      };
    }

    // Store insights in database
    for (const insight of analysisResult.insights) {
      // Ensure impact_level is within valid range (1-5)
      const validImpactLevel = Math.max(1, Math.min(5, insight.impact_level || 3));
      
      await query(
        `INSERT INTO document_insights (document_id, category, summary, impact_level, key_points, action_items) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          insight.category,
          insight.summary,
          validImpactLevel,
          insight.key_points,
          insight.action_items
        ]
      );
    }

    // Generate forecasts
    await generateForecasts(documentId, content, analysisResult.insights);

    // Generate mock public comments and sentiment
    await generateMockSentiment(documentId);

    // Mark document as processed
    await query(
      `UPDATE documents SET processed = true WHERE id = $1`,
      [documentId]
    );

  } catch (error) {
    console.error('Processing error:', error);
  }
}

async function generateForecasts(documentId: string, content: string, insights: any[]) {
  try {
    // Generate forecasts using OpenAI
    const prompt = `Based on this government document analysis, generate realistic forecasts for potential impacts:

Document insights: ${JSON.stringify(insights)}

Generate 2-3 forecasts with:
- Specific predictions with timeframes
- Confidence scores (0.0-1.0)
- Impact areas
- Category (housing, transport, environment, etc.)

Format as JSON:
{
  "forecasts": [
    {
      "category": "housing",
      "prediction": "Specific prediction text",
      "confidence_score": 0.75,
      "timeframe": "12 months",
      "impact_areas": ["property values", "traffic"]
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const forecastText = response.text();

    console.log('Raw Gemini response:', forecastText);

    // Clean the response text to extract JSON
    let cleanedText = forecastText || '{"forecasts": []}';
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleanedText = cleanedText.trim();
    
    // If the response doesn't start with {, try to find JSON within the text
    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      } else {
        cleanedText = '{"forecasts": []}';
      }
    }

    console.log('Cleaned text for parsing:', cleanedText);

    let forecastResult;
    try {
      forecastResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', cleanedText);
      
      // Fallback: create a basic structure
      forecastResult = {
        forecasts: [{
          category: "general",
          prediction: "Document processed but AI analysis failed to generate proper JSON format",
          confidence_score: 0.5,
          timeframe: "6 months",
          impact_areas: ["general impact"]
        }]
      };
    }

    // Store forecasts in database
    for (const forecast of forecastResult.forecasts) {
      // Ensure confidence_score is within valid range (0.0-1.0)
      const validConfidenceScore = Math.max(0.0, Math.min(1.0, forecast.confidence_score || 0.5));
      
      await query(
        `INSERT INTO forecasts (document_id, category, prediction, confidence_score, timeframe, impact_areas) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          forecast.category,
          forecast.prediction,
          validConfidenceScore,
          forecast.timeframe,
          forecast.impact_areas
        ]
      );
    }

  } catch (error) {
    console.error('Forecast generation error:', error);
  }
}

async function generateMockSentiment(documentId: string) {
  // Generate mock public comments with sentiment
  const mockComments = [
    { text: "This is exactly what our community needs. Great proposal!", sentiment: 0.8, label: "positive" },
    { text: "I have concerns about the traffic impact on our neighborhood.", sentiment: -0.3, label: "negative" },
    { text: "The budget allocation seems reasonable for this project.", sentiment: 0.4, label: "positive" },
    { text: "This will negatively impact our property values.", sentiment: -0.7, label: "negative" },
    { text: "I support this initiative but have questions about implementation.", sentiment: 0.2, label: "neutral" }
  ];

  // Store mock comments in database
  for (let index = 0; index < mockComments.length; index++) {
    const comment = mockComments[index];
    await query(
      `INSERT INTO public_comments (document_id, commenter_name, comment_text, sentiment_score, sentiment_label) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        documentId,
        `Resident ${index + 1}`,
        comment.text,
        comment.sentiment,
        comment.label
      ]
    );
  }
}