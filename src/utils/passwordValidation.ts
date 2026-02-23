// Validation helper function for password validation
export const validatePassword = (
  password: string, 
  confirmPassword?: string, 
  currentPassword?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('La contraseña es obligatoria');
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra mayúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }
  
  if (currentPassword && currentPassword === password) {
    errors.push('La nueva contraseña debe ser diferente a la actual');
  }
  
  if (confirmPassword && confirmPassword !== password) {
    errors.push('Las contraseñas no coinciden');
  }
  
  return { isValid: errors.length === 0, errors };
};