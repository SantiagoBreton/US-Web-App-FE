interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  currentPassword?: string;
  isVisible?: boolean;
  className?: string;
}

interface ValidationRule {
  test: (password: string, confirmPassword?: string, currentPassword?: string) => boolean;
  label: string;
  key: string;
}

const validationRules: ValidationRule[] = [
  {
    key: 'length',
    test: (password) => password.length >= 6,
    label: 'Al menos 6 caracteres'
  },
  {
    key: 'uppercase',
    test: (password) => /[A-Z]/.test(password),
    label: 'Al menos una letra mayúscula'
  },
  {
    key: 'number',
    test: (password) => /[0-9]/.test(password),
    label: 'Al menos un número'
  },
  {
    key: 'different',
    test: (password, _confirmPassword, currentPassword) => 
      currentPassword ? currentPassword !== password : true,
    label: 'Diferente a la contraseña actual'
  }
];

function PasswordRequirements({ 
  password, 
  confirmPassword, 
  currentPassword, 
  isVisible = true,
  className = '' 
}: PasswordRequirementsProps) {
  if (!isVisible) return null;

  return (
    <div className={`text-xs space-y-1 ${className}`}>
      <p className="text-gray-600 font-medium">La contraseña debe tener:</p>
      {validationRules.map((rule) => {
        const isValid = rule.test(password, confirmPassword, currentPassword);
        const shouldShow = rule.key !== 'different' || currentPassword;
        
        if (!shouldShow) return null;
        
        return (
          <div key={rule.key} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              isValid ? 'bg-green-500' : 'bg-gray-300'
            }`}></span>
            <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
              {rule.label}
            </span>
          </div>
        );
      })}
      
      {confirmPassword && (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            confirmPassword === password && password.length > 0 ? 'bg-green-500' : 'bg-gray-300'
          }`}></span>
          <span className={
            confirmPassword === password && password.length > 0 ? 'text-green-600' : 'text-gray-500'
          }>
            Las contraseñas coinciden
          </span>
        </div>
      )}
    </div>
  );
}



export default PasswordRequirements;