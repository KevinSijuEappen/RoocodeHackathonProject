import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { documentId, userProfile } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Create a new conversation in the database
    const result = await query(
      'INSERT INTO chat_conversations (document_id) VALUES ($1) RETURNING id',
      [documentId]
    );

    const conversationId = result.rows[0].id;

    return NextResponse.json({
      success: true,
      conversationId
    });

  } catch (error) {
    console.error('Error initializing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to initialize conversation' },
      { status: 500 }
    );
  }
}