import { useState, useEffect } from "react";
import type { ReservationData, Amenity } from "../types";
import { LoadingButton } from "./LoadingSpinner";
import { Calendar, Users, Clock, AlertCircle } from "lucide-react";
import ModernDatePicker from "./ModernDatePicker";
import ModernTimePicker from "./ModernTimePicker";

function isTimeWithinOperatingHours(timeSlot: string, openTime?: string, closeTime?: string): boolean {
    if (!openTime || !closeTime) return true;
    
    const [startTime, endTime] = timeSlot.split(" - ");
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

function formatOperatingHours(openTime?: string, closeTime?: string): string {
    if (!openTime || !closeTime) return "";
    
    const normalizeTime = (time: string) => {
        const [hour, minute] = time.split(':');
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    };
    
    return `${normalizeTime(openTime)} - ${normalizeTime(closeTime)}`;
}

interface TimeSelectorProps {
    selectedSpace: string;
    selectedTime: string;
    selectedDate: string;
    amenities: Amenity[];
    reservations: ReservationData;
    timeError: string | null;
    onTimeChange: (newTime: string) => void;
    onDateChange: (newDate: string) => void;
    onReserve: () => void;
    isReserving?: boolean;
    getCurrentReservationCount?: (amenityName: string, date: string, timeSlot: string) => Promise<number>;
}

function TimeSelector({
    selectedSpace,
    selectedTime,
    selectedDate,
    amenities,
    timeError,
    onTimeChange,
    onDateChange,
    onReserve,
    isReserving = false,
    getCurrentReservationCount
}: TimeSelectorProps) {
    const [currentReservationCount, setCurrentReservationCount] = useState<number>(0);
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    
    const selectedAmenity = amenities.find(a => a.name === selectedSpace);
    const maxDuration = selectedAmenity?.maxDuration || 60;
    
    const isTimeValid = !selectedTime || !selectedAmenity || isTimeWithinOperatingHours(selectedTime, selectedAmenity.openTime, selectedAmenity.closeTime);
    const isAmenityActive = selectedAmenity?.isActive !== false;
    
    useEffect(() => {
        const updateReservationCount = async () => {
            if (getCurrentReservationCount && selectedSpace && selectedDate && selectedTime) {
                setIsLoadingCount(true);
                try {
                    const count = await getCurrentReservationCount(selectedSpace, selectedDate, selectedTime);
                    setCurrentReservationCount(count);
                } catch (error) {
                    console.error('Error fetching reservation count:', error);
                    setCurrentReservationCount(0);
                } finally {
                    setIsLoadingCount(false);
                }
            } else {
                setCurrentReservationCount(0);
            }
        };

        updateReservationCount();
    }, [selectedSpace, selectedDate, selectedTime, getCurrentReservationCount]);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 h-full">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Selecciona tu Horario
                </h2>
                <p className="text-gray-600 text-lg">Elige la fecha y hora perfecta para tu reserva</p>
            </div>

            <div className="space-y-6">
                {/* Operating Hours - Prominent Display */}
                {selectedAmenity && selectedAmenity.openTime && selectedAmenity.closeTime && (
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Horarios Disponibles</h3>
                                <p className="text-blue-100">Reservas disponibles durante estos horarios</p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-1">
                                    {formatOperatingHours(selectedAmenity.openTime, selectedAmenity.closeTime)}
                                </div>
                                <div className="text-blue-100 text-sm">
                                    {selectedAmenity.name} - Duración máxima: {selectedAmenity.maxDuration} min
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inactive Amenity Warning */}
                {selectedAmenity && !isAmenityActive && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">Amenity no disponible</span>
                        </div>
                        <p className="text-red-700">
                            Este amenity está temporalmente fuera de servicio.
                        </p>
                    </div>
                )}

                {/* Requires Approval Info */}
                {selectedAmenity && isAmenityActive && selectedAmenity.requiresApproval && (
                    <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-amber-900 text-lg">Requiere Aprobación del Administrador</span>
                                </div>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    Tu solicitud de reserva quedará en estado <span className="font-semibold">Pendiente</span> hasta que un administrador la apruebe. 
                                    Recibirás una notificación cuando sea revisada.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modern Date Picker */}
                <ModernDatePicker
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                    label="Fecha de Reserva"
                    minDate={new Date().toISOString().split('T')[0]} // Can't select past dates
                />

                {/* Modern Time Picker */}
                <ModernTimePicker
                    selectedTime={selectedTime}
                    onTimeChange={onTimeChange}
                    maxDuration={maxDuration}
                    selectedDate={selectedDate}
                    openTime={selectedAmenity?.openTime}
                    closeTime={selectedAmenity?.closeTime}
                    label="Horario de Reserva"
                />

                {/* Schedule Validation Warning */}
                {selectedTime && selectedAmenity && !isTimeWithinOperatingHours(selectedTime, selectedAmenity.openTime, selectedAmenity.closeTime) && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-800">Horario fuera de operación</span>
                        </div>
                        <p className="text-amber-700">
                            El horario seleccionado está fuera del horario de operación del amenity.
                            {selectedAmenity.openTime && selectedAmenity.closeTime && (
                                <> Horario disponible: {formatOperatingHours(selectedAmenity.openTime, selectedAmenity.closeTime)}</>
                            )}
                        </p>
                    </div>
                )}

                {/* Error */}
                {timeError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                        <p className="text-red-700 font-medium">{timeError}</p>
                    </div>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Duración máxima</span>
                        <span className="font-bold text-gray-800">{selectedAmenity?.maxDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Reservas actuales
                        </span>
                        <span className="font-bold text-gray-800">
                            {isLoadingCount ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                currentReservationCount
                            )}
                        </span>
                    </div>
                </div>

                {/* Botón reservar */}
                <div className="pt-4">
                    <LoadingButton
                        onClick={onReserve}
                        loading={isReserving}
                        disabled={!isTimeValid || !isAmenityActive}
                        className={`w-full py-5 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 ${
                            !isTimeValid || !isAmenityActive
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700 text-white hover:shadow-3xl transform hover:scale-105'
                        }`}
                        loadingText="Reservando..."
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {!isAmenityActive 
                                ? 'Amenity no disponible' 
                                : !isTimeValid 
                                    ? 'Horario no válido' 
                                    : selectedAmenity?.requiresApproval 
                                        ? `Solicitar Reserva de ${selectedSpace}`
                                        : `Reservar ${selectedSpace}`
                            }
                        </span>
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
}

export default TimeSelector;