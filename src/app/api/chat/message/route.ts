import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Function to get document content from database
const getDocumentContent = async (documentId: string) => {
  try {
    const result = await query(
      'SELECT title, content FROM documents WHERE id = $1',
      [documentId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      title: result.rows[0].title,
      content: result.rows[0].content
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conversationId, message, documentId, userProfile } = await request.json();

    if (!conversationId || !message || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get document content
    const document = await getDocumentContent(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Create context-aware prompt
    const fullPrompt = `You are a helpful AI civic assistant helping residents understand government documents. 

Document Title: ${document.title}
Document Content: ${document.content}

User Profile:
- ZIP Code: ${userProfile.zipCode}
- Interests: ${userProfile.interests.join(', ')}

Instructions:
1. Answer questions about the document in plain English
2. Focus on how the content affects residents in ${userProfile.zipCode}
3. Highlight information relevant to their interests: ${userProfile.interests.join(', ')}
4. Cite specific parts of the document when possible
5. Suggest actionable steps when appropriate
6. Keep responses concise but informative

Always be helpful, accurate, and focused on civic engagement.

User Question: ${message}

Please provide a helpful response:`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const assistantResponse = response.text() || "I'm sorry, I couldn't process your question.";

    // Extract potential sources (simplified - in a real app, you'd do more sophisticated source extraction)
    const sources = [];
    if (assistantResponse.toLowerCase().includes('document') || assistantResponse.toLowerCase().includes('proposal')) {
      sources.push(document.title);
    }

    // Store messages in database
    await query(
      'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', message]
    );
    
    await query(
      'INSERT INTO chat_messages (conversation_id, role, content, sources) VALUES ($1, $2, $3, $4)',
      [conversationId, 'assistant', assistantResponse, sources]
    );

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      sources
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}