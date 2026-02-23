import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Filter,
  ChevronDown,
  CalendarDays
} from 'lucide-react';
import { getAdminReservations } from '../api_calls/admin';
import DateFilterModal, { type DateFilterOption } from './DateFilterModal';
import AmenityFilterModal from './AmenityFilterModal';

interface TimeSlot {
  hour: number;
  count: number;
  label: string;
}

interface AmenityStats {
  id: number;
  name: string;
  totalReservations: number;
  peakHours: TimeSlot[];
  utilizationRate: number;
  averageDuration: number;
}

interface HourlyData {
  hour: string;
  count: number;
  amenities: { [key: string]: number };
}

interface ReservationsAnalyticsProps {
  token: string;
}

const ReservationsAnalytics: React.FC<ReservationsAnalyticsProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [amenityStats, setAmenityStats] = useState<AmenityStats[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [timelineSegments, setTimelineSegments] = useState<Array<{
    startMinutes: number;
    endMinutes: number;
    amenityName: string;
    layer: number;
    count: number; // Cantidad de reservas idénticas en el mismo horario
  }>>([]);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [dateFilterOption, setDateFilterOption] = useState<DateFilterOption | null>(null);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [showAmenityFilterModal, setShowAmenityFilterModal] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<Array<{id: number, name: string}>>([]);

  const getAmenityColor = (amenityName: string) => {
    const colorIndex = amenityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
    const colorConfigs = [
      { 
        gradient: 'from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500',
        solid: 'bg-blue-500',
        name: 'blue'
      },
      { 
        gradient: 'from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500',
        solid: 'bg-purple-500',
        name: 'purple'
      },
      { 
        gradient: 'from-green-500 to-green-400 hover:from-green-600 hover:to-green-500',
        solid: 'bg-green-500',
        name: 'green'
      },
      { 
        gradient: 'from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500',
        solid: 'bg-orange-500',
        name: 'orange'
      },
      { 
        gradient: 'from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500',
        solid: 'bg-pink-500',
        name: 'pink'
      },
    ];
    return colorConfigs[colorIndex];
  };

  const calculateUtilizationRate = React.useCallback((
    reservations: any[], 
    openTime: string, 
    closeTime: string,
    dateRangeStart: Date | null,
    dateRangeEnd: Date | null
  ): number => {
    if (reservations.length === 0) return 0;

    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    const dailyOpenMinutes = openHour * 60 + openMin;
    const dailyCloseMinutes = closeHour * 60 + closeMin;
    const dailyAvailableMinutes = dailyCloseMinutes - dailyOpenMinutes;

    if (dailyAvailableMinutes <= 0) return 0;

    let numberOfDays = 30;
    if (dateRangeStart && dateRangeEnd) {
      // Lo setteo a cero para evitar errores cuando se calcula la diferencia de dias en el filtro
      const startDay = new Date(dateRangeStart);
      startDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(dateRangeEnd);
      endDay.setHours(0, 0, 0, 0);
      
      const diffTime = endDay.getTime() - startDay.getTime();
      numberOfDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const totalAvailableMinutes = dailyAvailableMinutes * numberOfDays;
    const timeRanges: Array<{ start: number; end: number }> = [];
    
    reservations.forEach(res => {
      const startTime = new Date(res.startTime);
      const endTime = new Date(res.endTime);
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      
      timeRanges.push({ start: startMinutes, end: endMinutes });
    });

    timeRanges.sort((a, b) => a.start - b.start);

    const mergedRanges: Array<{ start: number; end: number }> = [];
    for (const range of timeRanges) {
      if (mergedRanges.length === 0) {
        mergedRanges.push({ ...range });
      } else {
        const lastRange = mergedRanges[mergedRanges.length - 1];
        if (range.start <= lastRange.end) {
          
          lastRange.end = Math.max(lastRange.end, range.end);
        } else {
          mergedRanges.push({ ...range });
        }
      }
    }

    const totalUsedMinutes = mergedRanges.reduce((sum, range) => {
      return sum + (range.end - range.start);
    }, 0);

    const utilizationRate = (totalUsedMinutes / totalAvailableMinutes) * 100;

    console.log('[UTILIZATION DEBUG]', {
      openTime,
      closeTime,
      dailyAvailableMinutes,
      numberOfDays,
      totalAvailableMinutes,
      reservationsCount: reservations.length,
      mergedRangesCount: mergedRanges.length,
      totalUsedMinutes,
      utilizationRate: utilizationRate.toFixed(2) + '%'
    });

    return Math.min(utilizationRate, 100);
  }, []);

  const processReservationData = React.useCallback((reservations: any[], dateRangeStart: Date | null = null, dateRangeEnd: Date | null = null): AmenityStats[] => {
    const amenityMap = new Map<string, any>();

    reservations.forEach(reservation => {
      const amenityName = reservation.amenity?.name || 'Desconocido';
      const startTime = new Date(reservation.startTime);
      const endTime = new Date(reservation.endTime);
      const hour = startTime.getHours();
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (!amenityMap.has(amenityName)) {
        const amenityData = {
          id: reservation.amenity?.id || 0,
          name: amenityName,
          totalReservations: 0,
          hourlyCount: new Array(24).fill(0),
          totalDuration: 0,
          reservations: [],
          openTime: reservation.amenity?.openTime || '00:00',
          closeTime: reservation.amenity?.closeTime || '23:59'
        };
        
        console.log('[AMENITY DATA]', amenityName, {
          openTime: reservation.amenity?.openTime,
          closeTime: reservation.amenity?.closeTime,
          usedOpenTime: amenityData.openTime,
          usedCloseTime: amenityData.closeTime
        });
        
        amenityMap.set(amenityName, amenityData);
      }

      const stats = amenityMap.get(amenityName);
      stats.totalReservations++;
      stats.hourlyCount[hour]++;
      stats.totalDuration += duration;
      stats.reservations.push(reservation);
    });

    const result: AmenityStats[] = Array.from(amenityMap.values()).map(stats => {
      const hourlyWithIndex = stats.hourlyCount.map((count: number, hour: number) => ({ hour, count }));
      const peakHours = hourlyWithIndex
        .sort((a: { hour: number; count: number }, b: { hour: number; count: number }) => b.count - a.count)
        .slice(0, 3)
        .filter((h: { hour: number; count: number }) => h.count > 0)
        .map((h: { hour: number; count: number }) => ({
          ...h,
          label: `${h.hour.toString().padStart(2, '0')}:00`
        }));

      const utilizationRate = calculateUtilizationRate(
        stats.reservations, 
        stats.openTime, 
        stats.closeTime, 
        dateRangeStart, 
        dateRangeEnd
      );

      const averageDuration = stats.totalReservations > 0 ? stats.totalDuration / stats.totalReservations : 0;

      return {
        id: stats.id,
        name: stats.name,
        totalReservations: stats.totalReservations,
        peakHours,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        averageDuration: Math.round(averageDuration * 10) / 10
      };
    });

    return result.sort((a, b) => b.totalReservations - a.totalReservations);
  }, [calculateUtilizationRate]);

  const getAmenityLegend = () => {
    const uniqueAmenities = new Map<string, { color: string; solid: string }>();
    timelineSegments.forEach(segment => {
      if (!uniqueAmenities.has(segment.amenityName)) {
        const colorConfig = getAmenityColor(segment.amenityName);
        uniqueAmenities.set(segment.amenityName, { 
          color: colorConfig.gradient, 
          solid: colorConfig.solid 
        });
      }
    });
    return Array.from(uniqueAmenities.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const processAndSetData = React.useCallback((reservations: any[]) => {
    let filteredReservations = [...reservations];


    filteredReservations = filteredReservations.filter(r => 
      r.status?.name !== 'cancelada'
    );

    if (selectedAmenity !== 'all') {
      filteredReservations = filteredReservations.filter(r =>
        r.amenity?.name === selectedAmenity
      );
    }

    let dateRangeStart: Date | null = null;
    let dateRangeEnd: Date | null = null;

    if (dateFilterOption && dateFilterOption.value !== 'all') {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (dateFilterOption.value) {
        case 'today': {
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        case 'last-7-days': {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'this-month': {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        }
        case 'last-30-days': {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'last-90-days': {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        }
        case 'this-year': {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 0, 23, 59, 59, 999);
          break;
        }
        case 'custom': {
          if (dateFilterOption.startDate && dateFilterOption.endDate) {
            startDate = new Date(dateFilterOption.startDate);
            endDate = new Date(dateFilterOption.endDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        }
      }

      if (startDate && endDate) {
        dateRangeStart = startDate;
        dateRangeEnd = endDate;
        
        filteredReservations = filteredReservations.filter(reservation => {
          const reservationDate = new Date(reservation.startTime);
          return reservationDate >= startDate! && reservationDate <= endDate!;
        });
      }
    }

    console.log('[ANALYTICS] Filtered to', filteredReservations.length, 'reservations');

    const processedStats = processReservationData(filteredReservations, dateRangeStart, dateRangeEnd);
    const processedHourly = processHourlyData(filteredReservations);
    const processedSegments = processTimelineSegments(filteredReservations);

    setAmenityStats(processedStats);
    setHourlyData(processedHourly);
    setTimelineSegments(processedSegments);
  }, [selectedAmenity, dateFilterOption, processReservationData]);

  const loadAnalyticsData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('[ANALYTICS] Loading reservations data...');

      const reservations = await getAdminReservations(token, { limit: 1000 });
      console.log('[ANALYTICS] Processing', reservations.length, 'reservations');
      setAllReservations(reservations);

      const uniqueAmenities = Array.from(
        new Set(reservations.map(r => r.amenity?.id).filter(Boolean))
      ).map(id => {
        const reservation = reservations.find(r => r.amenity?.id === id);
        return {
          id: id!,
          name: reservation?.amenity?.name || 'Desconocido'
        };
      });
      setAvailableAmenities(uniqueAmenities);
      processAndSetData(reservations);
    } catch (error) {
      console.error('[ANALYTICS] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, processAndSetData]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  useEffect(() => {
    if (allReservations.length > 0) {
      processAndSetData(allReservations);
    }
  }, [selectedAmenity, dateFilterOption, allReservations, processAndSetData]);

  const processHourlyData = (reservations: any[]): HourlyData[] => {
    const hourlyMap = new Map<number, any>();

    for (let hour = 0; hour < 24; hour++) {
      hourlyMap.set(hour, {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: 0,
        amenities: {}
      });
    }

    reservations.forEach(reservation => {
      const hour = new Date(reservation.startTime).getHours();
      const amenityName = reservation.amenity?.name || 'Desconocido';
      const data = hourlyMap.get(hour);
      if (data) {
        data.count++;
        data.amenities[amenityName] = (data.amenities[amenityName] || 0) + 1;
      }
    });

    return Array.from(hourlyMap.values());
  };

  const processTimelineSegments = (reservations: any[]) => {
    
    const groupedMap = new Map<string, {
      startMinutes: number;
      endMinutes: number;
      amenityName: string;
      count: number;
    }>();

    reservations.forEach(res => {
      const startDate = new Date(res.startTime);
      const endDate = new Date(res.endTime);
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      const amenityName = res.amenity?.name || 'Desconocido';
      const key = `${startMinutes}-${endMinutes}-${amenityName}`;
      
      if (groupedMap.has(key)) {
        groupedMap.get(key)!.count++;
      } else {
        groupedMap.set(key, {
          startMinutes,
          endMinutes,
          amenityName,
          count: 1
        });
      }
    });

    const segments = Array.from(groupedMap.values()).map(group => ({
      ...group,
      layer: 0
    }));

    segments.sort((a, b) => a.startMinutes - b.startMinutes);

    for (let i = 0; i < segments.length; i++) {
      const currentSegment = segments[i];
      let layer = 0;
      let overlaps = true;

      while (overlaps) {
        overlaps = false;
        
        for (let j = 0; j < i; j++) {
          const prevSegment = segments[j];
          if (prevSegment.layer === layer) {
            
            if (currentSegment.startMinutes < prevSegment.endMinutes &&
                currentSegment.endMinutes > prevSegment.startMinutes) {
              overlaps = true;
              break;
            }
          }
        }
        if (overlaps) {
          layer++;
        }
      }
      currentSegment.layer = layer;
    }

    return segments;
  };

  const getPeakHour = (): string => {
    if (hourlyData.length === 0) return '--:--';
    
    const maxCount = Math.max(...hourlyData.map(h => h.count));

    if (maxCount === 0) return '--:--';
    const peakHours = hourlyData.filter(h => h.count === maxCount);

    if (peakHours.length === 1) return peakHours[0].hour;
  
    return peakHours.map(h => h.hour).join(', ');
  };

  const getCurrentDateLabel = (): string => {
    if (!dateFilterOption || dateFilterOption.value === 'all') return 'Todas las fechas';
    if (dateFilterOption.value === 'custom' && dateFilterOption.startDate && dateFilterOption.endDate) {
      const start = new Date(dateFilterOption.startDate).toLocaleDateString('es-ES');
      const end = new Date(dateFilterOption.endDate).toLocaleDateString('es-ES');
      return `${start} - ${end}`;
    }
    return dateFilterOption.label;
  };

  const getCurrentAmenityLabel = (): string => {
    return selectedAmenity === 'all' ? 'Todos los amenities' : selectedAmenity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>

          <div className="flex gap-2 ml-auto">
            {/* Amenity Filter Button */}
            <button
              onClick={() => setShowAmenityFilterModal(true)}
              className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className={selectedAmenity === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                  {getCurrentAmenityLabel()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Date Filter Button */}
            <button
              onClick={() => setShowDateFilterModal(true)}
              className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className={!dateFilterOption || dateFilterOption.value === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                  {getCurrentDateLabel()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Current View Indicator */}
        {(selectedAmenity !== 'all' || (dateFilterOption && dateFilterOption.value !== 'all')) && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-blue-900">Viendo:</span>
              <div className="flex items-center gap-4">
                {selectedAmenity !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                    {selectedAmenity}
                  </span>
                )}
                {dateFilterOption && dateFilterOption.value !== 'all' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg font-medium">
                    {getCurrentDateLabel()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">
                  {selectedAmenity === 'all' ? 'Total Reservas' : `Reservas - ${selectedAmenity}`}
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {amenityStats.reduce((sum, a) => sum + a.totalReservations, 0)}
                </p>
                {selectedAmenity !== 'all' && (
                  <p className="text-sm text-blue-600 mt-1">
                    {(() => {
                      const totalNonCancelled = allReservations.filter(r => r.status?.name !== 'cancelada').length;
                      const amenityTotal = amenityStats.reduce((sum, a) => sum + a.totalReservations, 0);
                      return ((amenityTotal / Math.max(totalNonCancelled, 1)) * 100).toFixed(1);
                    })()}% del total
                  </p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Amenities Activos</p>
                <p className="text-3xl font-bold text-green-900">{amenityStats.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Utilización Promedio</p>
                <p className="text-3xl font-bold text-purple-900">
                  {(() => {
                    if (selectedAmenity === 'all') {
                      // Calculo el promedio entre todas las amenities
                      const totalUtilization = amenityStats.reduce((sum, a) => sum + a.utilizationRate, 0);
                      const totalAmenities = availableAmenities.length > 0 ? availableAmenities.length : 1;
                      return (Math.round((totalUtilization / totalAmenities) * 10) / 10);
                    } else {
                      // Solo la amenity filtrada
                      return amenityStats.length > 0
                        ? (Math.round((amenityStats.reduce((sum, a) => sum + a.utilizationRate, 0) / amenityStats.length) * 10) / 10)
                        : 0;
                    }
                  })()}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">Hora Pico</p>
                <p className="text-3xl font-bold text-orange-900">{getPeakHour()}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Timeline Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Distribución Temporal de Reservas
          </h3>

          {/* Color Legend */}
          {timelineSegments.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs font-semibold text-gray-700">Referencia de colores de Amenities:</div>
              </div>
              <div className="flex flex-wrap gap-4">
                {getAmenityLegend().map(([amenityName, colorInfo]) => (
                  <div key={amenityName} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${colorInfo.solid}`}></div>
                    <span className="text-xs text-gray-700 font-medium">{amenityName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto overflow-y-hidden pb-4">
            <div className="relative" style={{ minWidth: '2400px', height: '360px' }}>
              {/* Hour markers at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex border-t border-gray-300 pt-2">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="flex-1 text-center text-xs text-gray-600 font-medium relative"
                    style={{ minWidth: '100px' }}
                  >
                    <span>{hour.toString().padStart(2, '0')}:00</span>
                    {hour < 23 && (
                      <div className="absolute left-1/2 top-0 w-px h-2 bg-gray-300 -translate-x-1/2" />
                    )}
                  </div>
                ))}
              </div>

              {/* Timeline segments */}
              <div className="absolute top-0 left-0 right-0" style={{ height: '320px' }}>
                {timelineSegments.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay reservas en el período seleccionado</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Background grid for half-hour marks */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: 48 }, (_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r border-gray-100"
                          style={{ minWidth: '50px' }}
                        />
                      ))}
                    </div>

                    {/* Reservation bars */}
                    {timelineSegments.map((segment, index) => {
                      const totalMinutes = 24 * 60;
                      const leftPercent = (segment.startMinutes / totalMinutes) * 100;
                      const widthPercent = ((segment.endMinutes - segment.startMinutes) / totalMinutes) * 100;

                      const maxLayers = Math.max(...timelineSegments.map(s => s.layer), 0) + 1;
                      const barHeight = Math.min(40, 280 / maxLayers); 
                      const bottomPosition = segment.layer * barHeight;
                      
                      const startHour = Math.floor(segment.startMinutes / 60);
                      const startMin = segment.startMinutes % 60;
                      const endHour = Math.floor(segment.endMinutes / 60);
                      const endMin = segment.endMinutes % 60;
                      
                      const timeLabel = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
                      const colorConfig = getAmenityColor(segment.amenityName);
                      
                      return (
                        <motion.div
                          key={`segment-${index}`}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: `${widthPercent}%`, opacity: 1 }}
                          transition={{ delay: index * 0.01, duration: 0.3 }}
                          className={`absolute bg-gradient-to-r ${colorConfig.gradient} rounded-lg hover:shadow-md transition-all cursor-pointer group`}
                          style={{
                            left: `${leftPercent}%`,
                            bottom: `${bottomPosition}px`,
                            height: `${barHeight - 4}px`,
                            minWidth: '4px'
                          }}
                          title={`${segment.amenityName}\n${timeLabel}${segment.count > 1 ? `\n${segment.count} reservas` : ''}`}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                              <div className="font-semibold">{segment.amenityName}</div>
                              <div className="text-gray-300">{timeLabel}</div>
                              {segment.count > 1 && (
                                <div className="text-blue-300 mt-1 font-semibold">
                                  {segment.count} reservas en este horario
                                </div>
                              )}
                            </div>
                            <div className="w-2 h-2 bg-gray-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Amenity Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-900">Estadísticas por Amenity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenityStats.map((amenity, index) => (
              <motion.div
                key={amenity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{amenity.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {amenity.totalReservations} reserva{amenity.totalReservations !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {amenity.utilizationRate}%
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Horarios Pico:</p>
                    <div className="flex gap-2 flex-wrap">
                      {amenity.peakHours.slice(0, 3).map((peak, idx) => (
                        <span
                          key={peak.hour}
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${idx === 0 ? 'bg-red-100 text-red-700' :
                            idx === 1 ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          {peak.label} ({peak.count})
                        </span>
                      ))}
                      {amenity.peakHours.length === 0 && (
                        <span className="text-gray-500 text-xs">Sin datos suficientes</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Duración promedio:</span>
                    <span className="font-medium text-gray-900">{amenity.averageDuration}h</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {amenityStats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos suficientes para mostrar estadísticas</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Filter Modals */}
      <AmenityFilterModal
        isVisible={showAmenityFilterModal}
        onClose={() => setShowAmenityFilterModal(false)}
        selectedAmenity={selectedAmenity}
        onAmenitySelect={setSelectedAmenity}
        availableAmenities={availableAmenities}
      />

      <DateFilterModal
        isVisible={showDateFilterModal}
        onClose={() => setShowDateFilterModal(false)}
        onDateFilterSelect={setDateFilterOption}
        selectedValue={dateFilterOption?.value || 'all'}
        title="Filtrar por Fecha"
        subtitle="Selecciona el rango de fechas para filtrar los análisis"
      />
    </>
  );
};

export default ReservationsAnalytics;
