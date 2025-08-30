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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 h-[700px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              💬 AI Town Hall Chat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ask questions about government documents in plain English
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
        {messages.length === 0 && !selectedDocument && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Chat!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Select a document from the dashboard to start asking questions
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                  : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-200'
              }`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                  : 'bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-600/50'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300/50 dark:border-gray-600/50">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">📄 Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-600/50 rounded-lg px-2 py-1">
                          <FileText className="w-3 h-3" />
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </div>
              <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && selectedDocument && (
        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            💡 Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs px-4 py-2 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedDocument ? "Ask a question about this document..." : "Select a document first"}
              disabled={!selectedDocument || isLoading}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white resize-none backdrop-blur-sm shadow-sm transition-all duration-200"
              rows={2}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !selectedDocument}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}