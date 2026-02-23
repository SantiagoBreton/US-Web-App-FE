import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SubTaskCreatedToastProps {
  isVisible: boolean;
  onComplete: () => void;
  subTaskTitle: string;
}

export default function SubTaskCreatedToast({
  isVisible,
  onComplete,
  subTaskTitle
}: SubTaskCreatedToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const duration = 4000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -50, x: '-50%' }}
        className="fixed top-6 left-1/2 z-[70] w-full max-w-md"
      >
        <div className="mx-4 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¡Subtarea creada!
                </h3>
                <p className="text-sm text-gray-600 break-words">
                  <span className="font-medium">{subTaskTitle}</span> fue agregada exitosamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
