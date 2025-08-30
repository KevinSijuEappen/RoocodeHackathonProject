import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { location, category } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Provide important legal statutes and regulations for residents of ${location.city}, ${location.state}, ${location.country}. 
    ${category ? `Focus specifically on ${category} laws.` : ''}
    
    Include:
    1. Key local ordinances and regulations
    2. Recent legal changes or updates
    3. Important compliance requirements for residents
    4. Contact information for relevant local authorities
    5. Penalties for common violations
    
    Format the response as a structured list with clear categories and actionable information.
    Focus on practical information that residents need to know.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const statutes = response.text();

    return NextResponse.json({ statutes, location });
  } catch (error) {
    console.error("Legal statutes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal information" },
      { status: 500 }
    );
  }
}