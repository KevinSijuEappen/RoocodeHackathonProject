"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle, Loader2, AlertCircle, AreaChart, Target, ArrowRight } from "lucide-react";

interface UserProfile {
  zipCode: string;
  city: string;
  state: string;
  interests: string[];
}

interface PersonalizationSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const INTEREST_OPTIONS = [
  { id: 'housing', label: 'Housing & Development', icon: '🏠', color: 'from-orange-400 to-red-500' },
  { id: 'transport', label: 'Transportation', icon: '🚌', color: 'from-blue-400 to-cyan-500' },
  { id: 'environment', label: 'Environment', icon: '🌱', color: 'from-green-400 to-emerald-500' },
  { id: 'business', label: 'Business & Economy', icon: '💼', color: 'from-purple-400 to-indigo-500' },
  { id: 'education', label: 'Education', icon: '📚', color: 'from-yellow-400 to-orange-500' },
  { id: 'safety', label: 'Public Safety', icon: '🚔', color: 'from-red-400 to-pink-500' },
  { id: 'budget', label: 'Budget & Finance', icon: '💰', color: 'from-green-400 to-teal-500' },
  { id: 'health', label: 'Public Health', icon: '🏥', color: 'from-pink-400 to-rose-500' },
  { id: 'parks', label: 'Parks & Recreation', icon: '🌳', color: 'from-emerald-400 to-green-500' },
  { id: 'utilities', label: 'Utilities', icon: '⚡', color: 'from-yellow-400 to-amber-500' }
];

