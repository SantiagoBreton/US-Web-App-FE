import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calendar, FileText, Clock } from 'lucide-react';
import ModernDatePicker from './ModernDatePicker';

interface ExportToProjectFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (title: string, description: string, deadline: string) => Promise<void>;
  claimTitle: string;
  claimDescription: string;
}

export default function ExportToProjectFlowModal({
  isOpen,
  onClose,
  onExport,
  claimTitle,
  claimDescription
}: ExportToProjectFlowModalProps) {
  const [title, setTitle] = useState(claimTitle);
  const [description, setDescription] = useState(claimDescription);
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('12:00');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  const handleExport = async () => {
    if (!title.trim()) {
      setError('Por favor ingresa un título para la tarea');
      return;
    }

    if (!description.trim()) {
      setError('Por favor ingresa una descripción para la tarea');
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
    setIsExporting(true);

    try {
      // Formato: 2025-11-25T15:26
      const deadlineDateTime = `${deadline}T${time}`;
      await onExport(title.trim(), description.trim(), deadlineDateTime);
      onClose();
      setTitle(claimTitle);
      setDescription(claimDescription);
      setDeadline('');
      setTime('12:00');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar a Project Flow');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setTitle(claimTitle);
      setDescription(claimDescription);
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
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Exportar a Project Flow
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Crea una tarea en Project Flow desde este reclamo
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isExporting}
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
                <FileText className="w-4 h-4 text-indigo-600" />
                Título de la Tarea
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Título de la tarea"
                disabled={isExporting}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                placeholder="Descripción de la tarea"
                disabled={isExporting}
              />
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
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
                <Clock className="w-4 h-4 text-indigo-600" />
                Hora Límite <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isExporting}
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
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Esta acción creará una nueva tarea principal en Project Flow con la información del reclamo.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !title.trim() || !description.trim() || !deadline || !time}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Exportar a Project Flow
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
