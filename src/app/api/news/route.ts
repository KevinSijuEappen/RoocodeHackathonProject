import { NextRequest, NextResponse } from "next/server";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json(
      { error: "Location parameter is required." },
      { status: 400 }
    );
  }

  if (!NEWS_API_KEY) {
    return NextResponse.json(
      { error: "News API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${location}&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: "Failed to fetch news." },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news." },
      { status: 500 }
    );
  }
}