export default function PersonalizationSetup({ onComplete }: PersonalizationSetupProps) {
  const [location, setLocation] = useState<{zipCode: string, city: string, state: string} | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [manualZip, setManualZip] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  useEffect(() => {
    if (!isManualEntry) {
      detectLocation();
    }
  }, [isManualEntry]);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError('');

    try {
      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Convert coordinates to location details
      const response = await fetch('/api/location/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();
      
      if (data.success && data.location) {
        setLocation({
          zipCode: data.location.zipCode,
          city: data.location.city,
          state: data.location.state
        });
        
        // Automatically fetch government data for this location
        fetchGovernmentData(data.location);
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationError('Unable to detect location automatically. Please ensure location access is enabled.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleManualZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualZip.match(/^\d{5}$/)) {
      setLocationError('Please enter a valid 5-digit zip code.');
      return;
    }
    setIsDetectingLocation(true);
    setLocationError('');
    try {
      const response = await fetch(`/api/location?zip=${manualZip}`);
      const data = await response.json();
      if (data.success) {
        setLocation({
          zipCode: data.location.zipCode,
          city: data.location.city,
          state: data.location.state,
        });
        fetchGovernmentData(data.location);
      } else {
        throw new Error(data.error || 'Invalid zip code');
      }
    } catch (error: any) {
      setLocationError(error.message);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const fetchGovernmentData = async (locationData: {zipCode: string, city: string, state: string}) => {
    try {
      console.log('Fetching government data for:', locationData);
      const response = await fetch('/api/government-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      const result = await response.json();
      console.log('Government data fetch result:', result);
      
      if (!response.ok) {
        console.error('Government data fetch failed:', result);
      }
    } catch (error) {
      console.error('Failed to fetch government data:', error);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    if (location && selectedInterests.length > 0) {
      try {
        // Save profile to database
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zipCode: location.zipCode,
            city: location.city,
            state: location.state,
            interests: selectedInterests
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onComplete(data.profile);
        } else {
          console.error('Failed to save profile');
          // Still proceed with local profile
          onComplete({
            zipCode: location.zipCode,
            city: location.city,
            state: location.state,
            interests: selectedInterests
          });
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        // Still proceed with local profile
        onComplete({
          zipCode: location.zipCode,
          city: location.city,
          state: location.state,
          interests: selectedInterests
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'var(--primary)'}}>
            <AreaChart className="w-10 h-10" style={{color: 'var(--primary-foreground)'}} />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
            Welcome to Area Infograph
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{color: 'var(--muted-foreground)'}}>
            Let's personalize your civic engagement experience with AI-powered insights
          </p>
        </div>

        <div className="rounded-3xl shadow-2xl border p-8 md:p-12" style={{backgroundColor: 'var(--card-background)', borderColor: 'var(--border)'}}>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-6">
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300`} style={{backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--secondary)', color: step >= 1 ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'}}>
                <MapPin className="w-6 h-6" />
                {step > 1 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className={`w-24 h-2 rounded-full transition-all duration-500`} style={{backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--secondary)'}} />
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300`} style={{backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--secondary)', color: step >= 2 ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'}}>
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Step 1: Location Detection */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                {isManualEntry ? 'Enter Your Zip Code' : 'Detecting your location...'}
              </h2>
              <p className="text-lg mb-12 max-w-2xl mx-auto" style={{color: 'var(--muted-foreground)'}}>
                {isManualEntry
                  ? 'Enter your 5-digit zip code to find relevant local information.'
                  : "We're automatically detecting your location to find relevant local government documents and provide context specific to your area."}
              </p>

              {!isManualEntry && isDetectingLocation && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{backgroundColor: 'var(--primary)'}}>
                      <Loader2 className="w-8 h-8 animate-spin" style={{color: 'var(--primary-foreground)'}} />
                    </div>
                  </div>
                  <span className="text-lg font-medium" style={{color: 'var(--muted-foreground)'}}>
                    Detecting location...
                  </span>
                </div>
              )}

              {isManualEntry && !location && (
                <form onSubmit={handleManualZipSubmit} className="max-w-sm mx-auto mb-8">
                  <input
                    type="text"
                    value={manualZip}
                    onChange={(e) => setManualZip(e.target.value)}
                    placeholder="e.g., 90210"
                    className="w-full px-4 py-3 text-lg text-center rounded-lg border"
                  />
                  <button type="submit" className="w-full mt-4 px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white">
                    Find Location
                  </button>
                </form>
              )}

              {locationError && (
                <div className="max-w-md mx-auto p-6 border rounded-2xl shadow-lg" style={{backgroundColor: 'var(--destructive)', borderColor: 'var(--destructive-foreground)'}}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--destructive-foreground)'}}>
                      <AlertCircle className="w-6 h-6" style={{color: 'var(--destructive)'}} />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{color: 'var(--destructive-foreground)'}}>Location Error</h3>
                  <p className="text-sm mb-4" style={{color: 'var(--destructive-foreground)'}}>{locationError}</p>
                  <button
                    onClick={() => (isManualEntry ? setLocationError('') : detectLocation())}
                    className="w-full px-4 py-2 rounded-lg transition-colors font-medium"
                    style={{backgroundColor: 'var(--destructive-foreground)', color: 'var(--destructive)'}}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {location && (
                <div className="max-w-md mx-auto p-6 border rounded-2xl shadow-lg mb-8" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent-foreground)'}}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--accent-foreground)'}}>
                      <CheckCircle className="w-6 h-6" style={{color: 'var(--accent)'}} />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{color: 'var(--accent-foreground)'}}>Location Detected!</h3>
                  <p className="font-medium" style={{color: 'var(--accent-foreground)'}}>
                    {location.city}, {location.state} {location.zipCode}
                  </p>
                </div>
              )}

              {location && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-3 mx-auto px-8 py-4 rounded-xl font-semibold shadow-lg transition-all"
                  style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                >
                  Continue to Interests
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {!location && (
                <div className="mt-8 text-center">
                  <button onClick={() => setIsManualEntry(!isManualEntry)} className="text-sm text-gray-400 hover:text-white">
                    {isManualEntry ? 'Detect Location Automatically' : 'Or Enter Zip Code Manually'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  What interests you most?
                </h2>
                <p className="text-lg max-w-2xl mx-auto mb-4" style={{color: 'var(--muted-foreground)'}}>
                  Select the areas you care about. We'll highlight relevant information for <span className="font-semibold" style={{color: 'var(--primary)'}}>{location?.city}, {location?.state}</span>
                </p>
                <div className="text-sm" style={{color: 'var(--muted-foreground)'}}>
                  Selected: {selectedInterests.length} topics
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.id)}
                      className={`group relative p-6 rounded-2xl border-2 text-left font-medium transition-all duration-300`}
                      style={{borderColor: isSelected ? 'var(--primary)' : 'var(--border)', backgroundColor: isSelected ? 'var(--primary-)' : 'var(--card-background)'}}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300`} style={{backgroundColor: isSelected ? 'var(--primary)' : 'var(--secondary)', color: isSelected ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'}}>
                          {interest.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors`} style={{color: isSelected ? 'var(--primary)' : 'var(--foreground)'}}>
                            {interest.label}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                            <CheckCircle className="w-4 h-4" style={{color: 'var(--primary-foreground)'}} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 font-medium transition-colors"
                  style={{color: 'var(--muted-foreground)'}}
                >
                  ← Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={selectedInterests.length === 0}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
                  style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
                >
                  Get Started ({selectedInterests.length} selected)
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}