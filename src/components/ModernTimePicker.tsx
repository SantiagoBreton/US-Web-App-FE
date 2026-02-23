import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

function formatOperatingHours(openTime?: string, closeTime?: string): string {
    if (!openTime || !closeTime) return "";
    
    const normalizeTime = (time: string) => {
        const [hour, minute] = time.split(':');
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    };
    
    return `${normalizeTime(openTime)} - ${normalizeTime(closeTime)}`;
}

interface ModernTimePickerProps {
    selectedTime: string; // Format: "14:30 - 16:00"
    onTimeChange: (time: string) => void;
    maxDuration?: number; // in minutes
    label?: string;
    className?: string;
    selectedDate?: string; // To check if it's today and filter past times
    openTime?: string; // Format: "HH:mm" - amenity opening time
    closeTime?: string; // Format: "HH:mm" - amenity closing time
}

// Generate time slots in 30-minute intervals based on operating hours
function generateTimeSlots(openTime?: string, closeTime?: string, includeUnavailable: boolean = false) {
    const slots = [];
    
    // Parse operating hours or use defaults, handling both "8:00" and "08:00" formats
    const parseTimeString = (timeStr: string) => {
        const [hourStr, minuteStr] = timeStr.split(':');
        return {
            hour: parseInt(hourStr),
            minute: parseInt(minuteStr || '0')
        };
    };
    
    const startTime = openTime ? parseTimeString(openTime) : { hour: 6, minute: 0 };
    const endTime = closeTime ? parseTimeString(closeTime) : { hour: 22, minute: 30 };
    
    // Debug for Gimnasio case
    if (closeTime === "22:00") {
        console.log("🏋️ [SLOTS DEBUG] Gimnasio time parsing:");
        console.log("   - openTime:", openTime, "→ parsed:", startTime);
        console.log("   - closeTime:", closeTime, "→ parsed:", endTime);
    }
    
    // Convert to minutes for easier calculation
    const operatingStartTime = startTime.hour * 60 + startTime.minute;
    const operatingEndTime = endTime.hour * 60 + endTime.minute;
    
    // Generate all possible slots from 6:00 to 23:00
    const dayStart = 6 * 60; // 6:00 AM
    const dayEnd = 23 * 60; // 11:00 PM
    
    for (let time = dayStart; time <= dayEnd; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Don't go beyond 23:00
        if (hour >= 23 && minute > 0) break;
        
        const isWithinOperatingHours = time >= operatingStartTime && time <= operatingEndTime;
        
        if (isWithinOperatingHours || includeUnavailable) {
            slots.push({
                time: timeString,
                available: isWithinOperatingHours,
                withinOperatingHours: isWithinOperatingHours
            });
        }
    }
    
    // Debug for Gimnasio case
    if (closeTime === "22:00") {
        console.log("🏋️ [SLOTS DEBUG] Generated slots count:", slots.length);
        console.log("🏋️ [SLOTS DEBUG] Available slots:", slots.filter(s => s.available).map(s => s.time));
        console.log("🏋️ [SLOTS DEBUG] Last few slots:", slots.slice(-5));
    }
    
    return slots;
}

