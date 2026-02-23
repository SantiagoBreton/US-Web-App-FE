import { CheckCircle } from 'lucide-react';
import GenericToast from './GenericToast';

interface ClaimSuccessToastProps {
  isVisible: boolean;
  onComplete: () => void;
  action?: 'created' | 'updated' | 'deleted';
  claimSubject?: string;
}

function ClaimSuccessToast({ 
  isVisible, 
  onComplete, 
  action = 'created',
  claimSubject 
}: ClaimSuccessToastProps) {
  const getActionText = () => {
    switch (action) {
      case 'created': return 'creado';
      case 'updated': return 'actualizado';
      case 'deleted': return 'eliminado';
      default: return 'procesado';
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'created': return 'Reclamo Creado';
      case 'updated': return 'Reclamo Actualizado';
      case 'deleted': return 'Reclamo Eliminado';
      default: return 'Reclamo Procesado';
    }
  };

  const getMessage = () => {
    const baseMessage = action === 'deleted' 
      ? 'Tu reclamo ha sido eliminado exitosamente'
      : `Tu reclamo ha sido ${getActionText()} exitosamente`;
    
    return claimSubject ? `${baseMessage}: "${claimSubject}"` : baseMessage;
  };

  return (
    <GenericToast
      isVisible={isVisible}
      onComplete={onComplete}
      title={getTitle()}
      message={getMessage()}
      type={action === 'deleted' ? 'warning' : 'success'}
      icon={CheckCircle}
      position="top-right"
      duration={4000}
    />
  );
}

export default ClaimSuccessToast;