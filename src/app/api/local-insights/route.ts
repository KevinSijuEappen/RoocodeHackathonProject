import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { location, articles } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const articlesText = articles?.map((article: any) => 
      `Title: ${article.title}\nDescription: ${article.description}`
    ).join('\n\n') || '';

    const prompt = `Based on the location ${location.city}, ${location.state}, ${location.country} and recent news articles, provide:

    1. **Local News Outlets & Media Sources:**
       - List 5-7 trusted local news sources
       - Include websites and social media handles
       - Mention local TV/radio stations

    2. **Community Notifications & Alerts:**
       - Important local services and emergency contacts
       - Community bulletin boards and notification systems
       - Local government communication channels

    3. **Area-Specific Insights:**
       - Current local issues and concerns
       - Upcoming community events or town halls
       - Local business and economic updates
       - Weather and safety considerations

    ${articlesText ? `4. **Analysis of Current News:**\n${articlesText}` : ''}

    Format as clear, actionable sections with specific contact information and links where possible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = response.text();

    return NextResponse.json({ insights, location });
  } catch (error) {
    console.error("Local insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate local insights" },
      { status: 500 }
    );
  }
}