import { NextRequest, NextResponse } from "next/server";

const getMockComparativeData = () => {
  return [
    // Housing data
    { city: 'San Francisco', state: 'CA', zip_code: '94102', category: 'housing', metric_name: 'Median Home Price', metric_value: 1200000, year: 2024, source: 'US Census' },
    { city: 'Oakland', state: 'CA', zip_code: '94601', category: 'housing', metric_name: 'Median Home Price', metric_value: 800000, year: 2024, source: 'US Census' },
    { city: 'San Jose', state: 'CA', zip_code: '95110', category: 'housing', metric_name: 'Median Home Price', metric_value: 1100000, year: 2024, source: 'US Census' },
    
    // Transportation data
    { city: 'San Francisco', state: 'CA', zip_code: '94102', category: 'transport', metric_name: 'Public Transit Usage %', metric_value: 34.2, year: 2024, source: 'DOT' },
    { city: 'Oakland', state: 'CA', zip_code: '94601', category: 'transport', metric_name: 'Public Transit Usage %', metric_value: 18.5, year: 2024, source: 'DOT' },
    { city: 'San Jose', state: 'CA', zip_code: '95110', category: 'transport', metric_name: 'Public Transit Usage %', metric_value: 12.3, year: 2024, source: 'DOT' },
    
    // Budget data
    { city: 'San Francisco', state: 'CA', zip_code: '94102', category: 'budget', metric_name: 'Per Capita Spending', metric_value: 15420, year: 2024, source: 'City Budget' },
    { city: 'Oakland', state: 'CA', zip_code: '94601', category: 'budget', metric_name: 'Per Capita Spending', metric_value: 8950, year: 2024, source: 'City Budget' },
    { city: 'San Jose', state: 'CA', zip_code: '95110', category: 'budget', metric_name: 'Per Capita Spending', metric_value: 7200, year: 2024, source: 'City Budget' },

    // Environment data
    { city: 'San Francisco', state: 'CA', zip_code: '94102', category: 'environment', metric_name: 'Air Quality Index', metric_value: 45, year: 2024, source: 'EPA' },
    { city: 'Oakland', state: 'CA', zip_code: '94601', category: 'environment', metric_name: 'Air Quality Index', metric_value: 52, year: 2024, source: 'EPA' },
    { city: 'San Jose', state: 'CA', zip_code: '95110', category: 'environment', metric_name: 'Air Quality Index', metric_value: 48, year: 2024, source: 'EPA' }
  ];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const categories = searchParams.get('categories')?.split(',') || [];

    const allComparativeData = getMockComparativeData();
    
    // Filter by categories and add user city flag
    const filteredData = allComparativeData
      .filter(item => categories.includes(item.category))
      .map(item => ({
        ...item,
        isUserCity: item.zip_code === zipCode
      }));

    return NextResponse.json({
      success: true,
      comparativeData: filteredData
    });

  } catch (error) {
    console.error('Error fetching comparative data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparative data' },
      { status: 500 }
    );
  }
}