"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import PersonalizationSetup from "@/components/PersonalizationSetup";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentDashboard from "@/components/DocumentDashboard";
import ChatInterface from "@/components/ChatInterface";
import WeatherDisplay from "@/components/WeatherDisplay";
import ForecastScenarios from "@/components/ForecastScenarios";
import SentimentHeatmap from "@/components/SentimentHeatmap";
import ComparativeContext from "@/components/ComparativeContext";
import { Settings, MapPin, Sparkles, LogIn, UserPlus, LayoutDashboard, MessageSquare } from "lucide-react";

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

  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading Your Community Digest...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <SignedOut>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h1 className="text-5xl font-bold mb-4">Community Digest</h1>
            <p className="text-xl text-gray-400 mb-8">Your AI-powered civic engagement hub.</p>
            <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-lg border border-gray-700 space-y-4">
              <SignInButton mode="modal">
                <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all">
                  <LogIn /> Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all">
                  <UserPlus /> Create Account
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    );
  }

  if (!userProfile) {
    return (
      <SignedIn>
        <PersonalizationSetup onComplete={handleProfileComplete} />
      </SignedIn>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold">Community Digest</h1>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setUserProfile(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DocumentUpload userProfile={userProfile} />
            <nav className="flex space-x-2 bg-card border rounded-xl p-2">
              <TabButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </TabButton>
              <TabButton isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={16} /> AI Chat
              </TabButton>
            </nav>
            <div>
              {activeTab === 'dashboard' && <DocumentDashboard userProfile={userProfile} onDocumentSelect={setSelectedDocument} />}
              {activeTab === 'chat' && <ChatInterface userProfile={userProfile} selectedDocument={selectedDocument} />}
            </div>
          </div>
          <aside className="lg:col-span-1 space-y-8">
            <WeatherDisplay userProfile={userProfile} />
            {selectedDocument && (
              <>
                <ForecastScenarios documentId={selectedDocument} />
                <SentimentHeatmap documentId={selectedDocument} />
                <ComparativeContext documentId={selectedDocument} zipCode={userProfile.zipCode} categories={userProfile.interests} />
              </>
            )}
          </aside>
        </main>
      </div>
    </SignedIn>
  );
}

const TabButton = ({ isActive, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
      isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);
