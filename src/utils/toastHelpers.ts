// Helper functions for common toast messages
export const createToast = {
  success: (title: string, message: string) => ({ type: 'success' as const, title, message }),
  error: (title: string, message: string) => ({ type: 'error' as const, title, message }),
  warning: (title: string, message: string) => ({ type: 'warning' as const, title, message }),
  info: (title: string, message: string) => ({ type: 'info' as const, title, message }),
  
  // Common patterns
  operationSuccess: (operation: string, entity: string) => ({
    type: 'success' as const,
    title: `${operation} exitoso`,
    message: `${entity} ${operation.toLowerCase()} correctamente`
  }),
  operationError: (operation: string, entity: string) => ({
    type: 'error' as const,
    title: `Error en ${operation.toLowerCase()}`,
    message: `No se pudo ${operation.toLowerCase()} ${entity.toLowerCase()}`
  }),
};