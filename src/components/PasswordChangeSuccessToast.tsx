import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface PasswordChangeSuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function PasswordChangeSuccessToast({ isVisible, onComplete }: PasswordChangeSuccessToastProps) {
    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Contraseña actualizada"
            message="Tu contraseña ha sido cambiada exitosamente. Redirigiendo al login..."
            type="success"
            icon={CheckCircle}
            position="top-right"
            duration={3000}
        />
    );
}

export default PasswordChangeSuccessToast;