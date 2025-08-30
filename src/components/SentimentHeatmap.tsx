"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MessageSquare } from "lucide-react";

interface SentimentData {
  sentiment_label: string;
  count: number;
  percentage: number;
}

interface Comment {
  commenter_name: string;
  comment_text: string;
  sentiment_label: string;
  sentiment_score: number;
}

interface SentimentHeatmapProps {
  documentId: string;
}

const COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444'
};

export default function SentimentHeatmap({ documentId }: SentimentHeatmapProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
  }, [documentId]);

  const fetchSentimentData = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/sentiment`);
      const data = await response.json();
      setSentimentData(data.sentimentData || []);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const pieData = sentimentData.map(item => ({
    name: item.sentiment_label,
    value: item.count,
    percentage: item.percentage
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Public Sentiment Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Based on {comments.length} public comments
        </p>
      </div>

      <div className="p-6">
        {sentimentData.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No public comments available for sentiment analysis
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sentiment_label" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment_label as keyof typeof COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sample Comments */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sample Comments:</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.slice(0, 3).map((comment, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {comment.commenter_name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comment.sentiment_label === 'positive' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : comment.sentiment_label === 'negative'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {comment.sentiment_label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.comment_text.length > 150 
                        ? `${comment.comment_text.substring(0, 150)}...`
                        : comment.comment_text
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}