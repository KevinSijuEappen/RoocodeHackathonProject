import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "@/lib/db";

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const zipCode = formData.get('zipCode') as string;
    const interests = JSON.parse(formData.get('interests') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Extract text content
    let content = '';
    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      content = pdfData.text;
    } else {
      content = buffer.toString('utf-8');
    }

    // Save document to database
    const documentResult = await query(
      `INSERT INTO documents (title, content, document_type, zip_code, file_path, processed) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content,
        'uploaded',
        zipCode,
        filepath,
        false
      ]
    );
    
    const documentId = documentResult.rows[0].id;

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const analysisResult = JSON.parse(analysisText || '{"insights": []}');

    // Store insights in database
    for (const insight of analysisResult.insights) {
      await query(
        `INSERT INTO document_insights (document_id, category, summary, impact_level, key_points, action_items) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          insight.category,
          insight.summary,
          insight.impact_level,
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

    const forecastResult = JSON.parse(forecastText || '{"forecasts": []}');

    // Store forecasts in database
    for (const forecast of forecastResult.forecasts) {
      await query(
        `INSERT INTO forecasts (document_id, category, prediction, confidence_score, timeframe, impact_areas) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          documentId,
          forecast.category,
          forecast.prediction,
          forecast.confidence_score,
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