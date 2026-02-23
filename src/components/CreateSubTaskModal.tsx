import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, FileText, Clock } from 'lucide-react';
import ModernDatePicker from './ModernDatePicker';

interface CreateSubTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSubTask: (title: string, description: string, deadline: string) => Promise<void>;
  parentTaskTitle: string;
}

export default function CreateSubTaskModal({
  isOpen,
  onClose,
  onCreateSubTask,
  parentTaskTitle
}: CreateSubTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('12:00');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Por favor ingresa un título para la subtarea');
      return;
    }

    if (!description.trim()) {
      setError('Por favor ingresa una descripción para la subtarea');
      return;
    }

    if (!deadline) {
      setError('Por favor selecciona una fecha límite');
      return;
    }

    if (!time) {
      setError('Por favor selecciona una hora');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      // Formato: 2025-11-25T15:26
      const deadlineDateTime = `${deadline}T${time}`;
      await onCreateSubTask(title.trim(), description.trim(), deadlineDateTime);
      onClose();
      setTitle('');
      setDescription('');
      setDeadline('');
      setTime('12:00');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear subtarea');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setTime('12:00');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Crear Subtarea
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Agregar subtarea a: {parentTaskTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Título */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Título de la Subtarea <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Título de la subtarea"
                disabled={isCreating}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Descripción de la subtarea"
                disabled={isCreating}
              />
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Fecha Límite <span className="text-red-500">*</span>
              </label>
              <ModernDatePicker
                selectedDate={deadline}
                onDateChange={setDeadline}
                minDate={today}
                label=""
              />
            </div>

            {/* Hora */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Hora Límite <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isCreating}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            {/* Info */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                <strong>Nota:</strong> Esta subtarea se creará dentro de la tarea principal.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !title.trim() || !description.trim() || !deadline || !time}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear Subtarea
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
