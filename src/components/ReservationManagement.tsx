import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, Filter, Clock, User, Building, Eye, ChevronDown, CheckCircle, XCircle, Clock as PendingIcon, CalendarDays, ThumbsUp, ThumbsDown } from "lucide-react";
import { getAdminReservations, getAdminAmenities, approveReservation, rejectReservation, cancelReservationAsAdmin, type AdminReservation, type AdminAmenity } from "../api_calls/admin";
import GenericFilterModal, { type FilterOption } from "./GenericFilterModal";
import DateFilterModal, { type DateFilterOption } from "./DateFilterModal";

interface ReservationManagementProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

const statusOptions: FilterOption[] = [
  { 
    value: 'all', 
    label: 'Todos los Estados', 
    icon: Filter,
    description: 'Ver todas las reservas sin filtro'
  },
  { 
    value: 'confirmada', 
    label: 'Confirmadas', 
    icon: CheckCircle,
    description: 'Reservas que han sido confirmadas'
  },
  { 
    value: 'pendiente', 
    label: 'Pendientes', 
    icon: PendingIcon,
    description: 'Reservas que están esperando confirmación'
  },
  { 
    value: 'cancelada', 
    label: 'Canceladas', 
    icon: XCircle,
    description: 'Reservas que han sido canceladas'
  },
  { 
    value: 'finalizada', 
    label: 'Finalizadas', 
    icon: Clock,
    description: 'Reservas que han sido completadas'
  }
];

