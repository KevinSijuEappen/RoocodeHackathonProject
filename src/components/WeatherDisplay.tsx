"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Gauge, Eye, AlertTriangle, Zap } from "lucide-react";

interface WeatherData {
  location: { city: string; state: string; };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    pressure: number;
    visibility: number;
  };
  forecast: Array<{
    date: string;
    tempMin: number;
    tempMax: number;
    description: string;
    icon: string;
    chanceOfRain: number;
  }>;
  alerts: any[];
}

interface WeatherDisplayProps {
  userProfile?: { zipCode: string; city: string; state: string; };
}

const getWeatherIcon = (icon: string, size: number = 24) => {
  if (icon.includes("sun")) return <Sun className={`w-${size} h-${size} text-yellow-400`} />;
  if (icon.includes("rain")) return <CloudRain className={`w-${size} h-${size} text-blue-400`} />;
  if (icon.includes("snow")) return <CloudSnow className={`w-${size} h-${size} text-blue-200`} />;
  return <Cloud className={`w-${size} h-${size} text-gray-400`} />;
};

export default function WeatherDisplay({ userProfile }: WeatherDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      const fetchWeatherData = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/weather-data?zipCode=${userProfile.zipCode}&city=${userProfile.city}&state=${userProfile.state}`);
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
      fetchWeatherData();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Weather...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  const { current, forecast, location, alerts } = weatherData;

  return (
    <Card style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{location.city}, {location.state}</span>
          {getWeatherIcon(current.icon, 8)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold">{current.temperature}°</div>
          <div className="text-lg" style={{color: 'var(--muted-foreground)'}}>{current.description}</div>
          <div className="text-sm" style={{color: 'var(--muted-foreground)'}}>Feels like {current.feelsLike}°</div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <DetailItem icon={<Wind size={16} />} label="Wind" value={`${current.windSpeed} mph`} />
          <DetailItem icon={<Droplets size={16} />} label="Humidity" value={`${current.humidity}%`} />
          <DetailItem icon={<Gauge size={16} />} label="Pressure" value={`${current.pressure} in`} />
          <DetailItem icon={<Eye size={16} />} label="Visibility" value={`${current.visibility} mi`} />
        </div>
        <div>
          <h4 className="font-semibold mb-2">3-Day Forecast</h4>
          <div className="space-y-2">
            {forecast.map(day => (
              <div key={day.date} className="flex justify-between items-center text-sm">
                <div>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="flex items-center gap-2">
                  {getWeatherIcon(day.icon, 4)}
                  <span>{day.tempMax}° / {day.tempMin}°</span>
                </div>
                <div className="flex items-center gap-1" style={{color: 'var(--primary)'}}>
                  <CloudRain size={14} />
                  {day.chanceOfRain}%
                </div>
              </div>
            ))}
          </div>
        </div>
        {alerts.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--destructive)'}}>
              <AlertTriangle size={16} /> Active Alerts
            </h4>
            <div className="text-sm p-2 rounded-lg" style={{color: 'var(--destructive-foreground)', backgroundColor: 'var(--destructive)'}}>
              {alerts[0].event}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-2">
    <div style={{color: 'var(--muted-foreground)'}}>{icon}</div>
    <div>
      <div style={{color: 'var(--muted-foreground)'}}>{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);