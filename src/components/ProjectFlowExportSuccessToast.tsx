import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';

interface ProjectFlowExportSuccessToastProps {
  isVisible: boolean;
  onComplete: () => void;
  claimTitle: string;
}

export default function ProjectFlowExportSuccessToast({ 
  isVisible, 
  onComplete,
  claimTitle
}: ProjectFlowExportSuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-[70] max-w-md"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Exportado a Project Flow
                  </h3>
                  <p className="text-white/90 text-xs line-clamp-2">
                    "{claimTitle}" se ha exportado exitosamente
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className="h-full bg-white/30"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
