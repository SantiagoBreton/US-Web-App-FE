import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface RegistrationSuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function RegistrationSuccessToast({ isVisible, onComplete }: RegistrationSuccessToastProps) {
    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Usuario creado exitosamente"
            message="Redirigiendo al login..."
            type="success"
            icon={CheckCircle}
            position="top-right"
            duration={2000}
        />
    );
}

export default RegistrationSuccessToast;