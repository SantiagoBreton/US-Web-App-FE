import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, PlayCircle, XCircle, Calendar, Plus, Loader2, Trash2 } from 'lucide-react';
import { getProjectFlowTask, updateProjectFlowTask, deleteProjectFlowTask, type ProjectFlowTask, type TaskStatus } from '../api_calls/projectFlow';
import { updateClaimStatus } from '../api_calls/claims';
import GenericToast from './GenericToast';

interface ProjectFlowTaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  token: string;
  onAddSubTask?: () => void;
  claimId?: number;
  currentClaimStatus?: string;
  onClaimStatusSync?: () => void;
}

const statusIcons = {
  TODO: Clock,
  IN_PROGRESS: PlayCircle,
  DONE: CheckCircle,
  CANCELLED: XCircle
};

const statusLabels = {
  TODO: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  DONE: 'Completada',
  CANCELLED: 'Cancelada'
};

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
  DONE: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

export default function ProjectFlowTaskDetailsModal({
  isOpen,
  onClose,
  taskId,
  token,
  onAddSubTask,
  claimId,
  currentClaimStatus,
  onClaimStatusSync
}: ProjectFlowTaskDetailsModalProps) {
  const [task, setTask] = useState<ProjectFlowTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subTaskToDelete, setSubTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deletedSubTaskTitle, setDeletedSubTaskTitle] = useState<string>('');

  const syncClaimStatus = useCallback(async (taskStatus: TaskStatus) => {
    if (!claimId || !currentClaimStatus) return;
    
    // Mapear estados de ProjectFlow a estados de Claim
    let newClaimStatus: string | null = null;
    
    switch (taskStatus) {
      case 'TODO':
        if (currentClaimStatus !== 'pendiente') newClaimStatus = 'pendiente';
        break;
      case 'IN_PROGRESS':
        if (currentClaimStatus !== 'en_progreso') newClaimStatus = 'en_progreso';
        break;
      case 'DONE':
        if (currentClaimStatus !== 'resuelto') newClaimStatus = 'resuelto';
        break;
      case 'CANCELLED':
        if (currentClaimStatus !== 'rechazado') newClaimStatus = 'rechazado';
        break;
    }
    
    // Si el estado es diferente, sincronizar
    if (newClaimStatus) {
      try {
        setSyncing(true);
        await updateClaimStatus(token, claimId, newClaimStatus as any);
        console.log('🔄 Estado del claim sincronizado desde ProjectFlow:', newClaimStatus);
        
        // Notificar al componente padre para recargar claims
        if (onClaimStatusSync) {
          onClaimStatusSync();
        }
      } catch (err) {
        console.error('⚠️ Error al sincronizar estado del claim:', err);
      } finally {
        setSyncing(false);
      }
    }
  }, [claimId, currentClaimStatus, token, onClaimStatusSync]);

  const loadTask = useCallback(async (shouldSync: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const taskData = await getProjectFlowTask(token, taskId);
      setTask(taskData);
      
      // Sincronizar estado del claim solo cuando se solicite explícitamente
      // (por ejemplo, después de actualizar el estado de una tarea)
      if (shouldSync && claimId && currentClaimStatus && taskData) {
        await syncClaimStatus(taskData.status);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  }, [token, taskId, claimId, currentClaimStatus, syncClaimStatus]);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
    }
  }, [isOpen, taskId, loadTask]);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleUpdateTaskStatus = async (taskIdToUpdate: string, newStatus: TaskStatus, isMainTask: boolean = false) => {
    try {
      setUpdatingTaskId(taskIdToUpdate);
      await updateProjectFlowTask(token, taskIdToUpdate, { status: newStatus });

     
      if (isMainTask && newStatus === 'DONE' && claimId) {
        try {
          await updateClaimStatus(token, claimId, 'resuelto');
          console.log('✅ Claim actualizado a resuelto en la base de datos');
          
        } catch (err) {
          console.error('⚠️ Error al actualizar estado del claim:', err);
        }
      }

      await loadTask(false); 
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCompleteTask = () => {
    if (task) {
      handleUpdateTaskStatus(task.id, 'DONE', true); 
    }
  };

  const handleCompleteSubTask = (subTaskId: string) => {
    handleUpdateTaskStatus(subTaskId, 'DONE', false); 
  };

  const handleDeleteSubTaskClick = (subTaskId: string, subTaskTitle: string) => {
    setSubTaskToDelete({ id: subTaskId, title: subTaskTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteSubTask = async () => {
    if (!subTaskToDelete) return;

    try {
      setDeletingTaskId(subTaskToDelete.id);
      const titleToDelete = subTaskToDelete.title;
      await deleteProjectFlowTask(token, subTaskToDelete.id);
      await loadTask();
      setShowDeleteModal(false);
      setSubTaskToDelete(null);
      
      // Mostrar toast de éxito
      setDeletedSubTaskTitle(titleToDelete);
      setShowSuccessToast(true);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la subtarea');
      setShowDeleteModal(false);
      setSubTaskToDelete(null);
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (!isOpen) return null;

  const StatusIcon = task ? statusIcons[task.status] : Clock;

  return (
    <>
      <AnimatePresence>
        <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <StatusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalles de la Tarea
                </h2>
                <p className="text-sm text-gray-500">
                  ProjectFlow {syncing && '• Sincronizando...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : task ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[task.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusLabels[task.status]}
                    </span>
                    {task.status !== 'DONE' && (
                      <button
                        onClick={handleCompleteTask}
                        disabled={updatingTaskId === task.id}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {updatingTaskId === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Marcar como completada
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha límite
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.deadline).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Task ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Tarea
                  </label>
                  <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {task.id}
                  </code>
                </div>

                {/* SubTasks */}
                {task.subTasks && task.subTasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtareas ({task.subTasks.length})
                    </label>
                    <div className="space-y-2">
                      {task.subTasks.map((subTask) => {
                        const SubTaskIcon = statusIcons[subTask.status];
                        const isUpdating = updatingTaskId === subTask.id;
                        const isDeleting = deletingTaskId === subTask.id;
                        return (
                          <div
                            key={subTask.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {subTask.title}
                                </p>
                                <p className="text-xs text-gray-600 mb-2">
                                  {subTask.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[subTask.status]}`}>
                                    <SubTaskIcon className="w-3 h-3" />
                                    {statusLabels[subTask.status]}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(subTask.deadline).toLocaleDateString('es-ES')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {subTask.status !== 'DONE' && (
                                  <button
                                    onClick={() => handleCompleteSubTask(subTask.id)}
                                    disabled={isUpdating || isDeleting}
                                    className="flex-shrink-0 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Marcar como completada"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteSubTaskClick(subTask.id, subTask.title)}
                                  disabled={isUpdating || isDeleting}
                                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Eliminar subtarea"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            {onAddSubTask && (
              <button
                onClick={() => {
                  onClose();
                  onAddSubTask();
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Añadir Subtarea
              </button>
            )}
          </div>
        </motion.div>
      </div>
      </AnimatePresence>

      {/* Delete SubTask Confirmation Modal */}
      {showDeleteModal && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]"
        onClick={() => {
          setShowDeleteModal(false);
          setSubTaskToDelete(null);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Subtarea
              </h3>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar esta subtarea de ProjectFlow?
            </p>
            {subTaskToDelete && (
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                {subTaskToDelete.title}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSubTaskToDelete(null);
              }}
              disabled={!!deletingTaskId}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDeleteSubTask}
              disabled={!!deletingTaskId}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deletingTaskId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    )}

    {/* Success Toast */}
    <GenericToast
      isVisible={showSuccessToast}
      onComplete={() => setShowSuccessToast(false)}
      title="Subtarea Eliminada"
      message={`La subtarea "${deletedSubTaskTitle}" ha sido eliminada exitosamente de ProjectFlow`}
      type="success"
      icon={CheckCircle}
      position="top-right"
      duration={4000}
    />
    </>
  );
}
