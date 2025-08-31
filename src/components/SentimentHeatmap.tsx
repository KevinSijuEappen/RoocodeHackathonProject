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
  positive: 'hsl(var(--primary))',
  neutral: 'hsl(var(--secondary-foreground))',
  negative: 'hsl(var(--destructive))'
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
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
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
    <div className="rounded-lg shadow-sm border" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', borderColor: 'var(--border)'}}>
      <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Public Sentiment Analysis
        </h3>
        <p className="text-sm mt-1" style={{color: 'var(--muted-foreground)'}}>
          Based on {comments.length} public comments
        </p>
      </div>

      <div className="p-6">
        {sentimentData.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{color: 'var(--muted-foreground)'}} />
            <p style={{color: 'var(--muted-foreground)'}}>
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
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="var(--primary)"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={{ fill: 'var(--secondary)' }}
                    contentStyle={{
                      background: "var(--card-background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="sentiment_label" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-background)",
                      borderColor: "var(--border)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment_label as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sample Comments */}
            <div>
              <h4 className="font-medium mb-3">Sample Comments:</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.slice(0, 3).map((comment, index) => (
                  <div key={index} className="p-3 rounded-lg" style={{backgroundColor: 'var(--secondary)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.commenter_name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comment.sentiment_label === 'positive'
                          ? 'bg-green-500/20 text-green-400'
                          : comment.sentiment_label === 'negative'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {comment.sentiment_label}
                      </span>
                    </div>
                    <p className="text-sm" style={{color: 'var(--muted-foreground)'}}>
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