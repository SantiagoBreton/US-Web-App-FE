import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, X } from 'lucide-react';

interface ProjectFlowTaskCreatedToastProps {
  isVisible: boolean;
  onComplete: () => void;
  onCreateSubTask: () => void;
  taskTitle: string;
}

export default function ProjectFlowTaskCreatedToast({
  isVisible,
  onComplete,
  onCreateSubTask,
  taskTitle
}: ProjectFlowTaskCreatedToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const duration = 6000; // 6 segundos para dar tiempo a ver las opciones
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
        <div className="mx-4 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¡Tarea creada exitosamente!
                </h3>
                <p className="text-sm text-gray-600 mb-3 break-words">
                  <span className="font-medium">{taskTitle}</span> fue exportada a Project Flow
                </p>
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onCreateSubTask();
                      onComplete();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear Subtarea
                  </button>
                  <button
                    onClick={onComplete}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <button
                onClick={onComplete}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
