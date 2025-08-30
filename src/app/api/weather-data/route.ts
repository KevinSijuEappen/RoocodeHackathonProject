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

    // Get coordinates for the location
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Failed to get coordinates');
    }
    
    const geoData = await geoResponse.json();
    if (geoData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geoData[0];

    // Get current weather and air quality
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
      )
    ]);

    const weatherData = await weatherResponse.json();
    const airQualityData = await airQualityResponse.json();

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
    );
    const forecastData = await forecastResponse.json();

    // Process air quality index
    const aqi = airQualityData.list[0].main.aqi;
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['green', 'yellow', 'orange', 'red', 'purple'];

    // Process forecast data
    const processedForecast = forecastData.list.slice(0, 8).map((item: any) => ({
      date: new Date(item.dt * 1000),
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed)
    }));

    return NextResponse.json({
      success: true,
      location: {
        city,
        state,
        zipCode,
        coordinates: { lat, lon }
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: Math.round(weatherData.wind.speed),
        windDirection: weatherData.wind.deg,
        visibility: Math.round(weatherData.visibility / 1609.34), // Convert to miles
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      },
      airQuality: {
        aqi,
        label: aqiLabels[aqi - 1],
        color: aqiColors[aqi - 1],
        components: {
          co: airQualityData.list[0].components.co,
          no2: airQualityData.list[0].components.no2,
          o3: airQualityData.list[0].components.o3,
          pm2_5: airQualityData.list[0].components.pm2_5,
          pm10: airQualityData.list[0].components.pm10
        }
      },
      forecast: processedForecast
    });

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}