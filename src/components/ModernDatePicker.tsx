import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface ModernDatePickerProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    label?: string;
    minDate?: string;
    maxDate?: string;
    className?: string;
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function ModernDatePicker({
    selectedDate,
    onDateChange,
    label = "Seleccionar Fecha",
    minDate,
    maxDate,
    className = ""
}: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [hasInitialized, setHasInitialized] = useState(false);

    const selected = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

    useEffect(() => {
        if (!isOpen) {
            const now = new Date();
            setCurrentMonth(now.getMonth());
            setCurrentYear(now.getFullYear());
            setHasInitialized(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (selected && !hasInitialized && isOpen) {
            setCurrentMonth(selected.getMonth());
            setCurrentYear(selected.getFullYear());
            setHasInitialized(true);
        } else if (!selected && hasInitialized) {
            setHasInitialized(false);
        }
    }, [selected, hasInitialized, isOpen]);

    const getDisplayDate = () => {
        if (!selectedDate) return "Seleccionar fecha";
        
        const date = new Date(selectedDate + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const getDaysInMonth = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDay = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1);
            days.push({
                date: prevMonthDay,
                isCurrentMonth: false,
                isDisabled: true
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            
            let isDisabled = false;
            if (minDate && dateString < minDate) isDisabled = true;
            if (maxDate && dateString > maxDate) isDisabled = true;

            days.push({
                date,
                isCurrentMonth: true,
                isDisabled,
                isSelected: dateString === selectedDate,
                isToday: dateString === new Date().toISOString().split('T')[0]
            });
        }

        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDay = new Date(currentYear, currentMonth + 1, i);
            days.push({
                date: nextMonthDay,
                isCurrentMonth: false,
                isDisabled: true
            });
        }

        return days;
    }, [currentYear, currentMonth, selectedDate, minDate, maxDate]);

    const handleDateSelect = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        onDateChange(dateString);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleYearChange = (increment: number) => {
        setCurrentYear(currentYear + increment);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Date Input Display */}
            <div className="group">
                {label && (
                    <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {label}
                    </label>
                )}
                
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-left text-gray-700 font-medium shadow-sm hover:shadow-md bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                    <span className={selectedDate ? "text-gray-800" : "text-gray-400"}>
                        {getDisplayDate()}
                    </span>
                    <Calendar className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Calendar Panel */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-6 min-w-[320px]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleYearChange(-1)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Año anterior"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Mes anterior"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {MONTHS[currentMonth]} {currentYear}
                                </h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Mes siguiente"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleYearChange(1)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Año siguiente"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {WEEKDAYS.map(day => (
                                <div
                                    key={day}
                                    className="text-center text-sm font-semibold text-gray-600 py-2"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth.map((dayObj, index) => {
                                const isSelected = dayObj.isSelected;
                                const isToday = dayObj.isToday;
                                const isDisabled = dayObj.isDisabled;
                                const isCurrentMonth = dayObj.isCurrentMonth;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => !isDisabled && handleDateSelect(dayObj.date)}
                                        disabled={isDisabled}
                                        className={`
                                            w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 relative cursor-pointer
                                            ${isSelected 
                                                ? "bg-gray-800 text-white shadow-lg scale-105" 
                                                : isToday
                                                    ? "bg-gray-100 text-gray-800 border-2 border-gray-400"
                                                    : isCurrentMonth && !isDisabled
                                                        ? "text-gray-700 hover:bg-gray-100 hover:scale-105"
                                                        : "text-gray-300 cursor-not-allowed"
                                            }
                                            ${!isDisabled && !isSelected ? "hover:shadow-md" : ""}
                                        `}
                                    >
                                        {dayObj.date.getDate()}
                                        {isToday && !isSelected && (
                                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    onDateChange(today);
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Hoy
                            </button>
                            <button
                                onClick={() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    const tomorrowString = tomorrow.toISOString().split('T')[0];
                                    onDateChange(tomorrowString);
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Mañana
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ModernDatePicker;