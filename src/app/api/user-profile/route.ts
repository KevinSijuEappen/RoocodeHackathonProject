import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const result = await query(
      'SELECT * FROM user_profiles WHERE clerk_user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        profile: null
      });
    }

    const profile = result.rows[0];
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        zipCode: profile.zip_code,
        city: profile.city,
        state: profile.state,
        interests: profile.interests || []
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { zipCode, city, state, interests } = await request.json();

    if (!zipCode || !city || !state || !interests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await query(
      'SELECT id FROM user_profiles WHERE clerk_user_id = $1',
      [userId]
    );

    let result;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      result = await query(
        `UPDATE user_profiles 
         SET zip_code = $2, city = $3, state = $4, interests = $5, updated_at = NOW()
         WHERE clerk_user_id = $1
         RETURNING *`,
        [userId, zipCode, city, state, interests]
      );
    } else {
      // Create new profile
      result = await query(
        `INSERT INTO user_profiles (clerk_user_id, zip_code, city, state, interests)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, zipCode, city, state, interests]
      );
    }

    const profile = result.rows[0];
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        zipCode: profile.zip_code,
        city: profile.city,
        state: profile.state,
        interests: profile.interests || []
      }
    });

  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json(
      { error: 'Failed to save user profile' },
      { status: 500 }
    );
  }
}