import React, { useEffect, useState } from 'react';

interface NotificationOptions {
  type?: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface Notification extends NotificationOptions {
  id: string;
}

// Global notification state management
let notificationCallbacks: ((notifications: Notification[]) => void)[] = [];
let notifications: Notification[] = [];
let nextId = 0;

export function addNotification(options: NotificationOptions) {
  const id = String(nextId++);
  const notification: Notification = {
    id,
    type: options.type || 'info',
    title: options.title,
    message: options.message,
    duration: options.duration || 3000
  };

  notifications = [...notifications, notification];
  notificationCallbacks.forEach(cb => cb(notifications));

  // Auto-remove after duration
  const duration = notification.duration || 3000;
  setTimeout(() => {
    notifications = notifications.filter(n => n.id !== id);
    notificationCallbacks.forEach(cb => cb(notifications));
  }, duration + 500);

  return id;
}

export function removeNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  notificationCallbacks.forEach(cb => cb(notifications));
}

export function NotificationModal() {
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);

  useEffect(() => {
    notificationCallbacks.push(setNotificationsList);
    setNotificationsList(notifications);

    // Listen for notifications from main process
    if (window.api?.notification?.onDisplay) {
      const unsubscribe = window.api.notification.onDisplay((options) => {
        addNotification(options);
      });
      return () => {
        notificationCallbacks = notificationCallbacks.filter(cb => cb !== setNotificationsList);
        if (unsubscribe) unsubscribe();
      };
    }

    return () => {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== setNotificationsList);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      {notificationsList.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onClose: () => void;
}

function NotificationItem({ notification, index, onClose }: NotificationItemProps) {
  const offset = index * 120; // Stack notifications vertically
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'success':
        return { border: 'rgba(76, 175, 80, 0.5)', progress: '#4CAF50' };
      case 'error':
        return { border: 'rgba(255, 82, 82, 0.5)', progress: '#FF5252' };
      case 'warning':
        return { border: 'rgba(255, 152, 0, 0.5)', progress: '#FF9800' };
      default:
        return { border: 'rgba(3, 218, 198, 0.3)', progress: '#03DAC6' };
    }
  };

  const colors = getColor();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: offset,
        right: 0,
        pointerEvents: 'auto',
        animation: 'slideIn 0.3s ease-out',
        animationFillMode: 'both'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '320px',
          maxWidth: '400px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: colors.border,
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              background: colors.progress,
              animation: `progress ${notification.duration}ms linear`,
              animationFillMode: 'forwards'
            }}
          />
        </div>

        {/* Icon */}
        <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
          {getIcon()}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#fff'
            }}
          >
            {notification.title}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.4
            }}
          >
            {notification.message}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: '0',
            fontSize: '1.25rem',
            lineHeight: 1,
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
