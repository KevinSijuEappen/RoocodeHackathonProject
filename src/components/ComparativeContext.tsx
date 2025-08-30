"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Comparative Context
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          How your area compares to nearby cities
        </p>
      </div>

      <div className="p-6">
        {comparativeData.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No comparative data available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metric Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Metric:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <div className={`p-4 rounded-lg ${
                insight.isHigher 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-2">
                  {insight.isHigher ? (
                    <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <p className={`font-medium ${
                    insight.isHigher 
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-green-800 dark:text-green-200'
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="city" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
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
                    fill="#3B82F6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">City</th>
                    <th className="text-right py-2 font-medium text-gray-900 dark:text-white">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMetricData.map((item, index) => (
                    <tr key={index} className={`border-b border-gray-100 dark:border-gray-800 ${
                      item.isUserCity ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}>
                      <td className="py-2 text-gray-900 dark:text-white">
                        {item.city} {item.isUserCity && '(Your City)'}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">
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