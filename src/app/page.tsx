"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import PersonalizationSetup from "@/components/PersonalizationSetup";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentDashboard from "@/components/DocumentDashboard";
import ChatInterface from "@/components/ChatInterface";
import { Settings, MapPin, Sparkles, LogIn, UserPlus } from "lucide-react";

interface UserProfile {
  zipCode: string;
  city: string;
  state: string;
  interests: string[];
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [profileLoading, setProfileLoading] = useState(true);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  // Load user profile when user is loaded
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-profile');
        const data = await response.json();
        
        if (data.success && data.profile) {
          setUserProfile(data.profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (isLoaded) {
      loadUserProfile();
    }
  }, [user, isLoaded]);

  // Show loading state while Clerk is loading or profile is loading
  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            {!isLoaded ? 'Loading...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Show authentication screen for signed out users
  if (!user) {
    return (
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                Community Transparency Digest
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                AI-powered civic engagement platform
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Get Started
              </h2>
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </button>
                </SignUpButton>
              </div>
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Join thousands of engaged citizens staying informed about local government
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    );
  }

  // Show personalization setup if user hasn't completed profile
  if (!userProfile) {
    return (
      <SignedIn>
        <PersonalizationSetup onComplete={handleProfileComplete} />
      </SignedIn>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Community Transparency Digest
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-300">
                      AI-powered civic engagement for {userProfile.city}, {userProfile.state}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <div className="flex flex-wrap gap-1">
                    {userProfile.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {interest}
                      </span>
                    ))}
                    {userProfile.interests.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{userProfile.interests.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setUserProfile(null)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl",
                      userButtonPopoverActions: "bg-transparent",
                      userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                      userButtonPopoverActionButtonText: "text-gray-700 dark:text-gray-300",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Upload Section */}
        <div className="mb-8">
          <DocumentUpload userProfile={userProfile} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              📊 Document Dashboard
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              💬 AI Town Hall Chat
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'dashboard' && (
            <DocumentDashboard 
              userProfile={userProfile}
              onDocumentSelect={setSelectedDocument}
            />
          )}

          {activeTab === 'chat' && (
            <ChatInterface 
              userProfile={userProfile}
              selectedDocument={selectedDocument}
            />
          )}
        </div>
      </main>
      </div>
    </SignedIn>
  );
}
