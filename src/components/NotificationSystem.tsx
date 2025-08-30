"use client";

import { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationSystemProps {
  location: any;
  articles: any[];
}

export default function NotificationSystem({ location, articles }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 most recent
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Generate notifications based on location and articles
  useEffect(() => {
    if (location) {
      addNotification({
        type: "success",
        title: "Location Detected",
        message: `Now showing information for ${location.city}, ${location.state}`,
      });
    }
  }, [location]);

  useEffect(() => {
    if (articles.length > 0) {
      const urgentKeywords = ["emergency", "alert", "breaking", "urgent", "warning", "evacuation"];
      const urgentArticles = articles.filter(article => 
        urgentKeywords.some(keyword => 
          article.title.toLowerCase().includes(keyword) || 
          article.description.toLowerCase().includes(keyword)
        )
      );

      if (urgentArticles.length > 0) {
        addNotification({
          type: "warning",
          title: "Urgent News Alert",
          message: `${urgentArticles.length} urgent news item(s) found in your area`,
        });
      }

      addNotification({
        type: "info",
        title: "News Updated",
        message: `Found ${articles.length} local news articles`,
      });
    }
  }, [articles]);

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "warning": return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "success": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default: return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border hover:shadow-xl transition-shadow"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 ${getBgColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}