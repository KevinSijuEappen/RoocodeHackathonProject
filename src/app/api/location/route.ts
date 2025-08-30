import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Use reverse geocoding to get location details
    const geocodeResponse = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
    );
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json(
        { error: "Unable to determine location" },
        { status: 400 }
      );
    }

    const locationData = geocodeData.results[0];
    const components = locationData.components;
    
    const locationInfo = {
      city: components.city || components.town || components.village || "",
      state: components.state || components.province || "",
      country: components.country || "",
      county: components.county || "",
      formatted: locationData.formatted,
      coordinates: { latitude, longitude }
    };

    return NextResponse.json({ location: locationInfo });
  } catch (error) {
    console.error("Location detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect location" },
      { status: 500 }
    );
  }
}