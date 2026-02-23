import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface FilterOption<T = string> {
  value: T;
  label: string;
  icon: LucideIcon;
  color?: string;
  description?: string;
}

interface GenericFilterModalProps<T = string> {
  isVisible: boolean;
  onClose: () => void;
  selectedValue: T;
  onValueSelect: (value: T) => void;
  options: FilterOption<T>[];
  title: string;
  subtitle?: string;
  headerIcon?: LucideIcon;
  headerIconColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

function GenericFilterModal<T extends string = string>({ 
  isVisible, 
  onClose, 
  selectedValue, 
  onValueSelect, 
  options,
  title,
  subtitle,
  headerIcon: HeaderIcon,
  headerIconColor = 'text-blue-600',
  maxWidth = 'md'
}: GenericFilterModalProps<T>) {
  if (!isVisible) return null;

  const handleOptionClick = (value: T) => {
    onValueSelect(value);
    onClose();
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white rounded-2xl shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[80vh] overflow-y-auto scrollbar-hide`}
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {HeaderIcon && (
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HeaderIcon className={`w-5 h-5 ${headerIconColor}`} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedValue === option.value;
              
              return (
                <button
                  key={String(option.value)}
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md text-left cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GenericFilterModal;