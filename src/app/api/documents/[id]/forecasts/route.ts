import { NextRequest, NextResponse } from "next/server";

const getMockForecasts = (documentId: string) => {
  const uploadedForecasts = global.mockForecasts || [];
  const seedForecasts = [
    {
      id: 'forecast-1',
      document_id: '550e8400-e29b-41d4-a716-446655440001',
      category: 'housing',
      prediction: 'If approved, expect 15-20% increase in local foot traffic and 10% increase in property values within 0.5 miles',
      confidence_score: 0.75,
      timeframe: '18 months',
      impact_areas: ['property values', 'local business', 'traffic']
    },
    {
      id: 'forecast-2',
      document_id: '550e8400-e29b-41d4-a716-446655440002',
      category: 'transport',
      prediction: 'Bike lane expansion likely to increase cycling by 25% and reduce car trips by 8% in target corridors',
      confidence_score: 0.68,
      timeframe: '12 months',
      impact_areas: ['traffic reduction', 'air quality', 'public health']
    },
    {
      id: 'forecast-3',
      document_id: '550e8400-e29b-41d4-a716-446655440003',
      category: 'environment',
      prediction: 'Wetland restoration expected to improve local water quality by 30% and increase bird species diversity by 40%',
      confidence_score: 0.82,
      timeframe: '24 months',
      impact_areas: ['water quality', 'wildlife habitat', 'flood protection']
    }
  ];

  return [...uploadedForecasts, ...seedForecasts].filter(forecast => 
    forecast.document_id === documentId
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const forecasts = getMockForecasts(documentId);

    return NextResponse.json({
      success: true,
      forecasts
    });

  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecasts' },
      { status: 500 }
    );
  }
}