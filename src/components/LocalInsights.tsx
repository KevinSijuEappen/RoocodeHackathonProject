"use client";

import { useState, useEffect } from "react";
import { Newspaper, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface LocationData {
  city: string;
  state: string;
  country: string;
  county: string;
  formatted: string;
  coordinates: { latitude: number; longitude: number };
}

interface Article {
  title: string;
  description: string;
  url: string;
  content: string;
  summary?: string;
}

interface LocalInsightsProps {
  location: LocationData | null;
  articles: Article[];
}

export default function LocalInsights({ location, articles }: LocalInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchInsights = async () => {
    if (!location) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/local-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, articles }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
        setIsExpanded(true);
      } else {
        console.error("Failed to fetch local insights");
      }
    } catch (error) {
      console.error("Local insights error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch insights when location changes
  useEffect(() => {
    if (location && !insights) {
      fetchInsights();
    }
  }, [location]);

  if (!location) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-gray-500">
          <Newspaper className="w-5 h-5" />
          <span>Detect your location to view local news outlets and community information</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            <h3 className="font-semibold">Local News & Community Insights</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInsights}
              disabled={isLoading}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {isLoading ? "Updating..." : "Refresh"}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {location.city}, {location.state}
        </p>
      </div>

      {isExpanded && (
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Gathering local insights...</span>
            </div>
          )}

          {insights && !isLoading && (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm">{insights}</div>
            </div>
          )}

          {!insights && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Refresh" to get local news outlets and community information for your area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}