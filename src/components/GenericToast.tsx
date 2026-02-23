import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GenericToastProps {
  isVisible: boolean;
  onComplete: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  icon?: LucideIcon;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

function GenericToast({ 
  isVisible, 
  onComplete, 
  title,
  message,
  type = 'success',
  duration = 4000,
  icon: CustomIcon,
  position = 'top-right'
}: GenericToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, duration]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      progressColor: 'bg-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      progressColor: 'bg-red-600'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      progressColor: 'bg-yellow-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      progressColor: 'bg-blue-600'
    }
  };

  const config = typeConfig[type];
  const IconComponent = CustomIcon || config.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const slideDirections = {
    'top-right': { initial: { x: 400, y: -100 }, animate: { x: 0, y: 0 }, exit: { x: 400, y: -100 } },
    'top-left': { initial: { x: -400, y: -100 }, animate: { x: 0, y: 0 }, exit: { x: -400, y: -100 } },
    'bottom-right': { initial: { x: 400, y: 100 }, animate: { x: 0, y: 0 }, exit: { x: 400, y: 100 } },
    'bottom-left': { initial: { x: -400, y: 100 }, animate: { x: 0, y: 0 }, exit: { x: -400, y: 100 } },
    'top-center': { initial: { y: -100, scale: 0.8 }, animate: { y: 0, scale: 1 }, exit: { y: -100, scale: 0.8 } },
    'bottom-center': { initial: { y: 100, scale: 0.8 }, animate: { y: 0, scale: 1 }, exit: { y: 100, scale: 0.8 } }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className={`fixed ${positionClasses[position]} z-[70] pointer-events-none`}>
        <motion.div
          initial={slideDirections[position].initial}
          animate={slideDirections[position].animate}
          exit={slideDirections[position].exit}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="pointer-events-auto"
        >
          <div className={`bg-white rounded-xl shadow-lg border-2 ${config.borderColor} min-w-[350px] max-w-[400px] overflow-hidden`}>
            {/* Progress bar */}
            <div className="h-1 bg-gray-200">
              <motion.div
                className={`h-full ${config.progressColor}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${config.textColor}`}>
                    {title}
                  </h4>
                  {message && (
                    <p className="text-sm text-gray-600 mt-1">
                      {message}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onComplete}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GenericToast;