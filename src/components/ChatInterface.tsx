"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";

interface UserProfile {
  zipCode: string;
  interests: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  userProfile: UserProfile;
  selectedDocument: string | null;
}

export default function ChatInterface({ userProfile, selectedDocument }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    initializeConversation();
  }, [selectedDocument]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConversation = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch('/api/chat/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocument,
          userProfile
        })
      });

      const data = await response.json();
      setConversationId(data.conversationId);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI civic assistant. I can help you understand the government document and answer questions about how it might affect you in ${userProfile.zipCode}. What would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversationId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: inputMessage,
          documentId: selectedDocument,
          userProfile
        })
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How will this affect parking in my neighborhood?",
    "What are the budget implications for residents?",
    "When will these changes take effect?",
    "How can I provide input on this proposal?",
    "What are the environmental impacts?",
    "How does this compare to other cities?"
  ];

  return (
    <div className="border rounded-2xl shadow-lg h-[700px] flex flex-col overflow-hidden" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
      {/* Header */}
      <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
            <Bot className="w-5 h-5" style={{color: 'var(--primary-foreground)'}} />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              AI Town Hall Chat
            </h3>
            <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>
              Ask questions about government documents in plain English
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{backgroundColor: 'var(--secondary)'}}>
        {messages.length === 0 && !selectedDocument && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'var(--muted)'}}>
              <Bot className="w-8 h-8" style={{color: 'var(--muted-foreground)'}} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Chat!</h3>
            <p style={{color: 'var(--muted-foreground)'}}>
              Select a document from the dashboard to start asking questions
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`} style={{backgroundColor: message.role === 'user' ? 'var(--primary)' : 'var(--secondary)', color: message.role === 'user' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)'}}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`rounded-2xl p-4 shadow-lg`} style={{backgroundColor: message.role === 'user' ? 'var(--primary)' : 'var(--card-background)', color: message.role === 'user' ? 'var(--primary-foreground)' : 'var(--card-foreground)', border: message.role === 'user' ? 'none' : '1px solid var(--border)'}}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{borderColor: 'var(--border)'}}>
                    <p className="text-xs font-medium mb-2" style={{color: 'var(--muted-foreground)'}}>Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs rounded-lg px-2 py-1 hover:underline"
                          style={{color: 'var(--primary)'}}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{source}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs mt-3 opacity-70" style={{color: 'var(--muted-foreground)'}}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: 'var(--secondary)'}}>
                <Bot className="w-5 h-5" style={{color: 'var(--secondary-foreground)'}} />
              </div>
              <div className="rounded-2xl p-4 shadow-lg border" style={{backgroundColor: 'var(--card-background)', borderColor: 'var(--border)'}}>
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: 'var(--primary)'}}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{animationDelay: '0.1s', backgroundColor: 'var(--primary)'}}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{animationDelay: '0.2s', backgroundColor: 'var(--primary)'}}></div>
                  </div>
                  <span className="text-sm font-medium" style={{color: 'var(--muted-foreground)'}}>AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && selectedDocument && (
        <div className="p-6 border-t" style={{backgroundColor: 'var(--secondary)', borderColor: 'var(--border)'}}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            💡 Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs px-4 py-2 rounded-full hover:bg-secondary transition-all duration-200 border shadow-sm hover:shadow-md"
                style={{backgroundColor: 'var(--card-background)', color: 'var(--card-foreground)', borderColor: 'var(--border)'}}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t" style={{backgroundColor: 'var(--card-background)', borderColor: 'var(--border)'}}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedDocument ? "Ask a question about this document..." : "Select a document first"}
              disabled={!selectedDocument || isLoading}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm transition-all duration-200"
              style={{backgroundColor: 'var(--secondary)', color: 'var(--foreground)', borderColor: 'var(--border)'}}
              rows={2}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !selectedDocument}
            className="px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}