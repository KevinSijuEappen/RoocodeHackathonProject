import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Use OpenCage Geocoding API to get location details
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;

      return NextResponse.json({
        success: true,
        location: {
          zipCode: components.postcode,
          city: components.city || components.town || components.village,
          state: components.state,
          county: components.county,
          country: components.country,
          formatted: result.formatted
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Location detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect location' },
      { status: 500 }
    );
  }
}