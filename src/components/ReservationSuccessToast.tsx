import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface ReservationSuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
    amenityName?: string;
    timeSlot?: string;
}

function ReservationSuccessToast({ 
    isVisible, 
    onComplete, 
    amenityName, 
    timeSlot 
}: ReservationSuccessToastProps) {
    const getMessage = () => {
        let message = "Tu reserva ha sido confirmada exitosamente";
        if (amenityName) {
            message += ` para ${amenityName}`;
            if (timeSlot) {
                message += ` • ${timeSlot}`;
            }
        }
        return message;
    };

    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="¡Reserva confirmada!"
            message={getMessage()}
            type="success"
            icon={CheckCircle}
            position="top-right"
            duration={4000}
        />
    );
}

export default ReservationSuccessToast;