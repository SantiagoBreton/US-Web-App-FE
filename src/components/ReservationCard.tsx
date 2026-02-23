import type { Reservation } from "../types";
import { LoadingButton } from "./LoadingSpinner";
import { MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, X } from "lucide-react";

interface ReservationCardProps {
    reservation: Reservation;
    onCancel: (reservationId: number) => void;
    onRemoveFromView: (reservationId: number) => void;
    isCancelling?: boolean;
    isHiding?: boolean;
}

function ReservationCard({ 
    reservation, 
    onCancel, 
    onRemoveFromView,
    isCancelling = false,
    isHiding = false
}: ReservationCardProps) {
    const getStatusConfig = (statusName: string) => {
        switch (statusName) {
            case "confirmada":
                return {
                    accentColor: "from-emerald-500 to-emerald-600",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-emerald-600",
                    icon: CheckCircle,
                    dotColor: "bg-emerald-500"
                };
            case "pendiente":
                return {
                    accentColor: "from-amber-500 to-amber-600",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-amber-600",
                    icon: AlertCircle,
                    dotColor: "bg-amber-500"
                };
            case "cancelada":
                return {
                    accentColor: "from-gray-500 to-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-300",
                    textColor: "text-gray-600",
                    statusTextColor: "text-gray-600",
                    icon: XCircle,
                    dotColor: "bg-gray-500"
                };
            case "denied":
                return {
                    accentColor: "from-gray-600 to-gray-700",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-300",
                    textColor: "text-gray-600",
                    statusTextColor: "text-gray-600",
                    icon: XCircle,
                    dotColor: "bg-gray-600"
                };
            case "finalizada":
                return {
                    accentColor: "from-blue-500 to-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-blue-600",
                    icon: CheckCircle,
                    dotColor: "bg-blue-500"
                };
            default:
                return {
                    accentColor: "from-gray-400 to-gray-500",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-gray-600",
                    icon: AlertCircle,
                    dotColor: "bg-gray-400"
                };
        }
    };

    const statusConfig = getStatusConfig(reservation.status?.name || 'unknown');
    const statusLabel = reservation.status?.label || 'Desconocido';

    const parseLocalTime = (timestamp: string) => {
        const utcDate = new Date(timestamp);
        
        return {
            formatDate: () => {
                return utcDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric", 
                    month: "long",
                    day: "numeric"
                });
            },
            formatTime: () => {
                return utcDate.toLocaleTimeString("es-ES", {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            }
        };
    };

    const startTime = parseLocalTime(reservation.startTime);
    const endTime = parseLocalTime(reservation.endTime);
    
    const formatDate = (parsedTime: ReturnType<typeof parseLocalTime>) => {
        return parsedTime.formatDate();
    };

    const formatTime = (parsedTime: ReturnType<typeof parseLocalTime>) => {
        return parsedTime.formatTime();
    };

    const getDuration = () => {
        const startDate = new Date(reservation.startTime);
        const endDate = new Date(reservation.endTime);
        const diffMilliseconds = endDate.getTime() - startDate.getTime();
        const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
        
        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        
        if (diffHours > 0) {
            return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}min` : `${diffHours}h`;
        }
        return `${diffMinutes}min`;
    };

    const handleCancel = () => {
        onCancel(reservation.id);
    };

    const isReservationPast = (): boolean => {
        const now = new Date();
        const reservationEndDate = new Date(reservation.endTime);
        return reservationEndDate < now;
    };

    const isReservationCancelled = (): boolean => {
        const cancelledStatuses = ["cancelada", "cancelled", "canceled", "denied"];
        return cancelledStatuses.includes(reservation.status?.name?.toLowerCase() || '');
    };

    const isActive = (reservation.status?.name === "confirmada" || reservation.status?.name === "pendiente") && 
                     !isReservationPast() && 
                     !isReservationCancelled();

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${statusConfig.borderColor} ${statusConfig.bgColor} shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300`}>
            {/* Status Indicator - Minimal dot and text */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig.dotColor} shadow-sm`}></div>
                <span className={`${statusConfig.statusTextColor} font-semibold text-sm`}>{statusLabel}</span>
            </div>

            <div className="p-6 pt-16">
                {/* Amenity Name */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gray-800 shadow-md">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {reservation.amenity.name}
                    </h3>
                </div>

                {/* Date and Time Info */}
                <div className="space-y-4 mb-6">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 capitalize">
                                {formatDate(startTime)}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    {getDuration()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {isActive ? (
                        <LoadingButton
                            onClick={handleCancel}
                            loading={isCancelling}
                            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                            loadingText="Cancelando..."
                        >
                            <X className="w-4 h-4" />
                            {reservation.status?.name === "pendiente" ? "Cancelar solicitud" : "Cancelar reserva"}
                        </LoadingButton>
                    ) : (
                        <LoadingButton
                            onClick={() => onRemoveFromView(reservation.id)}
                            loading={isHiding}
                            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                            loadingText="Eliminando..."
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar de vista
                        </LoadingButton>
                    )}
                </div>
            </div>

            {/* Subtle accent border on the left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${statusConfig.accentColor}`}></div>
        </div>
    );
}

export default ReservationCard;