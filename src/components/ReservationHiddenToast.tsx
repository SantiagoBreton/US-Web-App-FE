import { EyeOff } from "lucide-react";
import GenericToast from './GenericToast';

interface ReservationHiddenToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function ReservationHiddenToast({ isVisible, onComplete }: ReservationHiddenToastProps) {
    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title="Reserva ocultada"
            message="La reserva se eliminó de tu vista"
            type="info"
            icon={EyeOff}
            position="top-right"
            duration={3000}
        />
    );
}

export default ReservationHiddenToast;