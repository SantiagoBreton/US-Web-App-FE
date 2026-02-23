import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react';

export interface DateFilterOption {
  value: string;
  label: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface DateFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateFilterSelect: (option: DateFilterOption) => void;
  selectedValue: string;
  title?: string;
  subtitle?: string;
}

const getDateFilterOptions = (): DateFilterOption[] => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
  
  const startOfLast7Days = new Date(today);
  startOfLast7Days.setDate(today.getDate() - 6);
  startOfLast7Days.setHours(0, 0, 0, 0);
  
  const startOfLast30Days = new Date(today);
  startOfLast30Days.setDate(today.getDate() - 29);
  startOfLast30Days.setHours(0, 0, 0, 0);

  return [
    {
      value: 'all',
      label: 'Todas las fechas',
      description: 'Ver todos los registros sin filtro de fecha',
      startDate: null,
      endDate: null
    },
    {
      value: 'today',
      label: 'Hoy',
      description: 'Registros de hoy solamente',
      startDate: startOfToday,
      endDate: endOfToday
    },
    {
      value: 'this_week',
      label: 'Esta semana',
      description: 'Registros de esta semana (Dom - Sáb)',
      startDate: startOfWeek,
      endDate: endOfWeek
    },
    {
      value: 'this_month',
      label: 'Este mes',
      description: 'Registros del mes actual',
      startDate: startOfMonth,
      endDate: endOfMonth
    },
    {
      value: 'last_7_days',
      label: 'Últimos 7 días',
      description: 'Registros de los últimos 7 días',
      startDate: startOfLast7Days,
      endDate: endOfToday
    },
    {
      value: 'last_30_days',
      label: 'Últimos 30 días',
      description: 'Registros de los últimos 30 días',
      startDate: startOfLast30Days,
      endDate: endOfToday
    },
    {
      value: 'last_month',
      label: 'Mes pasado',
      description: 'Registros del mes anterior',
      startDate: startOfLastMonth,
      endDate: endOfLastMonth
    },
    {
      value: 'custom',
      label: 'Rango personalizado',
      description: 'Seleccionar fechas específicas',
      startDate: null,
      endDate: null
    }
  ];
};

const DateFilterModal = ({
  isVisible,
  onClose,
  onDateFilterSelect,
  selectedValue,
  title = "Filtrar por Fecha",
  subtitle = "Selecciona un período de tiempo"
}: DateFilterModalProps) => {
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  const dateOptions = getDateFilterOptions();

  const handleOptionSelect = (option: DateFilterOption) => {
    if (option.value === 'custom') {
      setShowCustomDateInputs(true);
      return;
    }
    
    setShowCustomDateInputs(false);
    onDateFilterSelect(option);
    onClose();
  };

  const handleCustomDateSubmit = () => {
    if (!customStartDate) return;
    
    const startDate = new Date(customStartDate + 'T00:00:00');
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = customEndDate ? 
      new Date(customEndDate + 'T23:59:59') : 
      new Date(customStartDate + 'T23:59:59');
    endDate.setHours(23, 59, 59, 999);
    
    const customOption: DateFilterOption = {
      value: 'custom',
      label: customEndDate ? 
        `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}` : 
        startDate.toLocaleDateString('es-ES'),
      description: 'Rango de fechas personalizado',
      startDate: startDate,
      endDate: endDate
    };
    
    console.log('🔍 [DATE MODAL DEBUG] Custom date option created:', {
      customStartDate,
      customEndDate,
      startDate,
      endDate,
      option: customOption
    });
    
    onDateFilterSelect(customOption);
    onClose();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getIcon = (value: string) => {
    switch (value) {
      case 'today': return Clock;
      case 'this_week':
      case 'last_7_days': return CalendarDays;
      case 'this_month':
      case 'last_30_days':
      case 'last_month': return Calendar;
      case 'custom': return CalendarRange;
      default: return Calendar;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Custom Date Inputs */}
          {showCustomDateInputs ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {customStartDate && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    ✓ {new Date(customStartDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin (opcional)
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {customEndDate && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    ✓ {new Date(customEndDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Si no seleccionas fecha de fin, se filtrará solo el día de inicio
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCustomDateSubmit}
                  disabled={!customStartDate}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Aplicar Filtro
                </button>
                <button
                  onClick={() => {
                    setShowCustomDateInputs(false);
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Date Options List */
            <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {dateOptions.map((option) => {
                const IconComponent = getIcon(option.value);
                const isSelected = selectedValue === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100' : 'bg-white'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {option.label}
                          </h4>
                          {option.startDate && option.endDate && option.value !== 'all' && (
                            <span className="text-xs text-gray-500">
                              {option.startDate.toDateString() === option.endDate.toDateString() ?
                                formatDate(option.startDate) :
                                `${formatDate(option.startDate)} - ${formatDate(option.endDate)}`
                              }
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className={`text-sm mt-1 ${
                            isSelected ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DateFilterModal;