import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../components/NotificationBell';

interface UseNotificationsOptions {
    token: string | null;
    pollInterval?: number; 
    onNewNotification?: (notification: Notification) => void;
}

interface BackendNotification {
    id: string;
    type: 'urgent_claim' | 'new_claim';
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
    claim: {
        id: string;
        title: string;
        priority: string;
        category?: string; 
        user: {
            name: string;
        };
    };
}

interface NotificationsResponse {
    notifications: BackendNotification[];
    unreadCount: number;
}

export function useNotifications({ token, pollInterval = 30000, onNewNotification }: UseNotificationsOptions) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
    const previousNotificationIds = useRef<Set<string>>(new Set());

    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/admin/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error fetching notifications');
            
            const data: NotificationsResponse = await response.json();
            
            // Convertir notificaciones del backend al formato del frontend
            const convertedNotifications = data.notifications.map((backendNotif: BackendNotification): Notification => {
                const isUrgent = backendNotif.type === 'urgent_claim';
                const priority = backendNotif.claim.priority || (isUrgent ? 'Urgente' : 'Normal');
                const category = backendNotif.claim.category || 'General';
                
                return {
                    id: backendNotif.id,
                    type: backendNotif.type,
                    title: `Reclamo de prioridad ${priority}`,
                    message: `${backendNotif.claim.user.name} creó un reclamo: "${backendNotif.claim.title}"`,
                    createdAt: backendNotif.createdAt,
                    isRead: backendNotif.isRead,
                    claimId: backendNotif.claim.id,
                    category: category,
                    priority: backendNotif.claim.priority as 'low' | 'medium' | 'high' | 'urgent'
                };
            });
            
            if (previousNotificationIds.current.size > 0 && onNewNotification) {
                convertedNotifications.forEach(notification => {
                    if (!previousNotificationIds.current.has(notification.id) && !notification.isRead) {
                        onNewNotification(notification);
                    }
                });
            }
            
            previousNotificationIds.current = new Set(convertedNotifications.map(n => n.id));
            
            convertedNotifications.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(convertedNotifications);
            setUnreadCount(data.unreadCount);
            setLastCheckTime(new Date());
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token, onNewNotification]);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/admin/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error marking notification as read');

            setNotifications(prev => prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, isRead: true }
                    : notification
            ));

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [token]);

    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/admin/notifications/mark-all-read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error marking all notifications as read');

            setNotifications(prev => prev.map(notification => 
                ({ ...notification, isRead: true })
            ));

            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        fetchNotifications();
        const interval = setInterval(fetchNotifications, pollInterval);
        
        return () => clearInterval(interval);
    }, [token, pollInterval]);


    const refresh = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        lastCheckTime,
        markAsRead,
        markAllAsRead,
        refresh
    };
}

export default useNotifications;