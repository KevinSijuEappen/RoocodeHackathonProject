"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface ComparativeData {
  city: string;
  metric_name: string;
  metric_value: number;
  isUserCity: boolean;
}

interface ComparativeContextProps {
  documentId: string;
  zipCode: string;
  categories: string[];
}

export default function ComparativeContext({ documentId, zipCode, categories }: ComparativeContextProps) {
  const [comparativeData, setComparativeData] = useState<ComparativeData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparativeData();
  }, [documentId, zipCode, categories]);

  const fetchComparativeData = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/comparative?zipCode=${zipCode}&categories=${categories.join(',')}`);
      const data = await response.json();
      setComparativeData(data.comparativeData || []);
      if (data.comparativeData?.length > 0) {
        setSelectedMetric(data.comparativeData[0].metric_name);
      }
    } catch (error) {
      console.error('Error fetching comparative data:', error);
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

  const metrics = [...new Set(comparativeData.map(item => item.metric_name))];
  const currentMetricData = comparativeData.filter(item => item.metric_name === selectedMetric);
  
  const userCityData = currentMetricData.find(item => item.isUserCity);
  const otherCities = currentMetricData.filter(item => !item.isUserCity);
  const averageValue = otherCities.length > 0 
    ? otherCities.reduce((sum, item) => sum + item.metric_value, 0) / otherCities.length 
    : 0;

  const getComparisonInsight = () => {
    if (!userCityData || otherCities.length === 0) return null;
    
    const userValue = userCityData.metric_value;
    const difference = ((userValue - averageValue) / averageValue) * 100;
    const isHigher = difference > 0;
    
    return {
      difference: Math.abs(difference),
      isHigher,
      text: `Your city ${isHigher ? 'spends' : 'saves'} ${Math.abs(difference).toFixed(1)}% ${isHigher ? 'more' : 'less'} than nearby cities`
    };
  };

  const insight = getComparisonInsight();

  return (
    <div className="rounded-lg shadow-sm border" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', borderColor: 'var(--border)'}}>
      <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Comparative Context
        </h3>
        <p className="text-sm mt-1" style={{color: 'var(--muted-foreground)'}}>
          How your area compares to nearby cities
        </p>
      </div>

      <div className="p-6">
        {comparativeData.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{color: 'var(--muted-foreground)'}} />
            <p style={{color: 'var(--muted-foreground)'}}>
              No comparative data available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metric Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Metric:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{backgroundColor: 'var(--secondary)', borderColor: 'var(--border)'}}
              >
                {metrics.map((metric) => (
                  <option key={metric} value={metric}>
                    {metric}
                  </option>
                ))}
              </select>
            </div>

            {/* Insight Card */}
            {insight && (
              <div className={`p-4 rounded-lg border ${
                insight.isHigher
                  ? 'bg-destructive/10 border-destructive/20'
                  : 'bg-green-500/10 border-green-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  {insight.isHigher ? (
                    <TrendingUp className="w-5 h-5 text-destructive" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  )}
                  <p className={`font-medium ${
                    insight.isHigher
                      ? 'text-destructive'
                      : 'text-green-400'
                  }`}>
                    {insight.text}
                  </p>
                </div>
              </div>
            )}

            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentMetricData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="city"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    cursor={{ fill: 'var(--secondary)' }}
                    contentStyle={{
                      background: "var(--card-background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }}
                    formatter={(value: number) => [
                      selectedMetric.includes('$') || selectedMetric.includes('Price') || selectedMetric.includes('Spending')
                        ? `$${value.toLocaleString()}`
                        : selectedMetric.includes('%')
                        ? `${value}%`
                        : value.toLocaleString(),
                      selectedMetric
                    ]}
                  />
                  <Bar
                    dataKey="metric_value"
                    radius={[4, 4, 0, 0]}
                  >
                    {currentMetricData.map((entry) => (
                      <Cell key={entry.city} fill={entry.isUserCity ? 'var(--primary)' : 'var(--secondary-foreground)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{borderColor: 'var(--border)'}}>
                    <th className="text-left py-2 font-medium">City</th>
                    <th className="text-right py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMetricData.map((item, index) => (
                    <tr key={index} className={`border-b`} style={{borderColor: 'var(--border)', backgroundColor: item.isUserCity ? 'var(--primary)' : 'transparent'}}>
                      <td className="py-2">
                        {item.city} {item.isUserCity && '(Your City)'}
                      </td>
                      <td className="py-2 text-right" style={{color: 'var(--muted-foreground)'}}>
                        {selectedMetric.includes('$') || selectedMetric.includes('Price') || selectedMetric.includes('Spending')
                          ? `$${item.metric_value.toLocaleString()}`
                          : selectedMetric.includes('%')
                          ? `${item.metric_value}%`
                          : item.metric_value.toLocaleString()
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}