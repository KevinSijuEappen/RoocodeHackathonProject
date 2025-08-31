import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const topic = searchParams.get('topic') || 'local government';

    if (!city || !state) {
      return NextResponse.json(
        { error: 'Location parameters required' },
        { status: 400 }
      );
    }

    // Search for recent news articles about the topic in the area
    const newsQuery = `"${city}" "${state}" ${topic} government policy`;
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsQuery)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`
    );

    let newsArticles = [];
    if (newsResponse.ok) {
      const newsData = await newsResponse.json();
      newsArticles = newsData.articles || [];
    }

    // Get Reddit discussions (using Reddit API)
    let redditPosts = [];
    try {
      const redditQuery = `${city} ${state} ${topic}`;
      const redditResponse = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(redditQuery)}&sort=new&limit=10&t=week`,
        {
          headers: {
            'User-Agent': 'CommunityTransparencyDigest/1.0'
          }
        }
      );
      
      if (redditResponse.ok) {
        const redditData = await redditResponse.json();
        redditPosts = redditData.data?.children?.map((post: any) => ({
          title: post.data.title,
          text: post.data.selftext,
          score: post.data.score,
          num_comments: post.data.num_comments,
          created: new Date(post.data.created_utc * 1000),
          url: `https://reddit.com${post.data.permalink}`
        })) || [];
      }
    } catch (error) {
      console.log('Reddit API unavailable, continuing without Reddit data');
    }

    // Combine all text content for sentiment analysis
    const textContent = [
      ...newsArticles.map(article => `${article.title} ${article.description || ''}`),
      ...redditPosts.map(post => `${post.title} ${post.text || ''}`)
    ].filter(text => text.trim().length > 0);

    if (textContent.length === 0) {
      return NextResponse.json({
        success: true,
        sentiment: {
          overall: 'neutral',
          score: 0,
          confidence: 0.5,
          breakdown: {
            positive: 33,
            neutral: 34,
            negative: 33
          }
        },
        sources: {
          news: 0,
          social: 0,
          total: 0
        },
        topics: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // Use Gemini AI for advanced sentiment analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const sentimentPrompt = `
    Analyze the sentiment of public opinion about "${topic}" in ${city}, ${state} based on the following text content from news articles and social media posts.

    Content to analyze:
    ${textContent.slice(0, 10).join('\n\n---\n\n')}

    Please provide a detailed sentiment analysis in the following JSON format:
    {
      "overall_sentiment": "positive|negative|neutral",
      "confidence_score": 0.0-1.0,
      "sentiment_breakdown": {
        "positive": percentage,
        "neutral": percentage,
        "negative": percentage
      },
      "key_themes": ["theme1", "theme2", "theme3"],
      "emotional_indicators": ["anger", "hope", "concern", "satisfaction"],
      "public_concerns": ["concern1", "concern2", "concern3"],
      "positive_aspects": ["positive1", "positive2"],
      "trending_topics": ["topic1", "topic2", "topic3"],
      "sentiment_score": -1.0 to 1.0 (negative to positive),
      "volatility": "low|medium|high",
      "summary": "Brief summary of public sentiment"
    }

    Focus on civic and governmental topics. Be objective and balanced in your analysis.
    `;

    const result = await model.generateContent(sentimentPrompt);
    const response = result.response;
    let sentimentAnalysis;

    try {
      const responseText = response.text();
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sentimentAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing sentiment analysis:', error);
      // Fallback sentiment analysis
      sentimentAnalysis = {
        overall_sentiment: 'neutral',
        confidence_score: 0.6,
        sentiment_breakdown: { positive: 30, neutral: 40, negative: 30 },
        key_themes: ['local government', 'community issues'],
        emotional_indicators: ['concern'],
        public_concerns: ['government transparency'],
        positive_aspects: ['community engagement'],
        trending_topics: [topic],
        sentiment_score: 0,
        volatility: 'medium',
        summary: 'Mixed public sentiment with moderate engagement'
      };
    }

    // Calculate additional metrics
    const totalSources = newsArticles.length + redditPosts.length;
    const newsEngagement = newsArticles.reduce((sum, article) => sum + (article.urlToImage ? 1 : 0), 0);
    const socialEngagement = redditPosts.reduce((sum, post) => sum + post.score + post.num_comments, 0);

    // Analyze temporal trends
    const recentContent = textContent.filter((_, index) => {
      const sourceDate = index < newsArticles.length 
        ? new Date(newsArticles[index].publishedAt)
        : redditPosts[index - newsArticles.length]?.created;
      return sourceDate && (Date.now() - sourceDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
    });

    const trendDirection = recentContent.length > textContent.length * 0.7 ? 'increasing' : 
                          recentContent.length < textContent.length * 0.3 ? 'decreasing' : 'stable';

    return NextResponse.json({
      success: true,
      location: { city, state },
      topic,
      sentiment: {
        overall: sentimentAnalysis.overall_sentiment,
        score: sentimentAnalysis.sentiment_score,
        confidence: sentimentAnalysis.confidence_score,
        breakdown: sentimentAnalysis.sentiment_breakdown,
        volatility: sentimentAnalysis.volatility,
        summary: sentimentAnalysis.summary
      },
      themes: {
        key: sentimentAnalysis.key_themes || [],
        emotional: sentimentAnalysis.emotional_indicators || [],
        concerns: sentimentAnalysis.public_concerns || [],
        positives: sentimentAnalysis.positive_aspects || [],
        trending: sentimentAnalysis.trending_topics || []
      },
      sources: {
        news: newsArticles.length,
        social: redditPosts.length,
        total: totalSources,
        engagement: {
          news: newsEngagement,
          social: socialEngagement
        }
      },
      trends: {
        direction: trendDirection,
        recent_activity: recentContent.length,
        total_activity: textContent.length
      },
      sample_content: {
        news: newsArticles.slice(0, 3).map(article => ({
          title: article.title,
          source: article.source?.name,
          published: article.publishedAt,
          url: article.url
        })),
        social: redditPosts.slice(0, 3).map(post => ({
          title: post.title,
          score: post.score,
          comments: post.num_comments,
          created: post.created
        }))
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}