// Convert time string to minutes since midnight
function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes since midnight to time string
function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function ModernTimePicker({
    selectedTime,
    onTimeChange,
    maxDuration = 120,
    label = "Seleccionar Horario",
    className = "",
    selectedDate,
    openTime,
    closeTime
}: ModernTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'visual' | 'manual'>('visual');
    const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Check dropdown position when opening
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const dropdownHeight = 400; // Estimated dropdown height
            
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setDropdownPosition('up');
            } else {
                setDropdownPosition('down');
            }
        }
    }, [isOpen]);
    
    // Check if selected date is today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // Parse current selected time
    const [currentStart, currentEnd] = selectedTime.split(" - ");
    const currentDuration = currentStart && currentEnd 
        ? timeToMinutes(currentEnd) - timeToMinutes(currentStart)
        : 60; // default 1 hour

    const timeSlots = generateTimeSlots(openTime, closeTime, true); // Include unavailable for UI

    // Filter out past times if the selected date is today
    const availableTimeSlots = isToday 
        ? timeSlots.filter(slot => {
            const slotMinutes = timeToMinutes(slot.time);
            // Add 5 minutes buffer to current time
            return slotMinutes > (currentTotalMinutes + 5) && slot.available;
          })
        : timeSlots.filter(slot => slot.available);

    // Calculate available end times for current start time
    const getAvailableEndTimes = (startTime: string) => {
        if (!startTime) return [];
        
        const startMinutes = timeToMinutes(startTime);
        const maxEndTime = Math.min(
            startMinutes + maxDuration,
            22 * 60 + 30 // 22:30
        );
        
        const endTimes = [];
        for (let duration = 30; duration <= maxDuration; duration += 30) {
            const endMinutes = startMinutes + duration;
            if (endMinutes <= maxEndTime) {
                endTimes.push({
                    time: minutesToTime(endMinutes),
                    duration: duration,
                    label: `${Math.floor(duration / 60)}h ${duration % 60 > 0 ? duration % 60 + 'm' : ''}`.replace('0h ', '')
                });
            }
        }
        return endTimes;
    };

    const handleStartTimeChange = (newStart: string) => {
        const availableEndTimes = getAvailableEndTimes(newStart);
        if (availableEndTimes.length > 0) {
            // Try to keep similar duration, or use the first available
            const targetDuration = Math.min(currentDuration, maxDuration);
            const bestEndTime = availableEndTimes.find(end => end.duration >= targetDuration) || availableEndTimes[0];
            onTimeChange(`${newStart} - ${bestEndTime.time}`);
        }
    };

    const handleEndTimeChange = (newEnd: string) => {
        if (currentStart) {
            onTimeChange(`${currentStart} - ${newEnd}`);
        }
    };

    const getDisplayTime = () => {
        if (!selectedTime || !selectedTime.includes(' - ')) {
            return "Seleccionar horario";
        }
        return selectedTime;
    };

    const availableEndTimes = currentStart ? getAvailableEndTimes(currentStart) : [];

    // Quick time presets
    const quickPresets = [
        { label: "30 min", duration: 30 },
        { label: "1 hora", duration: 60 },
        { label: "1.5 horas", duration: 90 },
        { label: "2 horas", duration: 120 },
        { label: "2.5 horas", duration: 150 },
        { label: "3 horas", duration: 180 },
        { label: "3.5 horas", duration: 210 },
        { label: "4 horas", duration: 240 },
    ].filter(preset => preset.duration <= maxDuration);

    const handleQuickPreset = (duration: number) => {
        if (currentStart) {
            const startMinutes = timeToMinutes(currentStart);
            const endMinutes = Math.min(startMinutes + duration, 22 * 60 + 30);
            const endTime = minutesToTime(endMinutes);
            onTimeChange(`${currentStart} - ${endTime}`);
        }
    };

    // Visual time picker with clock-like interface
    const VisualTimePicker = () => {
        // Generate hours based on operating hours - handle both "8:00" and "08:00" formats
        const parseHour = (timeStr?: string) => timeStr ? parseInt(timeStr.split(':')[0]) : null;
        
        const startHour = parseHour(openTime) ?? 6;
        const endHour = parseHour(closeTime) ?? 22;
        
        // Debug for Gimnasio case
        if (closeTime === "22:00") {
            console.log("🏋️ [VISUAL DEBUG] Gimnasio hours:");
            console.log("   - startHour:", startHour);
            console.log("   - endHour:", endHour);
            console.log("   - parseHour(closeTime):", parseHour(closeTime));
        }
        
        // Create hours array within operating hours
        const operatingHours = Array.from(
            { length: Math.max(0, endHour - startHour + 1) }, 
            (_, i) => startHour + i
        ).filter(hour => hour <= 23); // Don't exceed 23:00
        
        // All possible hours for reference (to show unavailable ones)
        const allHours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
        
        // Debug for Gimnasio case
        if (closeTime === "22:00") {
            console.log("🏋️ [VISUAL DEBUG] Generated arrays:");
            console.log("   - operatingHours:", operatingHours);
            console.log("   - allHours:", allHours);
        }
        
        return (
            <div className="space-y-6">
                {/* Operating Hours Visual Indicator */}
                {(openTime || closeTime) && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Horarios Disponibles</span>
                        </div>
                        
                        {/* Timeline Visual */}
                        <div className="mb-3">
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                {(() => {
                                    const startHour = openTime ? parseInt(openTime.split(':')[0]) : 6;
                                    const startMinute = openTime ? parseInt(openTime.split(':')[1]) : 0;
                                    const endHour = closeTime ? parseInt(closeTime.split(':')[0]) : 22;
                                    const endMinute = closeTime ? parseInt(closeTime.split(':')[1]) : 0;
                                    
                                    const dayStart = 6 * 60; // 6:00 AM in minutes
                                    const dayEnd = 23 * 60; // 11:00 PM in minutes
                                    const totalDayMinutes = dayEnd - dayStart;
                                    
                                    const operatingStart = startHour * 60 + startMinute;
                                    const operatingEnd = endHour * 60 + endMinute;
                                    
                                    const startPercentage = ((operatingStart - dayStart) / totalDayMinutes) * 100;
                                    const widthPercentage = ((operatingEnd - operatingStart) / totalDayMinutes) * 100;
                                    
                                    return (
                                        <div 
                                            className="absolute h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                                            style={{
                                                left: `${Math.max(0, startPercentage)}%`,
                                                width: `${Math.min(100, widthPercentage)}%`
                                            }}
                                        />
                                    );
                                })()}
                            </div>
                            
                            {/* Timeline labels */}
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>6:00</span>
                                <span className="font-medium text-blue-600">
                                    {formatOperatingHours(openTime, closeTime)}
                                </span>
                                <span>23:00</span>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <span className="text-lg font-bold text-blue-900">
                                {formatOperatingHours(openTime, closeTime)}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Hour Selection */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Hora de Inicio</h4>
                    <div className="grid grid-cols-6 gap-2">
                        {allHours.map(hour => {
                            const timeString = `${hour.toString().padStart(2, '0')}:00`;
                            const isSelected = currentStart?.startsWith(hour.toString().padStart(2, '0'));
                            const isAvailable = operatingHours.includes(hour);
                            const isPastTime = isToday && hour <= currentHour;
                            const isDisabled = !isAvailable || isPastTime;
                            
                            return (
                                <button
                                    key={hour}
                                    onClick={() => !isDisabled && handleStartTimeChange(timeString)}
                                    disabled={isDisabled}
                                    className={`
                                        p-3 rounded-lg text-sm font-medium transition-all duration-200 relative
                                        ${isSelected && isAvailable
                                            ? "bg-gray-800 text-white shadow-lg" 
                                            : isDisabled
                                            ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md cursor-pointer"
                                        }
                                    `}
                                    title={
                                        !isAvailable 
                                            ? "Fuera del horario de operación" 
                                            : isPastTime 
                                            ? "Hora ya pasada" 
                                            : `Seleccionar ${hour}:00`
                                    }
                                >
                                    {hour}:00
                                    {!isAvailable && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-px h-full bg-red-300 transform rotate-45"></div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-800 rounded"></div>
                            <span>Seleccionado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 rounded"></div>
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 opacity-50 rounded relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-px h-full bg-red-300 transform rotate-45"></div>
                                </div>
                            </div>
                            <span>No disponible</span>
                        </div>
                    </div>
                </div>

                {/* Minutes Selection for Start Time */}
                {currentStart && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Minutos</h4>
                        <div className="flex gap-2">
                            {['00', '30'].map(minute => {
                                const hour = currentStart.split(':')[0];
                                const timeString = `${hour}:${minute}`;
                                const isSelected = currentStart === timeString;
                                
                                return (
                                    <button
                                        key={minute}
                                        onClick={() => handleStartTimeChange(timeString)}
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                            ${isSelected 
                                                ? "bg-gray-800 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }
                                        `}
                                    >
                                        :{minute}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Duration Selection */}
                {currentStart && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Duración</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {quickPresets.map(preset => (
                                <button
                                    key={preset.duration}
                                    onClick={() => handleQuickPreset(preset.duration)}
                                    className={`
                                        p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${currentDuration === preset.duration
                                            ? "bg-gray-800 text-white shadow-lg" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }
                                    `}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Manual time picker with dropdowns
    const ManualTimePicker = () => (
        <div className="space-y-4">
            {/* Start Time Dropdown */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Hora de Inicio</h4>
                <div className="relative">
                    <select
                        value={currentStart || ""}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Selecciona hora de inicio</option>
                        {availableTimeSlots.map(slot => (
                            <option 
                                key={slot.time} 
                                value={slot.time}
                                disabled={!slot.available}
                                className={!slot.available ? 'text-gray-400' : ''}
                            >
                                {slot.time} {!slot.available ? '(No disponible)' : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* End Time Dropdown */}
            {currentStart && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Hora de Fin</h4>
                    <div className="relative">
                        <select
                            value={currentEnd || ""}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Selecciona hora de fin</option>
                            {availableEndTimes.map(option => (
                                <option key={option.time} value={option.time}>
                                    {option.time} ({option.label})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={`relative ${className}`}>
            {/* Time Input Display */}
            <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    {label}
                </label>
                
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-left text-gray-700 font-medium shadow-sm hover:shadow-md bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                    <span className={selectedTime && selectedTime !== " - " ? "text-gray-800" : "text-gray-400"}>
                        {getDisplayTime()}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'transform rotate-180' : ''
                    }`} />
                </button>
            </div>

            {/* Time Picker Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Time Picker Panel */}
                    <div 
                        ref={dropdownRef}
                        className={`absolute left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 min-w-[360px] flex flex-col ${
                            dropdownPosition === 'up' 
                                ? 'bottom-full mb-2 max-h-[70vh]' 
                                : 'top-full mt-2 max-h-[70vh]'
                        }`}
                    >
                        {/* Header with Mode Toggle - Fixed Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-800">Seleccionar Horario</h3>
                            
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setMode('visual')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                                        mode === 'visual' 
                                            ? 'bg-white text-gray-800 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Visual
                                </button>
                                <button
                                    onClick={() => setMode('manual')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                                        mode === 'manual' 
                                            ? 'bg-white text-gray-800 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Manual
                                </button>
                            </div>
                        </div>

                        {/* Time Picker Content - Scrollable Body */}
                        <div className="px-6 overflow-y-auto flex-1 min-h-0">
                            {mode === 'visual' ? <VisualTimePicker /> : <ManualTimePicker />}
                        </div>

                        {/* Selected Time Display - Always Visible */}
                        {currentStart && currentEnd && (
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Horario Seleccionado</p>
                                        <p className="text-lg font-bold text-gray-800">{selectedTime}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Duración</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {Math.floor(currentDuration / 60)}h {currentDuration % 60 > 0 ? `${currentDuration % 60}m` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions - Fixed Footer */}
                        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={!currentStart || !currentEnd}
                                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ModernTimePicker;