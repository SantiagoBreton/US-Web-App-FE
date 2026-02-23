import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserNotification {
    id: string;
    type: 'reservation_confirmed' | 'reservation_cancelled' | 'reservation_modified' | 'reservation_reminder';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
    reservation?: {
        id: string;
        amenityName: string;
        startTime: string;
        endTime: string;
        status: string;
    };
}

interface UseUserNotificationsOptions {
    token: string | null;
    pollInterval?: number;
    onNewNotification?: (notification: UserNotification) => void;
}

interface BackendUserNotification {
    id: string;
    type: 'reservation_confirmed' | 'reservation_cancelled' | 'reservation_modified' | 'reservation_reminder';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
    reservation?: {
        id: string;
        amenityName: string;
        startTime: string;
        endTime: string;
        status: string;
    };
}

interface UserNotificationsResponse {
    notifications: BackendUserNotification[];
    unreadCount: number;
}

export function useUserNotifications({ token, pollInterval = 30000, onNewNotification }: UseUserNotificationsOptions) {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
    const previousNotificationIds = useRef<Set<string>>(new Set());
    const onNewNotificationRef = useRef(onNewNotification);

    useEffect(() => {
        onNewNotificationRef.current = onNewNotification;
    }, [onNewNotification]);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/user/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error fetching notifications');
            
            const data: UserNotificationsResponse = await response.json();

            if (previousNotificationIds.current.size > 0 && onNewNotificationRef.current) {
                data.notifications.forEach(notification => {
                    if (!previousNotificationIds.current.has(notification.id) && !notification.isRead) {
                        onNewNotificationRef.current!(notification);
                    }
                });
            }

            previousNotificationIds.current = new Set(data.notifications.map(n => n.id));

            const sortedNotifications = [...data.notifications].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(sortedNotifications);
            setUnreadCount(data.unreadCount);
            setLastCheckTime(new Date());
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token]); 

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/user/notifications/${notificationId}/mark-read`, {
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
            
            const response = await fetch(`${API_URL}/user/notifications/mark-all-read`, {
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

    const deleteNotification = useCallback(async (notificationId: string) => {
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL as string;
            
            const response = await fetch(`${API_URL}/user/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error deleting notification');

            const notificationToDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

            if (notificationToDelete && !notificationToDelete.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [token, notifications]);

    useEffect(() => {
        if (!token) return;
        fetchNotifications();

        const interval = setInterval(fetchNotifications, pollInterval);
        
        return () => clearInterval(interval);
    }, [token, fetchNotifications, pollInterval]);
    
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
        deleteNotification,
        refresh
    };
}

export default useUserNotifications;
