import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const interests = searchParams.get('interests')?.split(',') || [];

    // Fetch documents from database
    let documentsQuery = `
      SELECT d.*, 
             json_agg(
               json_build_object(
                 'id', di.id,
                 'category', di.category,
                 'summary', di.summary,
                 'impact_level', di.impact_level,
                 'key_points', di.key_points,
                 'action_items', di.action_items
               )
             ) FILTER (WHERE di.id IS NOT NULL) as insights
      FROM documents d
      LEFT JOIN document_insights di ON d.id = di.document_id
      WHERE d.processed = true
    `;
    
    const params: any[] = [];
    
    if (zipCode) {
      documentsQuery += ` AND d.zip_code = $${params.length + 1}`;
      params.push(zipCode);
    }
    
    if (interests.length > 0) {
      documentsQuery += ` AND di.category = ANY($${params.length + 1})`;
      params.push(interests);
    }
    
    documentsQuery += ` GROUP BY d.id ORDER BY d.upload_date DESC`;

    const result = await query(documentsQuery, params);
    
    const documents = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      document_type: row.document_type,
      upload_date: row.upload_date,
      zip_code: row.zip_code,
      processed: row.processed,
      insights: row.insights || []
    }));

    return NextResponse.json({
      success: true,
      documents
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}