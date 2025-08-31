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

    // For now, return empty array as shares functionality isn't implemented yet
    // This prevents 404 errors while the feature is being developed
    return NextResponse.json({
      pending_shares: [],
      count: 0
    });

  } catch (error) {
    console.error('Shares pending error:', error);
    return NextResponse.json(
      { error: 'Failed to get pending shares' },
      { status: 500 }
    );
  }
}
