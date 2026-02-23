import { useEffect } from 'react';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NotificationToast } from '../hooks/useNotificationToasts';

interface NotificationToastProps {
    toast: NotificationToast;
    onClose: () => void;
}

const NotificationToastComponent = ({ toast, onClose }: NotificationToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
    }, [toast.duration, onClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'urgent_notification':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'new_notification':
                return <Bell className="w-5 h-5 text-blue-600" />;
            default:
                return <Bell className="w-5 h-5 text-blue-600" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'urgent_notification':
                return 'border-l-red-500 bg-red-50';
            case 'new_notification':
                return 'border-l-blue-500 bg-blue-50';
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const getProgressColor = () => {
        switch (toast.type) {
            case 'urgent_notification':
                return 'bg-red-500';
            case 'new_notification':
                return 'bg-blue-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }}
            className={`relative bg-white border-l-4 ${getBorderColor()} shadow-lg rounded-lg p-4 mb-3 max-w-sm w-full overflow-hidden`}
        >
            {/* Barra de progreso */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${getProgressColor()}`}
            />
            
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {toast.title}
                        </h4>
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {toast.message}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

interface NotificationToastContainerProps {
    toasts: NotificationToast[];
    onRemoveToast: (id: string) => void;
}

export const NotificationToastContainer = ({ toasts, onRemoveToast }: NotificationToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <NotificationToastComponent
                            key={toast.id}
                            toast={toast}
                            onClose={() => onRemoveToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificationToastComponent;