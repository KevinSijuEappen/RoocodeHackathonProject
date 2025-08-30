"use client";

import { useState, useEffect } from "react";
import { FileText, TrendingUp, MessageSquare, BarChart3, ExternalLink, Mail, Calendar } from "lucide-react";
import SentimentHeatmap from "./SentimentHeatmap";
import ComparativeContext from "./ComparativeContext";
import ForecastScenarios from "./ForecastScenarios";

interface UserProfile {
  zipCode: string;
  interests: string[];
}

interface DocumentInsight {
  id: string;
  category: string;
  summary: string;
  impact_level: number;
  key_points: string[];
  action_items: string[];
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  upload_date: string;
  insights: DocumentInsight[];
}

interface DocumentDashboardProps {
  userProfile: UserProfile;
  onDocumentSelect: (documentId: string) => void;
}

export default function DocumentDashboard({ userProfile, onDocumentSelect }: DocumentDashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [userProfile]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?zipCode=${userProfile.zipCode}&interests=${userProfile.interests.join(',')}`);
      const data = await response.json();
      setDocuments(data.documents || []);
      if (data.documents?.length > 0) {
        setSelectedDocument(data.documents[0]);
        onDocumentSelect(data.documents[0].id);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  };

  const getImpactLabel = (level: number) => {
    if (level >= 4) return 'High Impact';
    if (level >= 3) return 'Medium Impact';
    return 'Low Impact';
  };

  const generateActionButton = (action: string, documentTitle: string) => {
    if (action.toLowerCase().includes('email')) {
      const subject = encodeURIComponent(`Regarding: ${documentTitle}`);
      const body = encodeURIComponent(`Dear Council Member,\n\nI am writing regarding the recent document "${documentTitle}". As a resident of ${userProfile.zipCode}, I would like to express my concerns and provide input on this matter.\n\n[Your comments here]\n\nThank you for your time and consideration.\n\nSincerely,\n[Your name]`);
      return (
        <a
          href={`mailto:?subject=${subject}&body=${body}`}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Mail className="w-4 h-4" />
          Draft Email
        </a>
      );
    }
    
    if (action.toLowerCase().includes('meeting') || action.toLowerCase().includes('hearing')) {
      return (
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </button>
      );
    }
    
    return (
      <button className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
        <ExternalLink className="w-4 h-4" />
        Learn More
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
        </div>
        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your personalized documents...</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Analyzing content for {userProfile.zipCode}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Document List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 Your Personalized Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Documents for <span className="font-semibold text-blue-600 dark:text-blue-400">{userProfile.zipCode}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-8">
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Documents Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload a government document to get started with AI-powered analysis!
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                💡 Try uploading city council minutes, budget proposals, or zoning documents
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocument(doc);
                    onDocumentSelect(doc.id);
                  }}
                  className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedDocument?.id === doc.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg'
                      : 'border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedDocument?.id === doc.id
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'
                        }`}>
                          <FileText className={`w-6 h-6 ${
                            selectedDocument?.id === doc.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{doc.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs">
                              {doc.document_type}
                            </span>
                            •
                            <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {doc.insights.map((insight) => (
                              <span
                                key={insight.id}
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getImpactColor(insight.impact_level)}`}
                              >
                                {insight.category} • {getImpactLabel(insight.impact_level)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`transition-all duration-300 ${
                      selectedDocument?.id === doc.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Document Details */}
      {selectedDocument && (
        <div className="space-y-8">
          {/* Personalized Impact Lens */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🎯 Personalized Impact Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    How this affects you and your community
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              {selectedDocument.insights.map((insight, index) => (
                <div key={insight.id} className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b ${
                    insight.impact_level >= 4 ? 'from-red-400 to-red-600' :
                    insight.impact_level >= 3 ? 'from-yellow-400 to-orange-500' :
                    'from-green-400 to-emerald-500'
                  }`}></div>
                  <div className="pl-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-xl text-gray-900 dark:text-white capitalize flex items-center gap-2">
                        <span className="text-2xl">
                          {insight.category === 'housing' ? '🏠' :
                           insight.category === 'transport' ? '🚌' :
                           insight.category === 'environment' ? '🌱' :
                           insight.category === 'budget' ? '💰' :
                           insight.category === 'safety' ? '🚔' :
                           insight.category === 'education' ? '📚' :
                           insight.category === 'health' ? '🏥' :
                           insight.category === 'parks' ? '🌳' :
                           insight.category === 'business' ? '💼' :
                           insight.category === 'utilities' ? '⚡' : '📄'}
                        </span>
                        {insight.category}
                      </h4>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getImpactColor(insight.impact_level)}`}>
                        {getImpactLabel(insight.impact_level)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{insight.summary}</p>
                    
                    {/* Key Points */}
                    <div className="mb-6">
                      <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        🔍 Key Points:
                      </h5>
                      <div className="grid gap-3">
                        {insight.key_points.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        🚀 What You Can Do:
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {insight.action_items.map((action, actionIndex) => (
                          <div key={actionIndex}>
                            {generateActionButton(action, selectedDocument.title)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {index < selectedDocument.insights.length - 1 && (
                    <div className="mt-8 border-b border-gray-200/50 dark:border-gray-700/50"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Charts and Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <SentimentHeatmap documentId={selectedDocument.id} />
            <ComparativeContext 
              documentId={selectedDocument.id} 
              zipCode={userProfile.zipCode}
              categories={selectedDocument.insights.map(i => i.category)}
            />
          </div>

          {/* Forecast Scenarios */}
          <ForecastScenarios 
            documentId={selectedDocument.id} 
            userProfile={userProfile}
          />
        </div>
      )}
    </div>
  );
}