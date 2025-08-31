"use client";

import { useState } from "react";
import { MapPin, Loader2, Search } from "lucide-react";

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
  const [zipCode, setZipCode] = useState("");

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      fetchLocationDetails({ latitude, longitude });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect location";
      setError(errorMessage);
      console.error("Location detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleZipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim()) {
      setError("Please enter a valid zip code.");
      return;
    }
    setIsDetecting(true);
    setError(null);
    try {
      fetchLocationDetails({ zipCode });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get location from zip code";
      setError(errorMessage);
      console.error("Zip code error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const fetchLocationDetails = async (params: { latitude?: number; longitude?: number; zipCode?: string }) => {
    const response = await fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to get location details");
    }

    const data = await response.json();
    onLocationDetected(data.location);
  };

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-xl" style={{backgroundColor: 'var(--card-background)', borderColor: 'var(--border)'}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6" style={{color: 'var(--primary)'}} />
          <span className="font-semibold text-lg">Your Location</span>
        </div>
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-60 transition-colors"
          style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Detecting...</span>
            </>
          ) : (
            "Auto-Detect"
          )}
        </button>
      </div>

      <div className="text-center text-sm" style={{color: 'var(--muted-foreground)'}}>OR</div>

      <form onSubmit={handleZipCodeSubmit} className="flex gap-2">
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter Zip Code"
          className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          style={{backgroundColor: 'var(--secondary)', borderColor: 'var(--border)'}}
        />
        <button
          type="submit"
          disabled={isDetecting || !zipCode.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-60 transition-colors"
          style={{backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)'}}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </form>

      {currentLocation && (
        <div className="text-sm text-center p-3 rounded-lg" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
          <p className="font-semibold text-base">{currentLocation.formatted}</p>
          <p>{currentLocation.city}, {currentLocation.state}</p>
        </div>
      )}

      {error && (
        <div className="text-sm p-3 rounded-lg text-center" style={{backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)'}}>
          {error}
        </div>
      )}
    </div>
  );
}