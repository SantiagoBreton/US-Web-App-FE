import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface LogoutSuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function LogoutSuccessToast({ isVisible, onComplete }: LogoutSuccessToastProps) {
    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Sesión cerrada"
            message="Redirigiendo al login..."
            type="success"
            icon={CheckCircle}
            position="top-right"
            duration={2000}
        />
    );
}

export default LogoutSuccessToast;