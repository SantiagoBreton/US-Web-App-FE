import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3 } from 'lucide-react';
import ReservationsAnalytics from './ReservationsAnalytics';
import ClaimsAnalytics from './ClaimsAnalytics';

interface AnalyticsReportsProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ isOpen, onClose, token }) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'claims'>('reservations');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Análisis y Reportes</h2>
                <p className="text-blue-100 text-sm">Métricas y estadísticas del sistema</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-8 py-4 bg-white border-b border-gray-200 shrink-0">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'reservations'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reservas
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'claims'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reclamos
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0 scrollbar-hidden">
            {activeTab === 'reservations' ? (
              <ReservationsAnalytics token={token} />
            ) : (
              <ClaimsAnalytics token={token} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsReports;
