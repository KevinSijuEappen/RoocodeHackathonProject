"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle, Loader2, AlertCircle, Sparkles, Target, ArrowRight } from "lucide-react";

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
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    // Automatically detect location when component mounts
    detectLocation();
  }, []);

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

  const handleComplete = () => {
    if (location && selectedInterests.length > 0) {
      onComplete({
        zipCode: location.zipCode,
        city: location.city,
        state: location.state,
        interests: selectedInterests
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Welcome to Community Transparency Digest
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let's personalize your civic engagement experience with AI-powered insights
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-6">
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                <MapPin className="w-6 h-6" />
                {step > 1 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className={`w-24 h-2 rounded-full transition-all duration-500 ${
                step >= 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Step 1: Location Detection */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                📍 Detecting your location...
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
                We're automatically detecting your location to find relevant local government documents and provide context specific to your area.
              </p>
              
              {isDetectingLocation && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                    Detecting location...
                  </span>
                </div>
              )}

              {locationError && (
                <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-red-800 dark:text-red-200 font-bold text-lg mb-2">Location Detection Failed</h3>
                  <p className="text-red-600 dark:text-red-300 text-sm mb-4">{locationError}</p>
                  <button
                    onClick={detectLocation}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {location && (
                <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-green-800 dark:text-green-200 font-bold text-lg mb-2">Location Detected!</h3>
                  <p className="text-green-600 dark:text-green-300 font-medium">
                    {location.city}, {location.state} {location.zipCode}
                  </p>
                </div>
              )}

              {location && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue to Interests
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 What interests you most?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
                  Select the areas you care about. We'll highlight relevant information in government documents for <span className="font-semibold text-blue-600 dark:text-blue-400">{location?.city}, {location?.state}</span>
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
                      className={`group relative p-6 rounded-2xl border-2 text-left font-medium transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                          isSelected 
                            ? `bg-gradient-to-br ${interest.color} shadow-lg` 
                            : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                        }`}>
                          {interest.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors ${
                            isSelected 
                              ? 'text-blue-700 dark:text-blue-300' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {interest.label}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
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
                  className="px-8 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={selectedInterests.length === 0}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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