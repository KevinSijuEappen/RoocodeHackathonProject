"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Clock, Target, AlertTriangle } from "lucide-react";

interface Forecast {
  id: string;
  category: string;
  prediction: string;
  confidence_score: number;
  timeframe: string;
  impact_areas: string[];
}

interface ForecastScenariosProps {
  documentId: string;
}

export default function ForecastScenarios({ documentId }: ForecastScenariosProps) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
  }, [documentId]);

  const fetchForecasts = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/forecasts`);
      const data = await response.json();
      setForecasts(data.forecasts || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getTimeframeIcon = (timeframe: string) => {
    if (timeframe.includes('month')) return <Clock className="w-4 h-4" />;
    if (timeframe.includes('year')) return <Target className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Future Forecast Scenarios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Predicted impacts based on historical patterns and AI analysis
        </p>
      </div>

      <div className="p-6">
        {forecasts.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No forecast scenarios available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {forecasts.map((forecast) => (
              <div key={forecast.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      {getTimeframeIcon(forecast.timeframe)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {forecast.category} Impact
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {forecast.timeframe}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(forecast.confidence_score)}`}>
                          {getConfidenceLabel(forecast.confidence_score)} ({Math.round(forecast.confidence_score * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {forecast.confidence_score < 0.6 && (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {forecast.prediction}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Areas of Impact:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {forecast.impact_areas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Prediction Confidence</span>
                    <span>{Math.round(forecast.confidence_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        forecast.confidence_score >= 0.8 
                          ? 'bg-green-500' 
                          : forecast.confidence_score >= 0.6 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${forecast.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}