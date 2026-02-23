import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface ReservationCancelledToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function ReservationCancelledToast({ isVisible, onComplete }: ReservationCancelledToastProps) {
    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Reserva cancelada"
            message="Tu reserva ha sido cancelada exitosamente"
            type="warning"
            icon={CheckCircle}
            position="top-right"
            duration={3000}
        />
    );
}

export default ReservationCancelledToast;