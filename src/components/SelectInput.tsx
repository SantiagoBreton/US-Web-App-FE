import type { IconType } from 'react-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: IconType;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

function SelectInput({
  label,
  placeholder = "Selecciona una opción",
  value,
  onChange,
  options,
  icon: Icon,
  error,
  required,
  disabled,
  className = ''
}: SelectInputProps) {
  const baseClasses = `
    w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer bg-white
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${Icon ? 'pl-10' : 'px-4'}
    pr-4 py-3
  `.trim();

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-3 left-3 text-gray-500" size={20} />
        )}
        
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          disabled={disabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default SelectInput;