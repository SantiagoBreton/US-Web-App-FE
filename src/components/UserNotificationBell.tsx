import { useState, useEffect, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { UserNotification } from '../hooks/useUserNotifications';

interface UserNotificationBellProps {
    notifications: UserNotification[];
    unreadCount: number;
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
    onDeleteNotification: (notificationId: string) => void;
    onNotificationClick: (notification: UserNotification) => void;
}

function UserNotificationBell({ 
    notifications, 
    unreadCount,
    onMarkAsRead, 
    onMarkAllAsRead,
    onDeleteNotification,
    onNotificationClick 
}: UserNotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const recentNotifications = notifications.slice(0, 10);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTimeRelative = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Hace un momento';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        
        return created.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reservation_confirmed':
                return '✅';
            case 'pending_reservation':
                return '🔔';
            case 'reservation_cancelled':
                return '❌';
            case 'reservation_modified':
                return '🔄';
            case 'reservation_reminder':
                return '⏰';
            default:
                return '📋';
        }
    };

    const handleNotificationClick = (notification: UserNotification) => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        setIsOpen(false);
        onNotificationClick(notification);
    };

    const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        onDeleteNotification(notificationId);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                
                {/* Badge con contador */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
                
                {/* Animación de campanita al haber notificaciones nuevas */}
                {unreadCount > 0 && (
                    <motion.div
                        animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0"
                    />
                )}
            </button>
            
            {/* Dropdown de notificaciones */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">
                                    Notificaciones
                                    {unreadCount > 0 && (
                                        <span className="ml-2 text-sm text-red-600">
                                            ({unreadCount} nueva{unreadCount !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </h3>
                                {recentNotifications.length > 0 && unreadCount > 0 && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Marcar todas como leídas
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Lista de notificaciones */}
                        <div className="max-h-80 overflow-y-auto">
                            {recentNotifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-lg font-medium">No hay notificaciones</p>
                                    <p className="text-sm">Las nuevas notificaciones aparecerán aquí</p>
                                </div>
                            ) : (
                                recentNotifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="text-2xl">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-medium text-sm ${
                                                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    {notification.reservation && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {notification.reservation.amenityName}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTimeRelative(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, notification.id)}
                                                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Eliminar notificación"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        
                        {/* Footer */}
                        {recentNotifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/user/notifications');
                                    }}
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Ver todas las notificaciones
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserNotificationBell;
