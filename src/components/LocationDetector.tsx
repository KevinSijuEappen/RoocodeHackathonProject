"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface LocationData {
  city: string;
  state: string;
  country: string;
  county: string;
  formatted: string;
  coordinates: { latitude: number; longitude: number };
}

interface LocationDetectorProps {
  onLocationDetected: (location: LocationData) => void;
  currentLocation: LocationData | null;
}

export default function LocationDetector({ onLocationDetected, currentLocation }: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser"));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Send coordinates to our API for reverse geocoding
      const response = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error("Failed to get location details");
      }

      const data = await response.json();
      onLocationDetected(data.location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect location";
      setError(errorMessage);
      console.error("Location detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Current Location</span>
        </div>
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Detecting...
            </>
          ) : (
            "Detect Location"
          )}
        </button>
      </div>

      {currentLocation && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium">{currentLocation.formatted}</p>
          <p>{currentLocation.city}, {currentLocation.state}</p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}