import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    let locationQuery = zipCode ? zipCode : `${city},${state}`;

    if (!locationQuery) {
      return NextResponse.json({ error: 'Location parameters required' }, { status: 400 });
    }

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_weather_api_key_here') {
      throw new Error('WeatherAPI key is missing or not configured. Please set WEATHER_API_KEY in your environment.');
    }

    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${locationQuery}&days=3&aqi=yes&alerts=yes`
    );

    if (!weatherResponse.ok) {
      const errorBody = await weatherResponse.text();
      throw new Error(`Failed to get weather data: ${weatherResponse.status} ${weatherResponse.statusText} - ${errorBody}`);
    }

    const data = await weatherResponse.json();

    const { location, current, forecast } = data;

    const getAQICategory = (aqi: number) => {
      if (aqi <= 50) return { label: 'Good', color: 'green', description: 'Air quality is satisfactory' };
      if (aqi <= 100) return { label: 'Moderate', color: 'yellow', description: 'Air quality is acceptable' };
      if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'orange', description: 'Sensitive individuals may have issues' };
      if (aqi <= 200) return { label: 'Unhealthy', color: 'red', description: 'Everyone may experience health effects' };
      if (aqi <= 300) return { label: 'Very Unhealthy', color: 'purple', description: 'Health alert: serious effects' };
      return { label: 'Hazardous', color: 'maroon', description: 'Emergency conditions' };
    };

    const getUVCategory = (uvi: number) => {
      if (uvi <= 2) return { label: 'Low', color: 'green', description: 'No protection needed' };
      if (uvi <= 5) return { label: 'Moderate', color: 'yellow', description: 'Some protection required' };
      if (uvi <= 7) return { label: 'High', color: 'orange', description: 'Protection essential' };
      if (uvi <= 10) return { label: 'Very High', color: 'red', description: 'Extra protection needed' };
      return { label: 'Extreme', color: 'purple', description: 'Avoid sun exposure' };
    };

    const processedForecast = forecast.forecastday.map((day: any) => ({
      date: day.date,
      tempMin: Math.round(day.day.mintemp_f),
      tempMax: Math.round(day.day.maxtemp_f),
      description: day.day.condition.text,
      icon: day.day.condition.icon,
      humidity: day.day.avghumidity,
      windSpeed: Math.round(day.day.maxwind_mph),
      chanceOfRain: day.day.daily_chance_of_rain,
    }));

    return NextResponse.json({
      success: true,
      location: {
        city: location.name,
        state: location.region,
        country: location.country,
        zipCode: zipCode,
        coordinates: { lat: location.lat, lon: location.lon }
      },
      current: {
        temperature: Math.round(current.temp_f),
        feelsLike: Math.round(current.feelslike_f),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_mph),
        windDirection: current.wind_dir,
        description: current.condition.text,
        icon: current.condition.icon,
        cloudiness: current.cloud,
        pressure: current.pressure_in,
        visibility: current.vis_miles,
      },
      airQuality: {
        aqi: current.air_quality['us-epa-index'],
        category: getAQICategory(current.air_quality['us-epa-index']),
        components: {
          co: Math.round(current.air_quality.co),
          no2: Math.round(current.air_quality.no2),
          o3: Math.round(current.air_quality.o3),
          pm2_5: Math.round(current.air_quality.pm2_5 * 10) / 10,
          pm10: Math.round(current.air_quality.pm10 * 10) / 10,
          so2: Math.round(current.air_quality.so2)
        },
      },
      uvIndex: {
        value: Math.round(current.uv),
        category: getUVCategory(current.uv),
      },
      forecast: processedForecast,
      alerts: data.alerts.alert,
      lastUpdated: current.last_updated,
    });

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}