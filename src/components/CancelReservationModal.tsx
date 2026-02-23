import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { Reservation } from "../types";

interface CancelReservationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    reservation: Reservation | null;
    isCancelling?: boolean;
}

function CancelReservationModal({ 
    isVisible, 
    onClose, 
    onConfirm,
    reservation,
    isCancelling = false
}: CancelReservationModalProps) {
    if (!reservation) return null;

    const startDate = new Date(reservation.startTime);
    const endDate = new Date(reservation.endTime);
    
    const dateStr = startDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const startTimeStr = startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const endTimeStr = endDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Cancelar reserva</h3>
                            <p className="text-gray-600 mb-4">
                                ¿Estás seguro de que quieres cancelar esta reserva?
                            </p>
                            
                            {/* Reservation Details */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-left">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Espacio</p>
                                            <p className="text-sm text-gray-600">{reservation.amenity?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Fecha</p>
                                            <p className="text-sm text-gray-600 capitalize">{dateStr}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Horario</p>
                                            <p className="text-sm text-gray-600">{startTimeStr} - {endTimeStr}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-orange-200">
                                    <p className="text-xs text-orange-700">
                                        <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                disabled={isCancelling}
                                className={`px-6 py-2 rounded-lg transition-all ${
                                    isCancelling 
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-300 hover:bg-gray-400 cursor-pointer'
                                }`}
                            >
                                Mantener reserva
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isCancelling}
                                className={`px-6 py-2 rounded-lg text-white transition-all ${
                                    isCancelling
                                        ? 'bg-orange-400 cursor-not-allowed'
                                        : 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
                                }`}
                            >
                                {isCancelling ? 'Cancelando...' : 'Cancelar reserva'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CancelReservationModal;