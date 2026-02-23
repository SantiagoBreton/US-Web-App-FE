import ReservationCard from "./ReservationCard";
import type { Reservation } from "../types";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ReservationListProps {
    reservations: Reservation[];
    onCancelReservation: (reservationId: number) => void;
    onRemoveFromView: (reservationId: number) => void;
    cancellingId?: number | null;
    hidingId?: number | null;
}

const ITEMS_PER_PAGE = 9;

function ReservationList({ 
    reservations, 
    onCancelReservation, 
    onRemoveFromView,
    cancellingId,
    hidingId
}: ReservationListProps) {
    console.log('ReservationList - All reservations:', reservations.map(r => ({
        id: r.id,
        status: r.status,
        startTime: r.startTime,
        amenityName: r.amenity?.name
    })));

    const isReservationPast = (reservation: Reservation): boolean => {
        const now = new Date();
        const reservationEndDate = new Date(reservation.endTime);
        return reservationEndDate < now;
    };

    const isReservationCancelled = (reservation: Reservation): boolean => {
        const cancelledStatuses = ["cancelada", "cancelled", "canceled", "denied"];
        return cancelledStatuses.includes(reservation.status?.name?.toLowerCase() || '');
    };

    const isReservationFinished = (reservation: Reservation): boolean => {
        const finishedStatuses = ["finalizada", "finished", "completed"];
        return finishedStatuses.includes(reservation.status?.name?.toLowerCase() || '');
    };

    const activeReservations = reservations.filter(r => 
        (r.status?.name === "confirmada" || r.status?.name === "pendiente") && 
        !isReservationPast(r) &&
        !isReservationCancelled(r) &&
        !isReservationFinished(r)
    );
    
    const inactiveReservations = reservations.filter(r => 
        isReservationCancelled(r) || 
        isReservationPast(r) ||
        isReservationFinished(r)
    );


    console.log('ReservationList - Active reservations:', activeReservations.map(r => ({
        id: r.id,
        status: r.status,
        startTime: r.startTime
    })));
    console.log('ReservationList - Inactive reservations:', inactiveReservations.map(r => ({
        id: r.id,
        status: r.status,
        startTime: r.startTime,
        isCancelled: isReservationCancelled(r),
        isPast: isReservationPast(r)
    })));


    const [activeCurrentPage, setActiveCurrentPage] = useState(1);
    const activeTotalPages = Math.ceil(activeReservations.length / ITEMS_PER_PAGE);
    const activeStartIndex = (activeCurrentPage - 1) * ITEMS_PER_PAGE;
    const activeEndIndex = activeStartIndex + ITEMS_PER_PAGE;
    const activeCurrentItems = activeReservations.slice(activeStartIndex, activeEndIndex);


    const [inactiveCurrentPage, setInactiveCurrentPage] = useState(1);
    const inactiveTotalPages = Math.ceil(inactiveReservations.length / ITEMS_PER_PAGE);
    const inactiveStartIndex = (inactiveCurrentPage - 1) * ITEMS_PER_PAGE;
    const inactiveEndIndex = inactiveStartIndex + ITEMS_PER_PAGE;
    const inactiveCurrentItems = inactiveReservations.slice(inactiveStartIndex, inactiveEndIndex);


    const PaginationControls = ({ 
        currentPage, 
        totalPages, 
        onPageChange, 
        label 
    }: { 
        currentPage: number; 
        totalPages: number; 
        onPageChange: (page: number) => void; 
        label: string;
    }) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Página {currentPage} de {totalPages}</span>
                    <span>•</span>
                    <span>{label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg font-semibold transition-colors cursor-pointer ${
                                    pageNum === currentPage
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <section className="space-y-12">
            {/* Active Reservations Section */}
            {activeReservations.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-gray-800 rounded-xl shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Reservas Activas
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {activeReservations.length} reserva{activeReservations.length !== 1 ? 's' : ''} confirmada{activeReservations.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {activeCurrentItems.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onCancel={onCancelReservation}
                                onRemoveFromView={onRemoveFromView}
                                isCancelling={cancellingId === reservation.id}
                                isHiding={hidingId === reservation.id}
                            />
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={activeCurrentPage}
                        totalPages={activeTotalPages}
                        onPageChange={setActiveCurrentPage}
                        label={`${activeReservations.length} reserva${activeReservations.length !== 1 ? 's' : ''} activa${activeReservations.length !== 1 ? 's' : ''}`}
                    />
                </div>
            )}

            {/* Inactive Reservations Section */}
            {inactiveReservations.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-gray-600 rounded-xl shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                                Historial
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {inactiveReservations.length} reserva{inactiveReservations.length !== 1 ? 's' : ''} cancelada{inactiveReservations.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {inactiveCurrentItems.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onCancel={onCancelReservation}
                                onRemoveFromView={onRemoveFromView}
                                isCancelling={cancellingId === reservation.id}
                                isHiding={hidingId === reservation.id}
                            />
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={inactiveCurrentPage}
                        totalPages={inactiveTotalPages}
                        onPageChange={setInactiveCurrentPage}
                        label={`${inactiveReservations.length} reserva${inactiveReservations.length !== 1 ? 's' : ''} en historial`}
                    />
                </div>
            )}

            {/* Empty State */}
            {reservations.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                        <Calendar className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No tienes reservas aún
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Cuando hagas una reserva, aparecerá aquí. ¡Comienza reservando un espacio arriba!
                    </p>
                </div>
            )}
        </section>
    );
}

export default ReservationList;