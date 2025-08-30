"use client";

import { useState } from "react";
import { Scale, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface LocationData {
  city: string;
  state: string;
  country: string;
  county: string;
  formatted: string;
  coordinates: { latitude: number; longitude: number };
}

interface LegalStatutesProps {
  location: LocationData | null;
}

export default function LegalStatutes({ location }: LegalStatutesProps) {
  const [statutes, setStatutes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Housing & Rental Laws",
    "Traffic & Parking",
    "Business Licenses",
    "Noise Ordinances",
    "Property & Zoning",
    "Public Safety",
    "Environmental Regulations"
  ];

  const fetchStatutes = async (category?: string) => {
    if (!location) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/legal-statutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, category }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatutes(data.statutes);
        setIsExpanded(true);
      } else {
        console.error("Failed to fetch legal statutes");
      }
    } catch (error) {
      console.error("Legal statutes error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!location) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-gray-500">
          <Scale className="w-5 h-5" />
          <span>Detect your location to view local legal information</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            <h3 className="font-semibold">Legal Statutes & Regulations</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {location.city}, {location.state}
        </p>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedCategory("");
                fetchStatutes();
              }}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === "" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  fetchStatutes(category);
                }}
                className={`px-3 py-1 rounded text-sm ${
                  selectedCategory === category 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading legal information...</span>
            </div>
          )}

          {statutes && !isLoading && (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm">{statutes}</div>
            </div>
          )}

          {!statutes && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <p>Select a category or click "All Categories" to view legal information for your area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}