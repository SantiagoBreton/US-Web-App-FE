import { useState, useEffect } from 'react';
import { X, Bell, Check, CheckCheck, Filter, Search, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotifications from '../hooks/useNotifications';
import type { Notification } from '../components/NotificationBell';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClaimClick?: (claimId?: string) => void;
}

function NotificationsModal({ isOpen, onClose, onClaimClick }: NotificationsModalProps) {
    const [filter, setFilter] = useState<'all' | 'unread' | 'claims'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const notificationsPerPage = 10;
    const token = localStorage.getItem('token');

    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        refresh
    } = useNotifications({
        token,
        pollInterval: 30000,
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
        }
    }, [isOpen]);

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

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread' && notification.isRead) return false;
        if (filter === 'claims' && !notification.claimId) return false;
        if (searchTerm) {
            return notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   notification.title.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * notificationsPerPage,
        currentPage * notificationsPerPage
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        
        if (notification.claimId && onClaimClick) {
            onClose();
            onClaimClick(notification.claimId);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        refresh();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
                                <p className="text-sm text-gray-600">
                                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas las notificaciones leídas'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar notificaciones..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">Todas</option>
                                    <option value="unread">No leídas</option>
                                    <option value="claims">Reclamos</option>
                                </select>
                            </div>

                            {/* Mark all as read */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm || filter !== 'all' ? 'No se encontraron notificaciones' : 'No hay notificaciones'}
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm || filter !== 'all' 
                                        ? 'Intenta con otros filtros o términos de búsqueda'
                                        : 'Las nuevas notificaciones aparecerán aquí'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {paginatedNotifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`${typeof getNotificationIcon(notification.type) === 'string' ? 'text-2xl' : 'flex items-center justify-center w-8 h-8'}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-medium ${
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
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    {notification.claimId && (
                                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                            Reclamo #{notification.claimId}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                                                    title="Marcar como leída"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Mostrando {((currentPage - 1) * notificationsPerPage) + 1} - {Math.min(currentPage * notificationsPerPage, filteredNotifications.length)} de {filteredNotifications.length} notificaciones
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default NotificationsModal;