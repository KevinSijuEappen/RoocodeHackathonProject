import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    // Check if document is processed (mock database lookup)
    const documents = global.mockDocuments || [];
    const document = documents.find((doc: any) => doc.id === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: document.processed || false,
      documentId
    });

  } catch (error) {
    console.error('Error checking document status:', error);
    return NextResponse.json(
      { error: 'Failed to check document status' },
      { status: 500 }
    );
  }
}