import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'time';
  icon?: LucideIcon | IconType;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number; 
  maxLength?: number;
  showPasswordToggle?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  inputClassName?: string;
  showCharacterCount?: boolean;
  helperText?: string;
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  error,
  required,
  disabled,
  min,
  max,
  step,
  rows,
  maxLength,
  showPasswordToggle,
  onFocus,
  onBlur,
  className = '',
  inputClassName = '',
  showCharacterCount,
  helperText
}: FormInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isTextarea = rows && rows > 1;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = `
    w-full border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${Icon || showPasswordToggle ? 'pl-10' : 'px-4'}
    ${showPasswordToggle ? 'pr-12' : 'pr-4'}
    py-3
    ${inputClassName}
  `.trim();

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
        )}
        
        <InputComponent
          type={isTextarea ? undefined : inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
            onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)
          }
          className={baseClasses}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          rows={rows}
          onFocus={onFocus}
          onBlur={onBlur}
          style={type === 'number' ? { MozAppearance: 'textfield' } : undefined}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : helperText ? (
            <p className="text-sm text-gray-500">{helperText}</p>
          ) : null}
        </div>
        
        {showCharacterCount && maxLength && (
          <p className="text-sm text-gray-400">{value.length}/{maxLength}</p>
        )}
      </div>
    </div>
  );
}

export default FormInput;