"use client";

import { useState, useEffect } from "react";
import { FileText, TrendingUp, MessageSquare, BarChart3, ExternalLink, Mail, Calendar } from "lucide-react";
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
  category: string;
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
    if (level >= 4) return 'bg-red-500/20 text-red-400';
    if (level >= 3) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
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
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
        >
          <Mail className="w-4 h-4" />
          Draft Email
        </a>
      );
    }
    
    if (action.toLowerCase().includes('meeting') || action.toLowerCase().includes('hearing')) {
      const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Public Hearing: ${documentTitle}`)}&details=${encodeURIComponent(`Public hearing regarding the document: ${documentTitle}`)}&location=${encodeURIComponent(userProfile.zipCode)}`;
      return (
        <a
          href={gCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </a>
      );
    }
    
    return (
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(action)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        Learn More
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-foreground border-t-transparent"></div>
          </div>
        </div>
        <span className="text-lg font-medium text-muted-foreground">Loading your personalized documents...</span>
        <span className="text-sm text-muted-foreground mt-2">Analyzing content for {userProfile.zipCode}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Document List */}
      <div className="border rounded-2xl shadow-lg" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
        <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
              <FileText className="w-5 h-5" style={{color: 'var(--primary-foreground)'}} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Your Personalized Dashboard
              </h2>
              <p style={{color: 'var(--muted-foreground)'}}>
                Documents for <span className="font-semibold" style={{color: 'var(--primary)'}}>{userProfile.zipCode}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest, index) => (
              <span key={index} className="px-3 py-1 text-sm rounded-full font-medium" style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}>
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'var(--muted)'}}>
                <FileText className="w-10 h-10" style={{color: 'var(--muted-foreground)'}} />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
              <p className="mb-6" style={{color: 'var(--muted-foreground)'}}>
                Upload a government document to get started with AI-powered analysis!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocument(doc);
                    onDocumentSelect(doc.id);
                  }}
                  className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedDocument?.id === doc.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  style={{backgroundColor: selectedDocument?.id === doc.id ? 'var(--primary-)' : 'var(--card-background)', borderColor: selectedDocument?.id === doc.id ? 'var(--primary)' : 'var(--border)'}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300`} style={{backgroundColor: selectedDocument?.id === doc.id ? 'var(--primary)' : 'var(--secondary)'}}>
                          <FileText className={`w-6 h-6`} style={{color: selectedDocument?.id === doc.id ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'}} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{doc.title}</h3>
                          <p className="text-sm mb-2 flex items-center gap-2" style={{color: 'var(--muted-foreground)'}}>
                            <span className="px-2 py-1 rounded-full text-xs" style={{backgroundColor: 'var(--secondary)'}}>
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
                      selectedDocument?.id === doc.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
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
          <div className="border rounded-2xl shadow-lg" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
            <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--accent)'}}>
                  <TrendingUp className="w-5 h-5" style={{color: 'var(--accent-foreground)'}}/>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Personalized Impact Analysis
                  </h3>
                  <p style={{color: 'var(--muted-foreground)'}}>
                    How this affects you and your community
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {selectedDocument.insights.map((insight, index) => (
                <div key={insight.id} className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${
                    insight.impact_level >= 4 ? 'bg-red-500' :
                    insight.impact_level >= 3 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg capitalize flex items-center gap-2">
                        {insight.category}
                      </h4>
                      <span className={`px-4 py-1 rounded-full text-sm font-bold ${getImpactColor(insight.impact_level)}`}>
                        {getImpactLabel(insight.impact_level)}
                      </span>
                    </div>
                    <p className="mb-4" style={{color: 'var(--muted-foreground)'}}>{insight.summary}</p>
                    
                    <div className="mb-4">
                      <h5 className="font-bold mb-2">
                        Key Points:
                      </h5>
                      <div className="grid gap-2">
                        {insight.key_points.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start gap-3 p-3 rounded-xl" style={{backgroundColor: 'var(--secondary)'}}>
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{backgroundColor: 'var(--primary)'}}></div>
                            <span style={{color: 'var(--secondary-foreground)'}}>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold">
                        What You Can Do:
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
                    <div className="mt-6 border-b" style={{borderColor: 'var(--border)'}}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}