function ReservationManagement({ isOpen, onClose, token }: ReservationManagementProps) {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<AdminReservation[]>([]);
    const [amenities, setAmenities] = useState<AdminAmenity[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterAmenity, setFilterAmenity] = useState<string>("all");
    const [filterDate, setFilterDate] = useState<string>("all");
    const [dateFilterOption, setDateFilterOption] = useState<DateFilterOption | null>(null);
    const [processingReservationId, setProcessingReservationId] = useState<number | null>(null);
    const [rejectingReservationId, setRejectingReservationId] = useState<number | null>(null);
    const [cancellingReservationId, setCancellingReservationId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState<string>("");
    const [cancelReason, setCancelReason] = useState<string>("");
    
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAmenityModal, setShowAmenityModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);

    const handleApprove = async (reservationId: number) => {
        if (processingReservationId) return;
        
        setProcessingReservationId(reservationId);
        try {
            await approveReservation(token, reservationId);
            await loadReservations();
        } catch (error) {
            console.error("Error approving reservation:", error);
            alert(error instanceof Error ? error.message : "Error al aprobar la reserva");
        } finally {
            setProcessingReservationId(null);
        }
    };

    const handleReject = async (reservationId: number) => {
        if (processingReservationId) return;
        
        setProcessingReservationId(reservationId);
        try {
            await rejectReservation(token, reservationId, rejectReason || undefined);
            await loadReservations();
            setRejectingReservationId(null);
            setRejectReason("");
        } catch (error) {
            console.error("Error rejecting reservation:", error);
            alert(error instanceof Error ? error.message : "Error al rechazar la reserva");
        } finally {
            setProcessingReservationId(null);
        }
    };

    const handleCancel = async (reservationId: number) => {
        if (processingReservationId) return;
        
        setProcessingReservationId(reservationId);
        try {
            await cancelReservationAsAdmin(token, reservationId, cancelReason || undefined);
            await loadReservations();
            setCancellingReservationId(null);
            setCancelReason("");
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert(error instanceof Error ? error.message : "Error al cancelar la reserva");
        } finally {
            setProcessingReservationId(null);
        }
    };

    const loadReservations = useCallback(async () => {
        setLoading(true);
        try {
            const reservationsData = await getAdminReservations(token, { limit: 100 });

            if (Array.isArray(reservationsData)) {
                setReservations(reservationsData);
            } else {
                console.error("Reservations data is not an array:", reservationsData);
                setReservations([]);
            }
        } catch (error) {
            console.error("Error loading reservations:", error);
            setReservations([]);
            console.warn("Failed to load reservations, showing empty list");
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadAmenities = useCallback(async () => {
        try {
            const amenitiesData = await getAdminAmenities(token);
            setAmenities(amenitiesData);
        } catch (error) {
            console.error("Error loading amenities:", error);
            setAmenities([]);
        }
    }, [token]);

    useEffect(() => {
        if (isOpen && token) {
            loadReservations();
            loadAmenities();
        }
    }, [isOpen, token, loadReservations, loadAmenities]);

    useEffect(() => {
        
        let filtered = reservations;

        if (searchTerm) {
            filtered = filtered.filter(reservation => 
                reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reservation.amenity?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter(reservation => reservation.status?.name === filterStatus);
        }

        if (filterAmenity !== "all") {
            filtered = filtered.filter(reservation => reservation.amenity?.name === filterAmenity);
        }

        if (dateFilterOption && dateFilterOption.startDate && dateFilterOption.endDate) {
            console.log('🔍 [DATE FILTER DEBUG] Filtering reservations with date range:', {
                filterOption: dateFilterOption.value,
                startDate: dateFilterOption.startDate,
                endDate: dateFilterOption.endDate
            });
            
            filtered = filtered.filter(reservation => {
                const reservationDate = new Date(reservation.startTime);
                reservationDate.setHours(0, 0, 0, 0);
                
                const startDate = new Date(dateFilterOption.startDate!);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(dateFilterOption.endDate!);
                endDate.setHours(23, 59, 59, 999);
                
                const isInRange = reservationDate >= startDate && reservationDate <= endDate;
                
                if (dateFilterOption.value === 'custom') {
                    console.log('🔍 [CUSTOM FILTER] Checking reservation:', {
                        reservationId: reservation.id,
                        startTime: reservation.startTime,
                        normalizedReservationDate: reservationDate,
                        filterStartDate: startDate,
                        filterEndDate: endDate,
                        isInRange
                    });
                }
                
                return isInRange;
            });
            
            console.log(`🔍 [DATE FILTER DEBUG] Filtered to ${filtered.length} reservations`);
        }

        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredReservations(filtered);
    }, [reservations, searchTerm, filterStatus, filterAmenity, dateFilterOption]);

    const getCurrentStatusLabel = () => {
        if (filterStatus === 'all') return 'Todos los estados';
        switch (filterStatus) {
            case 'confirmada': return 'Confirmadas';
            case 'pendiente': return 'Pendientes'; 
            case 'cancelada': return 'Canceladas';
            case 'finalizada': return 'Finalizadas';
            default: return 'Estado desconocido';
        }
    };

    const getCurrentAmenityLabel = () => {
        if (filterAmenity === 'all') return 'Todos los amenities';
        const amenity = amenities.find(a => a.name === filterAmenity);
        return amenity?.name || 'Amenity desconocido';
    };

    const getCurrentDateLabel = () => {
        if (!dateFilterOption || filterDate === 'all') return 'Todas las fechas';
        return dateFilterOption.label;
    };

    const handleDateFilterSelect = (option: DateFilterOption) => {
        setFilterDate(option.value);
        setDateFilterOption(option);
    };

    const getAmenityOptions = (): FilterOption[] => {
        const options: FilterOption[] = [
            { 
                value: 'all', 
                label: 'Todos los Amenities', 
                icon: Filter,
                description: 'Ver todas las reservas sin filtro por amenity'
            }
        ];
        
        amenities.forEach(amenity => {
            options.push({
                value: amenity.name,
                label: amenity.name,
                icon: Building,
                description: `Reservas para ${amenity.name}`
            });
        });
        
        return options;
    };

    const formatDateTime = (dateString: string) => {
        
        const utcDate = new Date(dateString);
        
        return {
            date: utcDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            }),
            time: utcDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        };
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-7xl w-full max-h-[90vh] mx-4 overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por usuario, email o amenity..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            {/* Status Filter Button */}
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[160px]"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <span className={filterStatus === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                        {getCurrentStatusLabel()}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Amenity Filter Button */}
                            <button
                                onClick={() => setShowAmenityModal(true)}
                                className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[180px]"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <span className={filterAmenity === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                        {getCurrentAmenityLabel()}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Date Filter Button */}
                            <button
                                onClick={() => setShowDateModal(true)}
                                className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[180px]"
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                    <span className={filterDate === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                        {getCurrentDateLabel()}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Reservations List */}
                    <div className="flex-1 overflow-y-auto scrollbar-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredReservations.map((reservation) => {
                                    const startTime = formatDateTime(reservation.startTime);
                                    const endTime = formatDateTime(reservation.endTime);
                                    const createdAt = formatDateTime(reservation.createdAt);
                                    
                                    return (
                                        <motion.div
                                            key={reservation.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-semibold text-gray-800">
                                                                    {reservation.amenity?.name || 'Amenidad desconocida'}
                                                                </h3>
                                                                <div className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-300">
                                                                    {reservation.status?.label || reservation.status?.name || 'Desconocido'}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    <span>{reservation.user?.name || 'Usuario desconocido'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span>📧</span>
                                                                    <span>{reservation.user?.email || 'Email desconocido'}</span>
                                                                </div>
                                                                {reservation.user && reservation.user.apartment && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Building className="w-4 h-4" />
                                                                        <span>Apt: {reservation.user.apartment.unit}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-green-500" />
                                                            <div>
                                                                <span className="text-gray-500">Inicio:</span>
                                                                <div className="font-medium">{startTime.date} {startTime.time}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-red-500" />
                                                            <div>
                                                                <span className="text-gray-500">Fin:</span>
                                                                <div className="font-medium">{endTime.date} {endTime.time}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-4 h-4 text-blue-500" />
                                                            <div>
                                                                <span className="text-gray-500">Creada:</span>
                                                                <div className="font-medium">{createdAt.date} {createdAt.time}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Approve/Reject buttons for pending reservations */}
                                                    {reservation.status?.name === 'pendiente' && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            {rejectingReservationId === reservation.id ? (
                                                                <div className="space-y-3">
                                                                    <textarea
                                                                        value={rejectReason}
                                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                                        placeholder="Razón del rechazo (opcional)..."
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                                                        rows={2}
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleReject(reservation.id)}
                                                                            disabled={processingReservationId === reservation.id}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            {processingReservationId === reservation.id ? (
                                                                                <>
                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                    <span>Rechazando...</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ThumbsDown className="w-4 h-4" />
                                                                                    <span>Confirmar Rechazo</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setRejectingReservationId(null);
                                                                                setRejectReason("");
                                                                            }}
                                                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleApprove(reservation.id)}
                                                                        disabled={processingReservationId === reservation.id}
                                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {processingReservationId === reservation.id ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                <span>Aprobando...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ThumbsUp className="w-4 h-4" />
                                                                                <span>Aprobar</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectingReservationId(reservation.id)}
                                                                        disabled={processingReservationId === reservation.id}
                                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                        <span>Rechazar</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Cancel button for confirmed reservations (admin can cancel any reservation) */}
                                                    {reservation.status?.name === 'confirmada' && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            {cancellingReservationId === reservation.id ? (
                                                                <div className="space-y-3">
                                                                    <textarea
                                                                        value={cancelReason}
                                                                        onChange={(e) => setCancelReason(e.target.value)}
                                                                        placeholder="Razón de la cancelación (opcional)..."
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-sm"
                                                                        rows={2}
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleCancel(reservation.id)}
                                                                            disabled={processingReservationId === reservation.id}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-medium"
                                                                        >
                                                                            {processingReservationId === reservation.id ? (
                                                                                <>
                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                    <span>Cancelando...</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <XCircle className="w-4 h-4" />
                                                                                    <span>Confirmar Cancelación</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setCancellingReservationId(null);
                                                                                setCancelReason("");
                                                                            }}
                                                                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setCancellingReservationId(reservation.id)}
                                                                    disabled={processingReservationId === reservation.id}
                                                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-medium group"
                                                                >
                                                                    <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                                    <span>Cancelar Reserva (Admin)</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                
                                {filteredReservations.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No se encontraron reservas</p>
                                        <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-orange-600">{Array.isArray(reservations) ? reservations.length : 0}</div>
                                <div className="text-sm text-gray-500">Total Reservas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{Array.isArray(reservations) ? reservations.filter(r => r.status?.name === 'confirmada').length : 0}</div>
                                <div className="text-sm text-gray-500">Confirmadas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{Array.isArray(reservations) ? reservations.filter(r => r.status?.name === 'pendiente').length : 0}</div>
                                <div className="text-sm text-gray-500">Pendientes</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{Array.isArray(reservations) ? reservations.filter(r => r.status?.name === 'cancelada').length : 0}</div>
                                <div className="text-sm text-gray-500">Canceladas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{Array.isArray(reservations) ? reservations.filter(r => r.status?.name === 'finalizada').length : 0}</div>
                                <div className="text-sm text-gray-500">Finalizadas</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Modals */}
            <GenericFilterModal
                isVisible={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                selectedValue={filterStatus}
                onValueSelect={setFilterStatus}
                options={statusOptions}
                title="Filtrar por Estado"
                subtitle="Selecciona un estado para filtrar las reservas"
                headerIcon={Filter}
                headerIconColor="text-orange-600"
                maxWidth="2xl"
            />

            <GenericFilterModal
                isVisible={showAmenityModal}
                onClose={() => setShowAmenityModal(false)}
                selectedValue={filterAmenity}
                onValueSelect={setFilterAmenity}
                options={getAmenityOptions()}
                title="Filtrar por Amenity"
                subtitle="Selecciona un amenity para filtrar las reservas"
                headerIcon={Building}
                headerIconColor="text-orange-600"
                maxWidth="2xl"
            />

            <DateFilterModal
                isVisible={showDateModal}
                onClose={() => setShowDateModal(false)}
                onDateFilterSelect={handleDateFilterSelect}
                selectedValue={filterDate}
                title="Filtrar por Fecha"
                subtitle="Selecciona un rango de fechas para filtrar las reservas"
            />
        </AnimatePresence>
    );
}

export default ReservationManagement;