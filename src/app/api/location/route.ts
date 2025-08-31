import { NextResponse } from 'next/server';

// A simple in-memory cache for zip code lookups
const zipCodeCache = new Map<string, { city: string; state: string }>();

// A mock database of zip codes to cities and states
const zipCodeDatabase: { [key: string]: { city: string; state: string } } = {
  '90210': { city: 'Beverly Hills', state: 'CA' },
  '10001': { city: 'New York', state: 'NY' },
  '60601': { city: 'Chicago', state: 'IL' },
  '77001': { city: 'Houston', state: 'TX' },
  '80202': { city: 'Denver', state: 'CO' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ success: false, error: 'A valid 5-digit zip code is required.' }, { status: 400 });
  }

  if (zipCodeCache.has(zip)) {
    return NextResponse.json({
      success: true,
      location: { zipCode: zip, ...zipCodeCache.get(zip) },
    });
  }

  const location = zipCodeDatabase[zip];

  if (location) {
    zipCodeCache.set(zip, location);
    return NextResponse.json({
      success: true,
      location: { zipCode: zip, ...location },
    });
  } else {
    return NextResponse.json({ success: false, error: 'Zip code not found.' }, { status: 404 });
  }
}