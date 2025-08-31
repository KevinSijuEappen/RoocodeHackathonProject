"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Clock, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PolicyForecast {
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
  const [forecasts, setForecasts] = useState<PolicyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecasts = async () => {
      setLoading(true);
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
    fetchForecasts();
  }, [documentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Forecasts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (forecasts.length === 0) {
    return (
        <Card style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
            <CardHeader>
                <CardTitle>No Policy Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
                <p>AI analysis will generate forecasts based on document content.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp />
          Policy Forecasts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {forecasts.map((forecast) => (
          <div key={forecast.id} style={{backgroundColor: 'var(--secondary)'}} className="p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Target size={16} /> {forecast.category} Impact
                </h4>
                <p className="text-sm ml-8" style={{color: 'var(--muted-foreground)'}}>{forecast.timeframe}</p>
              </div>
              <div className={`text-sm font-bold px-2 py-1 rounded-md ${getConfidenceColor(forecast.confidence_score)}`}>
                {Math.round(forecast.confidence_score * 100)}%
              </div>
            </div>
            <p className="mt-2" style={{color: 'var(--foreground)'}}>{forecast.prediction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {forecast.impact_areas.map(area => (
                    <span key={area} className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>{area}</span>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500/20 text-green-400';
    if (score >= 0.6) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
};