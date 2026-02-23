import { AlertCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface ReservationErrorToastProps {
    isVisible: boolean;
    onComplete: () => void;
    errorMessage?: string;
}

function ReservationErrorToast({ 
    isVisible, 
    onComplete, 
    errorMessage 
}: ReservationErrorToastProps) {
    const getMessage = () => {
        return errorMessage || "No se pudo completar la reserva. Inténtalo de nuevo.";
    };

    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Error al reservar"
            message={getMessage()}
            type="error"
            icon={AlertCircle}
            position="top-right"
            duration={6000}
        />
    );
}

export default ReservationErrorToast;