import { useState, useMemo, useEffect } from 'react';
import { Bell, Filter, Check, CheckCheck, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useUserNotifications, { type UserNotification } from '../hooks/useUserNotifications';

type FilterType = 'all' | 'unread' | 'read';
type NotificationTypeFilter = 'all' | 'reservation_confirmed' | 'pending_reservation' | 'reservation_cancelled' | 'reservation_modified' | 'reservation_reminder';

const UserNotificationsPage = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refresh } = useUserNotifications({ token });
    
    const [filter, setFilter] = useState<FilterType>('all');
    const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {

            if (filter === 'read' && !notification.isRead) return false;
            if (filter === 'unread' && notification.isRead) return false;

            if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
            
            return true;
        });
    }, [notifications, filter, typeFilter]);


    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredNotifications, currentPage, itemsPerPage]);


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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reservation_confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending_reservation':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'reservation_cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'reservation_modified':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'reservation_reminder':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'reservation_confirmed':
                return 'Confirmada';
            case 'pending_reservation':
                return 'Pendiente de Aprobación';
            case 'reservation_cancelled':
                return 'Cancelada';
            case 'reservation_modified':
                return 'Modificada';
            case 'reservation_reminder':
                return 'Recordatorio';
            default:
                return type;
        }
    };


    const handleNotificationClick = async (notification: UserNotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        navigate('/dashboard');
    };


    const handleMarkAsRead = async (notification: UserNotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };


    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
                                    <p className="text-sm text-gray-600">
                                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas las notificaciones leídas'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar'}
                            </button>
                            
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filtros:</span>
                        </div>
                        
                        {/* Filtro por estado */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Estado:</span>
                            <select
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value as FilterType);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas</option>
                                <option value="unread">No leídas</option>
                                <option value="read">Leídas</option>
                            </select>
                        </div>
                        
  
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Tipo:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as NotificationTypeFilter);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos</option>
                                <option value="reservation_confirmed">Confirmadas</option>
                                <option value="reservation_cancelled">Canceladas</option>
                                <option value="reservation_modified">Modificadas</option>
                                <option value="reservation_reminder">Recordatorios</option>
                            </select>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                            {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-500">
                            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 
                             filter === 'read' ? 'No tienes notificaciones leídas' :
                             'No hay notificaciones disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {paginatedNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-lg border hover:shadow-md transition-all cursor-pointer ${
                                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="text-3xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className={`font-semibold ${
                                                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                                        getTypeColor(notification.type)
                                                    }`}>
                                                        {getTypeName(notification.type)}
                                                    </span>
                                                    
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-gray-600 mb-3">
                                                    {notification.message}
                                                </p>
                                                
                                                {notification.reservation && (
                                                    <div className="text-sm text-gray-500 bg-gray-50 rounded p-2 mb-2">
                                                        <p className="font-medium">{notification.reservation.amenityName}</p>
                                                        <p className="text-xs">
                                                            {new Date(notification.reservation.startTime).toLocaleString('es-ES', {
                                                                dateStyle: 'short',
                                                                timeStyle: 'short'
                                                            })}
                                                            {' - '}
                                                            {new Date(notification.reservation.endTime).toLocaleString('es-ES', {
                                                                timeStyle: 'short'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500">
                                                        {formatTimeRelative(notification.createdAt)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification);
                                                                }}
                                                                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Marcar como leída
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={(e) => handleDelete(e, notification.id)}
                                                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Anterior
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 rounded-md transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNotificationsPage;
