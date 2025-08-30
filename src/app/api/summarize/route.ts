import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  const body = await request.json();
  const textToSummarize = body.text;

  if (!textToSummarize) {
    return NextResponse.json(
      { error: "No text provided for summarization." },
      { status: 400 }
    );
  }

  try {
    // Summarize the text using the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarize the following text from a news article in a few bullet points, focusing on the key impacts for a local resident: ${textToSummarize}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error summarizing text:", error);
    return NextResponse.json(
      { error: "Failed to summarize the text." },
      { status: 500 }
    );
  }
}