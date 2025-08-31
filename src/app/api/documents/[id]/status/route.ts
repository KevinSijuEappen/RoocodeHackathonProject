import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: documentId } = await params;

    // Get document status
    const documentResult = await query(
      `SELECT id, title, processed, upload_date FROM documents WHERE id = $1`,
      [documentId]
    );

    if (documentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = documentResult.rows[0];

    // Get insights count
    const insightsResult = await query(
      `SELECT COUNT(*) as count FROM document_insights WHERE document_id = $1`,
      [documentId]
    );

    // Get forecasts count
    const forecastsResult = await query(
      `SELECT COUNT(*) as count FROM forecasts WHERE document_id = $1`,
      [documentId]
    );

    // Get comments count
    const commentsResult = await query(
      `SELECT COUNT(*) as count FROM public_comments WHERE document_id = $1`,
      [documentId]
    );

    return NextResponse.json({
      id: document.id,
      title: document.title,
      processed: document.processed,
      upload_date: document.upload_date,
      insights_count: parseInt(insightsResult.rows[0].count),
      forecasts_count: parseInt(forecastsResult.rows[0].count),
      comments_count: parseInt(commentsResult.rows[0].count),
      status: document.processed ? 'completed' : 'processing'
    });

  } catch (error) {
    console.error('Document status error:', error);
    return NextResponse.json(
      { error: 'Failed to get document status' },
      { status: 500 }
    );
  }
}