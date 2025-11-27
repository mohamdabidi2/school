"use client";

import { useState, useEffect, useCallback } from 'react';

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

const NotificationManager = () => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const list = Array.isArray(notifications) ? notifications : [];

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const body = await response.text();
        console.error('Réponse inattendue des notifications:', body.slice(0, 200));
        return;
      }

      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.notifications)
          ? (data as any).notifications
          : [];
      setNotifications(normalized);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  const handleNotification = useCallback((notification: NotificationPayload) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Show browser notification if permission granted
    if (permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: notification.id,
        requireInteraction: true,
      };

      // Some browsers support Notification actions; add them dynamically without
      // breaking TypeScript's structural typing for NotificationOptions.
      (options as any).actions = [
        {
          action: 'view',
          title: 'Voir',
          icon: '/logo.png',
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/close.png',
        },
      ];

      new Notification(notification.title, options);
    }
  }, [permission]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((newPermission) => {
        setPermission(newPermission);
      });
    }

    // Listen for push notifications
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        const messageHandler = (event: MessageEvent<{ type: string; notification: NotificationPayload }>) => {
          if (event.data && event.data.type === 'NOTIFICATION') {
            handleNotification(event.data.notification);
          }
        };

        // TypeScript's DOM lib doesn't expose the 'message' event on ServiceWorkerRegistration,
        // so we attach the listener directly on navigator.serviceWorker with a safe cast.
        const sw: any = navigator.serviceWorker;
        sw.addEventListener('message', messageHandler as any);
        unsubscribe = () => sw.removeEventListener('message', messageHandler as any);
      });
    }

    // Load existing notifications
    loadNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [handleNotification, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from GEOX School',
        icon: '/logo.png',
        badge: '/logo.png'
      });
    } else {
      alert('Notification permission not granted');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Settings */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">🔔 Gestion des Notifications</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Permission: <span className={`font-medium ${
                permission === 'granted' ? 'text-green-600' : 
                permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {permission === 'granted' ? 'Autorisée' : 
                 permission === 'denied' ? 'Refusée' : 'En attente'}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {permission === 'granted' ? 
                'Vous recevrez des notifications push' : 
                'Activez les notifications pour recevoir des alertes en temps réel'
              }
            </p>
          </div>
          <button
            onClick={sendTestNotification}
            disabled={permission !== 'granted'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Test Notification
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Notifications Récentes</h3>
          <p className="text-sm text-gray-600">
            {list.filter(n => !n.isRead).length} non lues
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {list.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p>Aucune notification</p>
            </div>
          ) : (
            list.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {notification.actionUrl && (
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Voir →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
