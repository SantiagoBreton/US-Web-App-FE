import { useState } from 'react';
import NotificationBell, { type Notification } from '../components/NotificationBell';
import useNotifications from '../hooks/useNotifications';

function NotificationDemo() {
    const [token] = useState<string | null>(localStorage.getItem('token'));
    
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refresh
    } = useNotifications({ 
        token, 
        pollInterval: 30000 
    });

    const handleNotificationClick = (notification: Notification) => {
        console.log('Notificación clickeada:', notification);
        markAsRead(notification.id);
        
        if (notification.claimId) {
            console.log('Abrir reclamo:', notification.claimId);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Demo Sistema de Notificaciones</h1>
            
            <div className="flex items-center gap-4 mb-8">
                <NotificationBell
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onNotificationClick={handleNotificationClick}
                />
                
                <div className="text-gray-600">
                    {unreadCount} notificaciones sin leer
                </div>
                
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Actualizar
                </button>
            </div>
            
            <div className="grid gap-4">
                <h2 className="text-lg font-semibold">Características:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>🔔 Campanita animada con badge de contador</li>
                    <li>📝 Notificaciones de nuevos reclamos</li>
                    <li>🚨 Prioridades visuales (urgente, alta, media, baja)</li>
                    <li>👀 Sistema de "marcar como leído"</li>
                    <li>🔄 Polling automático cada 30 segundos</li>
                    <li>💾 Persistencia en localStorage</li>
                    <li>📱 Responsive y móvil-friendly</li>
                    <li>✨ Animaciones con Framer Motion</li>
                </ul>
            </div>
        </div>
    );
}

export default NotificationDemo;