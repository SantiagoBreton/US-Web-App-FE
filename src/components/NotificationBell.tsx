import { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export interface Notification {
    id: string;
    type: 'new_claim' | 'urgent_claim' | 'claim_resolved';
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    claimId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
}

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: Notification) => void;
    onNotificationsClick?: () => void;
}

function NotificationBell({ 
    notifications, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onNotificationClick,
    onNotificationsClick
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const unreadCount = unreadNotifications.length;
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_claim':
                return '📝';
            case 'urgent_claim':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'claim_resolved':
                return '✅';
            default:
                return '📢';
        }
    };
    
    const getCategoryColor = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'mantenimiento':
                return 'bg-blue-100 border-blue-300 text-blue-800';
            case 'seguridad':
                return 'bg-red-100 border-red-300 text-red-800';
            case 'limpieza':
                return 'bg-green-100 border-green-300 text-green-800';
            case 'ruido':
                return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'administracion':
                return 'bg-purple-100 border-purple-300 text-purple-800';
            case 'convivencia':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };
    
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Ahora mismo';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
        return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Campanita */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
                <Bell className="w-6 h-6" />
                
                {/* Badge de contador */}
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                )}
                
                {/* Pulsing animation para nuevas notificaciones */}
                {unreadCount > 0 && (
                    <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 0.3, 0.7]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
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
                                            ({unreadCount} nuevas)
                                        </span>
                                    )}
                                </h3>
                                {notifications.length > 0 && (
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
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-lg font-medium">No hay notificaciones</p>
                                    <p className="text-sm">Las nuevas notificaciones aparecerán aquí</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={() => onNotificationClick(notification)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`${typeof getNotificationIcon(notification.type) === 'string' ? 'text-2xl' : 'flex items-center justify-center w-8 h-8'}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-medium text-sm ${
                                                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                        {notification.category && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                                                getCategoryColor(notification.category)
                                                            }`}>
                                                                {notification.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Botón para marcar como leída */}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMarkAsRead(notification.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                    title="Marcar como leída"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            {/* Indicador de no leída */}
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        
                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (onNotificationsClick) {
                                            onNotificationsClick();
                                        } else {
                                            navigate('/admin/notifications');
                                        }
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

export default NotificationBell;