import { NextRequest, NextResponse } from "next/server";

const getMockComments = (documentId: string) => {
  const uploadedComments = global.mockComments || [];
  const seedComments = [
    {
      id: 'comment-1',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      commenter_name: 'Sarah Johnson',
      comment_text: 'This housing development is exactly what our community needs. We desperately need more affordable housing options.',
      sentiment_score: 0.8,
      sentiment_label: 'positive'
    },
    {
      id: 'comment-2',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      commenter_name: 'Mike Chen',
      comment_text: 'I support affordable housing but am concerned about the traffic impact on our already congested streets.',
      sentiment_score: 0.1,
      sentiment_label: 'neutral'
    },
    {
      id: 'comment-3',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      commenter_name: 'Lisa Rodriguez',
      comment_text: 'This project will destroy the character of our neighborhood and create parking nightmares.',
      sentiment_score: -0.7,
      sentiment_label: 'negative'
    },
    {
      id: 'comment-4',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      commenter_name: 'David Kim',
      comment_text: 'Great to see the developer addressing parking concerns. This is a well-planned project.',
      sentiment_score: 0.6,
      sentiment_label: 'positive'
    },
    {
      id: 'comment-5',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      commenter_name: 'Emma Wilson',
      comment_text: 'We need housing but not at the expense of our quality of life. Too dense for this area.',
      sentiment_score: -0.4,
      sentiment_label: 'negative'
    }
  ];

  return [...uploadedComments, ...seedComments].filter(comment => 
    comment.document_id === documentId
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const comments = getMockComments(documentId);

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: comments.filter(c => c.sentiment_label === 'positive').length,
      neutral: comments.filter(c => c.sentiment_label === 'neutral').length,
      negative: comments.filter(c => c.sentiment_label === 'negative').length
    };

    const total = comments.length;
    const sentimentData = Object.entries(sentimentCounts).map(([label, count]) => ({
      sentiment_label: label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    return NextResponse.json({
      success: true,
      sentimentData,
      comments: comments.slice(0, 10) // Return first 10 comments
    });

  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    );
  }
}