"use client";

import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { LogIn, UserPlus, AreaChart } from "lucide-react";

export default function LandingPage() {
  return (
    <SignedOut>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AreaChart className="w-16 h-16 mx-auto mb-6 text-blue-400" />
          <h1 className="text-5xl font-bold mb-4">Area Infograph</h1>
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
