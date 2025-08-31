import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!zipCode || !city || !state) {
      return NextResponse.json(
        { error: 'Location parameters required' },
        { status: 400 }
      );
    }

    // Ensure OpenWeather API key is set and not placeholder
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweather_api_key_here') {
      throw new Error('OpenWeather API key is missing or not configured. Please set OPENWEATHER_API_KEY in your environment.');
    }

    // Get coordinates for the location
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!geoResponse.ok) {
      const errorBody = await geoResponse.text();
      throw new Error(`Failed to get coordinates: ${geoResponse.status} ${geoResponse.statusText} - ${errorBody}`);
    }
    
    const geoData = await geoResponse.json();
    if (geoData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geoData[0];

    // Get multiple data sources in parallel
    const [
      weatherResponse, 
      airQualityResponse, 
      forecastResponse,
      uvResponse
    ] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
      ),
    ]);

    const weatherData = await weatherResponse.json();
    const airQualityData = await airQualityResponse.json();
    const forecastData = await forecastResponse.json();
    const uvData = await uvResponse.json();

    // Enhanced AQI processing with EPA standards
    const aqi = airQualityData.list[0].main.aqi;
    const components = airQualityData.list[0].components;
    
    // Calculate US EPA AQI for PM2.5 (more accurate than OpenWeather's simple 1-5 scale)
    const calculatePM25AQI = (pm25: number) => {
      if (pm25 <= 12.0) return Math.round(((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0);
      if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
      if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
      if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
      if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
      return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
    };

    const epaAQI = calculatePM25AQI(components.pm2_5);
    const getAQICategory = (aqi: number) => {
      if (aqi <= 50) return { label: 'Good', color: 'green', description: 'Air quality is satisfactory' };
      if (aqi <= 100) return { label: 'Moderate', color: 'yellow', description: 'Air quality is acceptable for most people' };
      if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'orange', description: 'Sensitive individuals may experience problems' };
      if (aqi <= 200) return { label: 'Unhealthy', color: 'red', description: 'Everyone may experience health effects' };
      if (aqi <= 300) return { label: 'Very Unhealthy', color: 'purple', description: 'Health alert: everyone may experience serious effects' };
      return { label: 'Hazardous', color: 'maroon', description: 'Emergency conditions: entire population affected' };
    };

    const aqiCategory = getAQICategory(epaAQI);

    // Enhanced UV Index processing
    const getUVCategory = (uvi: number) => {
      if (uvi <= 2) return { label: 'Low', color: 'green', description: 'No protection needed' };
      if (uvi <= 5) return { label: 'Moderate', color: 'yellow', description: 'Some protection required' };
      if (uvi <= 7) return { label: 'High', color: 'orange', description: 'Protection essential' };
      if (uvi <= 10) return { label: 'Very High', color: 'red', description: 'Extra protection needed' };
      return { label: 'Extreme', color: 'purple', description: 'Avoid sun exposure' };
    };

    const uvCategory = getUVCategory(uvData.value || 0);

    // Process enhanced forecast data
    const processedForecast = forecastData.list.map((item: any) => ({
      date: new Date(item.dt * 1000),
      temp: Math.round(item.temp.day),
      tempMin: Math.round(item.temp.min),
      tempMax: Math.round(item.temp.max),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.humidity,
      windSpeed: Math.round(item.wind_speed),
      windDirection: item.wind_deg,
      pressure: item.pressure,
      cloudiness: item.clouds,
      precipitation: item.rain || 0
    }));

    // Get historical weather trends (last 5 days for comparison)
    const historicalPromises = [];
    for (let i = 1; i <= 5; i++) {
      const timestamp = Math.floor((Date.now() - (i * 24 * 60 * 60 * 1000)) / 1000);
      historicalPromises.push(
        fetch(
          `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
        ).catch(() => null) // Graceful fallback if historical data fails
      );
    }

    const historicalResponses = await Promise.all(historicalPromises);
    const historicalData = [];
    
    for (const response of historicalResponses) {
      if (response && response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          historicalData.push({
            date: new Date(data.data[0].dt * 1000),
            temp: Math.round(data.data[0].temp),
            humidity: data.data[0].humidity,
            pressure: data.data[0].pressure
          });
        }
      }
    }

    // Calculate trends
    const calculateTrend = (current: number, historical: number[]) => {
      if (historical.length === 0) return 'stable';
      const avg = historical.reduce((a, b) => a + b, 0) / historical.length;
      const diff = current - avg;
      if (Math.abs(diff) < 2) return 'stable';
      return diff > 0 ? 'rising' : 'falling';
    };

    const tempTrend = calculateTrend(
      weatherData.temp,
      historicalData.map(d => d.temp)
    );
    const pressureTrend = calculateTrend(
      weatherData.pressure,
      historicalData.map(d => d.pressure)
    );

    return NextResponse.json({
      success: true,
      location: {
        city,
        state,
        zipCode,
        coordinates: { lat, lon }
      },
      current: {
        temperature: Math.round(weatherData.temp),
        feelsLike: Math.round(weatherData.feels_like),
        humidity: weatherData.humidity,
        pressure: weatherData.pressure,
        windSpeed: Math.round(weatherData.wind_speed),
        windDirection: weatherData.wind_deg,
        visibility: Math.round(weatherData.visibility / 1609.34),
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        cloudiness: weatherData.clouds,
        sunrise: new Date(weatherData.sunrise * 1000),
        sunset: new Date(weatherData.sunset * 1000)
      },
      airQuality: {
        aqi: epaAQI,
        category: aqiCategory,
        components: {
          co: Math.round(components.co),
          no2: Math.round(components.no2),
          o3: Math.round(components.o3),
          pm2_5: Math.round(components.pm2_5 * 10) / 10,
          pm10: Math.round(components.pm10 * 10) / 10,
          so2: Math.round(components.so2)
        },
        healthRecommendations: getHealthRecommendations(epaAQI)
      },
      uvIndex: {
        value: Math.round((uvData.value || 0) * 10) / 10,
        category: uvCategory
      },
      forecast: processedForecast,
      trends: {
        temperature: tempTrend,
        pressure: pressureTrend
      },
      historical: historicalData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getHealthRecommendations(aqi: number): string[] {
  if (aqi <= 50) {
    return [
      "Air quality is good - enjoy outdoor activities",
      "No health precautions needed"
    ];
  } else if (aqi <= 100) {
    return [
      "Air quality is acceptable for most people",
      "Sensitive individuals should consider limiting prolonged outdoor exertion"
    ];
  } else if (aqi <= 150) {
    return [
      "Sensitive groups should reduce outdoor activities",
      "Consider wearing a mask if you have respiratory conditions",
      "Keep windows closed and use air purifiers indoors"
    ];
  } else if (aqi <= 200) {
    return [
      "Everyone should limit outdoor activities",
      "Wear N95 masks when going outside",
      "Keep windows closed and avoid outdoor exercise"
    ];
  } else if (aqi <= 300) {
    return [
      "Avoid all outdoor activities",
      "Stay indoors with air purifiers running",
      "Seek medical attention if experiencing symptoms"
    ];
  } else {
    return [
      "Emergency conditions - stay indoors",
      "Avoid all outdoor exposure",
      "Contact healthcare providers immediately if experiencing symptoms"
    ];
  }
}