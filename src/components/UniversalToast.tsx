import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import GenericToast from './GenericToast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface UniversalToastProps {
  isVisible: boolean;
  onComplete: () => void;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'success' as const
  },
  error: {
    icon: XCircle,
    color: 'error' as const
  },
  warning: {
    icon: AlertTriangle,
    color: 'warning' as const
  },
  info: {
    icon: Info,
    color: 'info' as const
  }
};

function UniversalToast({ 
  isVisible, 
  onComplete, 
  type,
  title,
  message,
  duration = 3000,
  position = 'top-right'
}: UniversalToastProps) {
  const config = toastConfig[type];

  return (
    <GenericToast
      isVisible={isVisible}
      onComplete={onComplete}
      title={title}
      message={message}
      type={config.color}
      icon={config.icon}
      position={position}
      duration={duration}
    />
  );
}



export default UniversalToast;