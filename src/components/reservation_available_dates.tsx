import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Clock, Calendar } from "lucide-react";
import { LoadingOverlay } from "./LoadingSpinner";

interface Reservation {
  id?: number;
  amenityId?: number;
  userId?: number;
  startTime: string;
  endTime: string;
  status?: string;
  createdAt?: string;
  user?: { id: number; name: string };
}
interface AvailabilityViewerProps {
  amenityId: number;
  amenityName: string;
  capacity: number;
  openTime?: string; 
  closeTime?: string; 
  fetchReservations: (amenityId: number) => Promise<Reservation[]>;
  isLoading?: boolean;
}

function getDayKey(d: Date) {

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getColorByRatio(ratio: number) {

  if (ratio >= 1) return "bg-red-500 text-white border-red-600";
  if (ratio >= 0.8) return "bg-orange-500 text-white border-orange-600";
  if (ratio >= 0.5) return "bg-yellow-400 text-black border-yellow-500";
  return "bg-green-400 text-black border-green-500";
}

export default function AvailabilityTimelineViewer({
  amenityId,
  amenityName,
  capacity,
  openTime,
  closeTime,
  fetchReservations,
  isLoading = false,
}: AvailabilityViewerProps) {
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [selectedSlot, setSelectedSlot] = useState<{
    reservations: Reservation[];
    timeSlot: string;
    day: string;
  } | null>(null);


  const { VISIBLE_START_HOUR, VISIBLE_END_HOUR, TOTAL_MINUTES } = useMemo(() => {

    const parseHour = (timeStr?: string) => timeStr ? parseInt(timeStr.split(':')[0]) : null;
    
    const startHour = parseHour(openTime) ?? 8; 
    const endHour = parseHour(closeTime) ?? 20; 
    

    const finalStartHour = Math.max(6, Math.min(startHour, 22));
    const finalEndHour = Math.min(23, Math.max(endHour, finalStartHour + 2));
    
    const totalMinutes = (finalEndHour - finalStartHour) * 60;
    
    return {
      VISIBLE_START_HOUR: finalStartHour,
      VISIBLE_END_HOUR: finalEndHour,
      TOTAL_MINUTES: totalMinutes
    };
  }, [openTime, closeTime]);


  const days = useMemo(() => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    

    currentWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      result.push({
        date: day,
        label: day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }),
        key: getDayKey(day),
      });
    }
    return result;
  }, [weekOffset]);


  useEffect(() => {
    if (open && !isLoading) {
      setIsLoadingReservations(true);
      

      const endOfWeek = new Date(days[6].date);
      endOfWeek.setHours(23, 59, 59, 999);
      
      fetchReservations(amenityId)
        .then((data) => {
          setReservations(data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingReservations(false));
    }
  }, [open, amenityId, fetchReservations, isLoading, weekOffset, days]);

  
  useEffect(() => {
    setReservations([]);
    setSelectedSlot(null);
    setWeekOffset(0); 
  }, [amenityId]);


  useEffect(() => {
    if (!open) {
      setWeekOffset(0);
    }
  }, [open]);

  const reservationsByDay = useMemo(() => {
    const result: Record<string, Reservation[]> = {};
    days.forEach((d) => {
      result[d.key] = [];
    });

    reservations.forEach((res) => {
      const startDate = new Date(res.startTime);
      const dayKey = getDayKey(startDate);

      if (result[dayKey]) {
        const exists = result[dayKey].some((existing) => {
          if (res.id !== undefined && existing.id !== undefined) {
            return existing.id === res.id;
          }
          return (
            existing.startTime === res.startTime &&
            existing.endTime === res.endTime &&
            (existing.user?.id ?? existing.user?.name) === (res.user?.id ?? res.user?.name)
          );
        });

        if (!exists) {
          result[dayKey].push(res);
        }
      }
    });

    return result;
  }, [reservations, days]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 font-medium transform hover:scale-105 cursor-pointer text-xs sm:text-base min-w-0"
      >
        <div className="relative flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <span className="text-xs sm:text-sm tracking-wide truncate min-w-0">
          <span className="sm:hidden">Timeline</span>
          <span className="hidden sm:inline">Ver disponibilidad (Timeline)</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
      </button>

      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-3 sm:p-6 max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] mx-2 sm:mx-4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate pr-4">
                Disponibilidad Timeline - {amenityName}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="px-3 sm:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer flex-shrink-0 text-sm sm:text-base"
              >
                ✕
              </button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Semana anterior</span>
                <span className="sm:hidden">Anterior</span>
              </button>
              
              <div className="flex flex-col items-center flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-700 text-center">
                  {weekOffset === 0 ? "Esta semana" : 
                   weekOffset === 1 ? "Próxima semana" :
                   weekOffset > 0 ? `En ${weekOffset} semanas` :
                   `Hace ${Math.abs(weekOffset)} semana${Math.abs(weekOffset) > 1 ? 's' : ''}`}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 text-center truncate">
                  {days[0]?.label} - {days[6]?.label}
                </p>
              </div>

              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Semana siguiente</span>
                <span className="sm:hidden">Siguiente</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-8 gap-2 min-h-[1050px]"> {/* Increased by 50% from 700px to 1050px */}
                {/* Time labels */}
                <div className="flex flex-col">
                  <div className="h-24 flex items-center justify-center font-bold text-gray-700 border-b border-gray-200">
                    Hora
                  </div>
                  <div className="flex-1 relative">
                    {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, i) => {
                      const hour = VISIBLE_START_HOUR + i;
                      const topPct = (i * 60 / TOTAL_MINUTES) * 100;
                      return (
                        <div
                          key={hour}
                          className="absolute w-full text-xs text-gray-500 font-medium border-t border-gray-100 pl-2 pt-1"
                          style={{ top: `${topPct}%` }}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day columns */}
                {days.map((dayObj) => (
                  <div key={dayObj.key} className="flex flex-col">
                    <div className="h-24 flex flex-col items-center justify-center border-b border-gray-200">
                      <div className="font-bold text-gray-700">{dayObj.label}</div>
                      <div className="text-xs text-gray-500">{dayObj.date.getDate()}/{dayObj.date.getMonth() + 1}</div>
                    </div>
                    <div className="flex-1 relative bg-gray-50 border-r border-gray-200">
                      {/* Hour grid lines */}
                      {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR }, (_, i) => {
                        const topPct = ((i + 1) * 60 / TOTAL_MINUTES) * 100;
                        return (
                          <div
                            key={i}
                            className="absolute w-full border-t border-gray-200"
                            style={{ top: `${topPct}%` }}
                          />
                        );
                      })}

                      {/* Reservations for this day */}
                      <div className="absolute inset-0">
                        {(() => {
                          const dayReservations = reservationsByDay[dayObj.key] || [];
                          
                          if (dayReservations.length === 0) return null;
                          
                          const parseLocalTimeToMinutes = (timestamp: string) => {
                            const utcDate = new Date(timestamp);
                            return utcDate.getHours() * 60 + utcDate.getMinutes();
                          };

                          const boundaries = new Set<number>();
                          dayReservations.forEach(res => {
                            const startMinutes = parseLocalTimeToMinutes(res.startTime);
                            const endMinutes = parseLocalTimeToMinutes(res.endTime);
                            boundaries.add(startMinutes);
                            boundaries.add(endMinutes);
                          });
                          
                          const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);
                          const segments = [];
                          
                          for (let i = 0; i < sortedBoundaries.length - 1; i++) {
                            const segmentStart = sortedBoundaries[i];
                            const segmentEnd = sortedBoundaries[i + 1];
                            
                            const overlappingReservations = dayReservations.filter(res => {
                              const resStart = parseLocalTimeToMinutes(res.startTime);
                              const resEnd = parseLocalTimeToMinutes(res.endTime);
                              return resStart < segmentEnd && resEnd > segmentStart;
                            });
                            
                            if (overlappingReservations.length > 0) {
                              segments.push({
                                start: segmentStart,
                                end: segmentEnd,
                                reservations: overlappingReservations,
                                count: overlappingReservations.length
                              });
                            }
                          }
                          
                          return segments.map((segment) => {
                            const clampedStart = Math.max(segment.start, VISIBLE_START_HOUR * 60);
                            const clampedEnd = Math.min(segment.end, VISIBLE_END_HOUR * 60);
                            
                            if (clampedStart >= clampedEnd) return null;
                            
                            const startRelative = clampedStart - VISIBLE_START_HOUR * 60;
                            const endRelative = clampedEnd - VISIBLE_START_HOUR * 60;
                            const topPct = (startRelative / TOTAL_MINUTES) * 100;
                            const heightPct = ((endRelative - startRelative) / TOTAL_MINUTES) * 100;
                            
                            const formatTimeFromMinutes = (totalMinutes: number) => {
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                            };
                            
                            const startStr = formatTimeFromMinutes(segment.start);
                            const endStr = formatTimeFromMinutes(segment.end);

                            const ratio = segment.count / capacity;
                            const colorClass = getColorByRatio(ratio);

                            return (
                              <div
                                key={`segment-${segment.start}-${segment.end}`}
                                className={`absolute rounded-lg p-1 border-2 shadow-lg cursor-pointer hover:shadow-xl hover:z-10 transition-all ${colorClass}`}
                                style={{
                                  top: `${topPct}%`,
                                  height: `${heightPct}%`,
                                  left: `2%`,
                                  width: `96%`,
                                  zIndex: 1
                                }}
                                onClick={() => {
                                  setSelectedSlot({
                                    reservations: segment.reservations,
                                    timeSlot: `${startStr} - ${endStr}`,
                                    day: dayObj.label
                                  });
                                }}
                              >
                                <div className="font-semibold text-xs truncate flex items-center gap-1">
                                  {segment.count > 1 ? (
                                    <>
                                      <Users className="w-3 h-3 flex-shrink-0" />
                                      <span>{segment.count}</span>
                                    </>
                                  ) : (
                                    <span className="truncate">
                                      {segment.reservations[0].user?.name ? segment.reservations[0].user.name : `User ${segment.reservations[0].user?.id ?? ""}`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] opacity-90 truncate flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2 h-2 flex-shrink-0" />
                                  <span className="truncate">{startStr} - {endStr}</span>
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* legend */}
            <div className="mt-4 flex gap-3 items-center text-sm flex-wrap">
              <div className="px-3 py-1 rounded bg-green-400 text-black border border-green-500 font-medium">
                Libre (&lt;50%)
              </div>
              <div className="px-3 py-1 rounded bg-yellow-400 text-black border border-yellow-500 font-medium">
                Moderado (50-80%)
              </div>
              <div className="px-3 py-1 rounded bg-orange-500 text-white border border-orange-600 font-medium">
                Alto (80-100%)
              </div>
              <div className="px-3 py-1 rounded bg-red-500 text-white border border-red-600 font-medium">
                Lleno (100%+)
              </div>
              <div className="flex items-center gap-1 text-gray-600 ml-4">
                <Users className="w-4 h-4" />
                <span>Click para ver detalles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Multiple Reservations */}
      {selectedSlot && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedSlot(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Reservas - {selectedSlot.day}
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{selectedSlot.timeSlot}</span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedSlot.reservations.map((reservation, idx) => {
                // Parse timestamps as local time (no timezone conversion)
                const parseLocalTimeString = (timestamp: string) => {
                  // timestamp format: "2025-10-02T19:00:00.000Z" (UTC)
                  const utcDate = new Date(timestamp);
                  return utcDate.toLocaleTimeString("es-ES", {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                };
                
                const startTime = parseLocalTimeString(reservation.startTime);
                const endTime = parseLocalTimeString(reservation.endTime);

                return (
                  <div 
                    key={`${reservation.id}-${idx}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {reservation.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {reservation.user?.name || `Usuario ${reservation.user?.id || 'Desconocido'}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{startTime} - {endTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              {selectedSlot.reservations.length} persona(s) en este horario
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading || isLoadingReservations} text="Cargando disponibilidad..." />
    </>
  );
}