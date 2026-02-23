import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Activity,
  PieChart,
  CalendarDays,
  ChevronDown,
  Filter
} from 'lucide-react';
import DateFilterModal, { type DateFilterOption } from './DateFilterModal';

interface MonthlyClaimData {
  month?: string;
  monthLabel?: string;
  label?: string;
  weekStart?: string;
  weekEnd?: string;
  nuevo: number;
  en_progreso: number;
  resuelto: number;
  cerrado: number;
  total: number;
}

interface ClaimsAnalyticsProps {
  token: string;
}

const ClaimsAnalytics: React.FC<ClaimsAnalyticsProps> = ({ token }) => {
  const [claimsSubTab, setClaimsSubTab] = useState<'evolution' | 'metrics'>('evolution');
  const [claimsPeriod, setClaimsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dayOffset, setDayOffset] = useState(0);
  const [monthlyClaimsData, setMonthlyClaimsData] = useState<MonthlyClaimData[]>([]);
  const [claimsMetrics, setClaimsMetrics] = useState<any>(null);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  
  const [metricsDateFilter, setMetricsDateFilter] = useState<DateFilterOption | null>(null);
  const [showMetricsDateFilterModal, setShowMetricsDateFilterModal] = useState(false);

  const getCurrentMetricsDateLabel = () => {
    if (!metricsDateFilter || metricsDateFilter.value === 'all') {
      return 'Todas las fechas';
    }
    return metricsDateFilter.label;
  };

  const loadClaimsData = React.useCallback(async () => {
    setIsLoadingClaims(true);
    
    try {
      if (claimsSubTab === 'evolution') {
        console.log('[CLAIMS] Fetching stats - Period:', claimsPeriod, 'Offset:', dayOffset);
        const claimsStats = await fetch(`${import.meta.env.VITE_API_URL}/admin/claims/stats?period=${claimsPeriod}&offset=${dayOffset}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(res => res.json()).catch((err) => {
          console.error('[CLAIMS] Fetch error:', err);
          return { data: [] };
        });

        console.log('[CLAIMS STATS] Response:', {
          period: claimsStats.period,
          offset: claimsStats.offset,
          totalClaims: claimsStats.totalClaims,
          dataLength: claimsStats.data?.length || 0,
        });

        if (claimsStats && Array.isArray(claimsStats.data)) {
          setMonthlyClaimsData(claimsStats.data);
        } else {
          console.warn('[CLAIMS] Invalid response format or empty data');
          setMonthlyClaimsData([]);
        }
      } else {
        console.log('[CLAIMS METRICS] Fetching metrics data');
        
        let metricsUrl = `${import.meta.env.VITE_API_URL}/admin/claims/metrics`;
        const params = new URLSearchParams();
        
        if (metricsDateFilter && metricsDateFilter.value !== 'all') {
          const now = new Date();
          let startDate: Date | null = null;
          let endDate: Date | null = null;

          switch (metricsDateFilter.value) {
            case 'today': {
              startDate = new Date(now);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(now);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'yesterday': {
              startDate = new Date(now);
              startDate.setDate(startDate.getDate() - 1);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(startDate);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'last7days': {
              startDate = new Date(now);
              startDate.setDate(startDate.getDate() - 7);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(now);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'last30days': {
              startDate = new Date(now);
              startDate.setDate(startDate.getDate() - 30);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(now);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'thisMonth': {
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              endDate = new Date(now);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'lastMonth': {
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              endDate = new Date(now.getFullYear(), now.getMonth(), 0);
              endDate.setHours(23, 59, 59, 999);
              break;
            }
            case 'custom':
              if (metricsDateFilter.startDate) {
                startDate = metricsDateFilter.startDate;
              }
              if (metricsDateFilter.endDate) {
                endDate = metricsDateFilter.endDate;
              }
              break;
          }

          if (startDate) {
            params.append('startDate', startDate.toISOString());
          }
          if (endDate) {
            params.append('endDate', endDate.toISOString());
          }
        }

        const queryString = params.toString();
        if (queryString) {
          metricsUrl += `?${queryString}`;
        }

        const metricsData = await fetch(metricsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(res => res.json()).catch((err) => {
          console.error('[CLAIMS METRICS] Fetch error:', err);
          return null;
        });

        if (metricsData) {
          setClaimsMetrics(metricsData);
        }
      }
    } catch (error) {
      console.error('[CLAIMS] Error loading data:', error);
    } finally {
      setIsLoadingClaims(false);
    }
  }, [token, claimsSubTab, claimsPeriod, dayOffset, metricsDateFilter]);

  useEffect(() => {
    loadClaimsData();
  }, [loadClaimsData]);

  useEffect(() => {
    setDayOffset(0);
  }, [claimsPeriod]);

  return (
    <>
      {/* Sub-tabs for Claims */}
      <div className="flex gap-2 mb-6">
        <motion.button
          onClick={() => setClaimsSubTab('evolution')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            claimsSubTab === 'evolution'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200'
              : 'bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          Evolución de Reclamos
        </motion.button>
        <motion.button
          onClick={() => setClaimsSubTab('metrics')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            claimsSubTab === 'metrics'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200'
              : 'bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          Métricas
        </motion.button>
      </div>

      {/* Period selector - only for evolution */}
      {claimsSubTab === 'evolution' && (
        <div className="flex gap-2 mb-6">
          <motion.button
            onClick={() => {
              setClaimsPeriod('daily');
              setDayOffset(0);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              claimsPeriod === 'daily'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            Diario
          </motion.button>
          <motion.button
            onClick={() => {
              setClaimsPeriod('weekly');
              setDayOffset(0);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              claimsPeriod === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            Semanal
          </motion.button>
          <motion.button
            onClick={() => {
              setClaimsPeriod('monthly');
              setDayOffset(0);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              claimsPeriod === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            Mensual
          </motion.button>
        </div>
      )}

      {claimsSubTab === 'evolution' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Evolución de Reclamos
              {dayOffset > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {claimsPeriod === 'weekly' ? `${dayOffset} semanas atrás` : 
                   claimsPeriod === 'monthly' ? `${dayOffset} meses atrás` : 
                   `${dayOffset} días atrás`}
                </span>
              )}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setDayOffset(prev => prev + (claimsPeriod === 'daily' ? 1 : claimsPeriod === 'weekly' ? 7 : 30))}
                disabled={isLoadingClaims}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>←</span>
                <span>Anterior</span>
              </button>
              <button
                onClick={() => setDayOffset(prev => Math.max(0, prev - (claimsPeriod === 'daily' ? 1 : claimsPeriod === 'weekly' ? 7 : 30)))}
                disabled={dayOffset === 0 || isLoadingClaims}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Siguiente</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {monthlyClaimsData.length > 0 ? (
            <div className="space-y-6">
              {isLoadingClaims && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="text-sm text-gray-600">Cargando datos...</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Nuevo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">En Progreso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Resuelto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-700">Cerrado</span>
                </div>
              </div>

              <div className="relative h-96 mt-6">
                {(() => {
                  const maxValue = Math.max(...monthlyClaimsData.map(d => d.total), 1);
                  const step = maxValue <= 4 ? 1 : Math.ceil(maxValue / 4);
                  const maxYValue = Math.max(Math.ceil(maxValue / step) * step, 1);
                  const numTicks = Math.ceil(maxYValue / step) + 1;

                  return (
                    <div className="relative h-full">
                      {/* Eje Y */}
                      <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
                        {Array.from({ length: numTicks }, (_, i) => {
                          const value = (numTicks - 1 - i) * step;
                          return (
                            <div key={i} className="flex items-center justify-end">
                              <span>{value}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Área de barras */}
                      <div className="absolute left-12 top-0 right-0 bottom-20 flex items-end justify-around border-l border-b border-gray-200 px-6 pb-2">
                        {monthlyClaimsData.map((data, index) => {
                          const barHeightPercent = (data.total / maxYValue) * 100;

                          return (
                            <div
                              key={`${data.month}-${index}`}
                              className="flex flex-col items-center justify-end w-16"
                              style={{ height: '100%' }}
                            >
                              {/* Total arriba */}
                              {data.total > 0 && (
                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                  {data.total}
                                </div>
                              )}

                              {/* Barra apilada */}
                              {data.total > 0 ? (
                                <div
                                  className="w-full flex flex-col-reverse rounded-md overflow-hidden shadow-sm"
                                  style={{
                                    height: `${barHeightPercent}%`,
                                    backgroundColor: '#f3f4f6',
                                  }}
                                >
                                  {data.nuevo > 0 && (
                                    <div
                                      className="bg-blue-500 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ flex: data.nuevo }}
                                    >
                                      {data.nuevo}
                                    </div>
                                  )}
                                  {data.en_progreso > 0 && (
                                    <div
                                      className="bg-yellow-500 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ flex: data.en_progreso }}
                                    >
                                      {data.en_progreso}
                                    </div>
                                  )}
                                  {data.resuelto > 0 && (
                                    <div
                                      className="bg-green-500 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ flex: data.resuelto }}
                                    >
                                      {data.resuelto}
                                    </div>
                                  )}
                                  {data.cerrado > 0 && (
                                    <div
                                      className="bg-gray-500 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ flex: data.cerrado }}
                                    >
                                      {data.cerrado}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex items-end justify-center text-gray-400 text-sm">
                                  —
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Etiquetas del eje X debajo del gráfico */}
                      <div className="absolute left-12 right-0 bottom-4 flex justify-around text-xs text-gray-700">
                        {monthlyClaimsData.map((data, index) => {
                          let labelText = '';
                          
                          if (claimsPeriod === 'weekly') {
                            if (data.weekStart && data.weekEnd) {
                              const start = new Date(data.weekStart);
                              const end = new Date(data.weekEnd);
                              const startDay = start.getDate();
                              const endDay = end.getDate();
                              const startMonth = start.toLocaleDateString('es-ES', { month: 'short' });
                              const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });
                              
                              if (startMonth === endMonth) {
                                labelText = `${startDay}-${endDay}\n${startMonth}`;
                              } else {
                                labelText = `${startDay} ${startMonth}\n${endDay} ${endMonth}`;
                              }
                            } else {
                              labelText = data.label || `Semana ${index + 1}`;
                            }
                          } else if (claimsPeriod === 'monthly') {
                            labelText = data.monthLabel || data.label || data.month || `Mes ${index + 1}`;
                          } else {
                            labelText = data.label || `Día ${index + 1}`;
                          }
                          
                          return (
                            <div key={`${data.monthLabel || data.label || index}`} className="w-16 text-center whitespace-pre-line leading-tight">
                              {labelText}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {monthlyClaimsData.reduce((sum, d) => sum + d.nuevo, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Nuevos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {monthlyClaimsData.reduce((sum, d) => sum + d.en_progreso, 0)}
                  </div>
                  <div className="text-sm text-gray-600">En Progreso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {monthlyClaimsData.reduce((sum, d) => sum + d.resuelto, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Resueltos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {monthlyClaimsData.reduce((sum, d) => sum + d.cerrado, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Cerrados</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de reclamos para mostrar</p>
            </div>
          )}
        </motion.div>
      ) : (
        /* Metrics Tab */
        <div className="space-y-6">
          {/* Date Filter for Metrics */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Métricas de Reclamos</h3>
            <button
              onClick={() => setShowMetricsDateFilterModal(true)}
              className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className={!metricsDateFilter || metricsDateFilter.value === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                  {getCurrentMetricsDateLabel()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Active Filter Indicator */}
          {metricsDateFilter && metricsDateFilter.value !== 'all' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Filter className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">
                      Filtro activo: {metricsDateFilter.label}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 ml-6">
                    Mostrando solo reclamos resueltos en este período
                  </p>
                </div>
                <button
                  onClick={() => setMetricsDateFilter(null)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap px-3 py-1 rounded-md hover:bg-purple-100 transition-colors"
                >
                  Limpiar filtro
                </button>
              </div>
            </div>
          )}

          {isLoadingClaims ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando métricas...</p>
              </div>
            </div>
          ) : claimsMetrics ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium">Tiempo Promedio de Resolución</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {claimsMetrics.averageResolutionTime ? 
                          `${Math.round(claimsMetrics.averageResolutionTime)} días` : 
                          'N/A'}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Desde creación hasta finalización
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
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
                      <p className="text-green-600 font-medium">Tasa de Resolución</p>
                      <p className="text-3xl font-bold text-green-900">
                        {claimsMetrics.resolutionRate ? 
                          `${Math.round(claimsMetrics.resolutionRate)}%` : 
                          'N/A'}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Reclamos resueltos/cerrados
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
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
                      <p className="text-purple-600 font-medium">Total de Reclamos</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {claimsMetrics.totalClaims || 0}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        Histórico completo
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </motion.div>
              </div>

              {/* Claims by Category */}
              {claimsMetrics.byCategory && claimsMetrics.byCategory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Reclamos por Categoría
                  </h3>
                  <div className="space-y-4">
                    {claimsMetrics.byCategory.map((category: any, idx: number) => {
                      const percentage = claimsMetrics.totalClaims > 0 
                        ? (category.count / claimsMetrics.totalClaims) * 100 
                        : 0;
                      const colors = [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-yellow-500',
                        'bg-red-500',
                        'bg-purple-500',
                        'bg-pink-500',
                        'bg-indigo-500',
                        'bg-orange-500'
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={category.category || idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {category.category || 'Sin categoría'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{category.count}</span>
                              <span className="text-xs text-gray-500">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Claims by Status */}
              {claimsMetrics.byStatus && claimsMetrics.byStatus.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Distribución por Estado
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {claimsMetrics.byStatus.map((status: any) => (
                      <div
                        key={status.status}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {status.count}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {status.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay métricas disponibles</p>
            </div>
          )}
        </div>
      )}

      {/* Date Filter Modal for Metrics */}
      <DateFilterModal
        isVisible={showMetricsDateFilterModal}
        onClose={() => setShowMetricsDateFilterModal(false)}
        onDateFilterSelect={setMetricsDateFilter}
        selectedValue={metricsDateFilter?.value || 'all'}
        title="Filtrar Métricas por Fecha"
        subtitle="Selecciona un rango de fechas para calcular las métricas"
      />
    </>
  );
};

export default ClaimsAnalytics;
