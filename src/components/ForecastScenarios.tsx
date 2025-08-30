"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Clock, Target, AlertTriangle, Cloud, Thermometer, Wind, Eye } from "lucide-react";

interface Forecast {
  id: string;
  category: string;
  prediction: string;
  confidence_score: number;
  timeframe: string;
  impact_areas: string[];
}

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  airQuality: {
    aqi: number;
    label: string;
    color: string;
    components: {
      pm2_5: number;
      pm10: number;
      o3: number;
      no2: number;
    };
  };
  forecast: Array<{
    date: Date;
    temp: number;
    description: string;
    humidity: number;
    windSpeed: number;
  }>;
}

interface ForecastScenariosProps {
  documentId: string;
  userProfile?: {
    zipCode: string;
    city: string;
    state: string;
  };
}

export default function ForecastScenarios({ documentId, userProfile }: ForecastScenariosProps) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'policy' | 'environmental'>('policy');

  useEffect(() => {
    fetchForecasts();
    if (userProfile) {
      fetchWeatherData();
    }
  }, [documentId, userProfile]);

  const fetchForecasts = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/forecasts`);
      const data = await response.json();
      setForecasts(data.forecasts || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    }
  };

  const fetchWeatherData = async () => {
    if (!userProfile) return;
    
    try {
      const response = await fetch(
        `/api/weather-data?zipCode=${userProfile.zipCode}&city=${userProfile.city}&state=${userProfile.state}`
      );
      const data = await response.json();
      if (data.success) {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
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

  const getAQIColor = (aqi: number) => {
    const colors = ['text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];
    return colors[aqi - 1] || 'text-gray-600';
  };

  const getAQIBgColor = (aqi: number) => {
    const colors = ['bg-green-100 dark:bg-green-900/20', 'bg-yellow-100 dark:bg-yellow-900/20', 'bg-orange-100 dark:bg-orange-900/20', 'bg-red-100 dark:bg-red-900/20', 'bg-purple-100 dark:bg-purple-900/20'];
    return colors[aqi - 1] || 'bg-gray-100 dark:bg-gray-900/20';
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Forecast & Environmental Data
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time data and predictions for {userProfile?.city}, {userProfile?.state}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'policy'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📋 Policy Forecasts
          </button>
          <button
            onClick={() => setActiveTab('environmental')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'environmental'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            🌍 Environmental Data
          </button>
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'policy' && (
          <div>
            {forecasts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Policy Forecasts</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI analysis will generate forecasts based on document content
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {forecasts.map((forecast) => (
                  <div key={forecast.id} className="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                          {getTimeframeIcon(forecast.timeframe)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                            {forecast.category} Impact
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {forecast.timeframe}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(forecast.confidence_score)}`}>
                              {getConfidenceLabel(forecast.confidence_score)} ({Math.round(forecast.confidence_score * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {forecast.confidence_score < 0.6 && (
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {forecast.prediction}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        🎯 Areas of Impact:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {forecast.impact_areas.map((area, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">Prediction Confidence</span>
                        <span className="font-bold">{Math.round(forecast.confidence_score * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            forecast.confidence_score >= 0.8 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : forecast.confidence_score >= 0.6 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-600'
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
        )}

        {activeTab === 'environmental' && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading environmental data...</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-6">
                {/* Current Weather */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Cloud className="w-6 h-6" />
                    Current Weather
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.current.temperature}°F</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Temperature</div>
                      <div className="text-xs text-gray-500">Feels like {weatherData.current.feelsLike}°F</div>
                    </div>
                    <div className="text-center">
                      <Wind className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.current.windSpeed}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Wind (mph)</div>
                    </div>
                    <div className="text-center">
                      <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.current.humidity}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Humidity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">☁️</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">{weatherData.current.description}</div>
                    </div>
                  </div>
                </div>

                {/* Air Quality */}
                <div className={`rounded-2xl p-6 border ${getAQIBgColor(weatherData.airQuality.aqi)} border-opacity-50`}>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🌬️ Air Quality Index
                  </h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className={`text-3xl font-bold ${getAQIColor(weatherData.airQuality.aqi)}`}>
                        {weatherData.airQuality.aqi}/5
                      </div>
                      <div className={`text-lg font-semibold ${getAQIColor(weatherData.airQuality.aqi)}`}>
                        {weatherData.airQuality.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <div>PM2.5: {weatherData.airQuality.components.pm2_5.toFixed(1)} μg/m³</div>
                        <div>PM10: {weatherData.airQuality.components.pm10.toFixed(1)} μg/m³</div>
                        <div>O₃: {weatherData.airQuality.components.o3.toFixed(1)} μg/m³</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        weatherData.airQuality.aqi <= 2 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        weatherData.airQuality.aqi <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${(weatherData.airQuality.aqi / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* 24-Hour Forecast */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    📅 24-Hour Forecast
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weatherData.forecast.slice(0, 4).map((item, index) => (
                      <div key={index} className="text-center bg-white/50 dark:bg-gray-700/50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {new Date(item.date).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{item.temp}°F</div>
                        <div className="text-xs text-gray-500 capitalize mt-1">{item.description}</div>
                        <div className="text-xs text-gray-500 mt-1">💨 {item.windSpeed} mph</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Weather Data Unavailable</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Unable to fetch environmental data for your location
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}