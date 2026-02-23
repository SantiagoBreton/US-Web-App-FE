import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

interface AdminTimePickerProps {
    label: string;
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

function AdminTimePicker({ 
    label, 
    value, 
    onChange, 
    placeholder = "Seleccionar hora",
    disabled = false 
}: AdminTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            
            const hourStr = hour.toString().padStart(2, '0');
            options.push({
                value: `${hourStr}:00`,
                label: `${hourStr}:00`
            });

            options.push({
                value: `${hourStr}:30`,
                label: `${hourStr}:30`
            });
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    const formatDisplayTime = (time: string) => {
        if (!time) return placeholder;
        
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${displayHour}:${minutes} ${period}`;
    };

    const handleTimeSelect = (selectedTime: string) => {
        onChange(selectedTime);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            
            {/* Custom Select Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-4 py-3 text-left border rounded-xl transition-all duration-200
                    flex items-center justify-between
                    ${disabled 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : isOpen
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                    ${!value && !disabled ? 'text-gray-400' : 'text-gray-900'}
                `}
            >
                <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="font-medium">
                        {value ? formatDisplayTime(value) : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${
                        disabled ? 'text-gray-400' : 'text-gray-500'
                    } ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <>
                    {/* Overlay to close dropdown */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Options Container */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                        <div className="p-2">
                            {timeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleTimeSelect(option.value)}
                                    className={`
                                        w-full px-3 py-2 text-left rounded-lg transition-colors duration-150
                                        flex items-center gap-3
                                        ${value === option.value
                                            ? 'bg-blue-100 text-blue-700 font-semibold'
                                            : 'hover:bg-gray-100 text-gray-700'
                                        }
                                    `}
                                >
                                    <span className="text-sm font-medium">
                                        {formatDisplayTime(option.value)}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {option.value}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminTimePicker;