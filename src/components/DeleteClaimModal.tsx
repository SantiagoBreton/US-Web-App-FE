import { AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface DeleteClaimModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (deleteProjectFlowTask: boolean) => void;
  claimSubject?: string;
  isDeleting?: boolean;
  hasProjectFlowTask?: boolean;
}

function DeleteClaimModal({ 
  isVisible, 
  onClose, 
  onConfirm, 
  claimSubject, 
  isDeleting = false,
  hasProjectFlowTask = false
}: DeleteClaimModalProps) {
  const [deleteTask, setDeleteTask] = useState(false);

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(deleteTask);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Eliminar Reclamo
                </h2>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Una vez eliminado, no podrás recuperar este reclamo.
              </p>
              {claimSubject && (
                <p className="text-sm text-gray-500 mb-4">
                  <strong>{claimSubject}</strong>
                </p>
              )}

              {/* ProjectFlow Task Option */}
              {hasProjectFlowTask && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteTask}
                      onChange={(e) => setDeleteTask(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={isDeleting}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        ¿También eliminar la tarea de ProjectFlow?
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Este reclamo tiene una tarea asociada en ProjectFlow. Si deseas eliminarla también, marca esta opción.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DeleteClaimModal;