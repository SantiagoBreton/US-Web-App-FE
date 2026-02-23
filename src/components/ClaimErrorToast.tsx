import { AlertCircle } from 'lucide-react';
import GenericToast from './GenericToast';

interface ClaimErrorToastProps {
  isVisible: boolean;
  onComplete: () => void;
  action?: 'create' | 'update' | 'delete';
  errorMessage?: string;
}

function ClaimErrorToast({ 
  isVisible, 
  onComplete, 
  action = 'create',
  errorMessage 
}: ClaimErrorToastProps) {
  const getActionText = () => {
    switch (action) {
      case 'create': return 'crear';
      case 'update': return 'actualizar';
      case 'delete': return 'eliminar';
      default: return 'procesar';
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'create': return 'Error al Crear Reclamo';
      case 'update': return 'Error al Actualizar Reclamo';
      case 'delete': return 'Error al Eliminar Reclamo';
      default: return 'Error en Reclamo';
    }
  };

  const getMessage = () => {
    return errorMessage || `No se pudo ${getActionText()} el reclamo. Por favor, inténtalo de nuevo.`;
  };

  return (
    <GenericToast
      isVisible={isVisible}
      onComplete={onComplete}
      title={getTitle()}
      message={getMessage()}
      type="error"
      icon={AlertCircle}
      position="top-right"
      duration={5000}
    />
  );
}

export default ClaimErrorToast;