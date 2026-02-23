import { CheckCircle } from "lucide-react";
import GenericToast from './GenericToast';

interface AmenitySuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
    amenityName?: string;
    action?: 'created' | 'updated' | 'deleted';
}

function AmenitySuccessToast({ 
    isVisible, 
    onComplete, 
    amenityName, 
    action = 'created' 
}: AmenitySuccessToastProps) {
    const getTitle = () => {
        switch (action) {
            case 'created':
                return '¡Amenity creado!';
            case 'updated':
                return '¡Amenity actualizado!';
            case 'deleted':
                return '¡Amenity eliminado!';
            default:
                return '¡Operación exitosa!';
        }
    };

    const getMessage = () => {
        switch (action) {
            case 'created':
                return amenityName ? `${amenityName} ha sido creado exitosamente` : 'El amenity ha sido creado exitosamente';
            case 'updated':
                return amenityName ? `${amenityName} ha sido actualizado exitosamente` : 'El amenity ha sido actualizado exitosamente';
            case 'deleted':
                return amenityName ? `${amenityName} ha sido eliminado exitosamente` : 'El amenity ha sido eliminado exitosamente';
            default:
                return 'La operación se completó exitosamente';
        }
    };

    return (
        <GenericToast
            isVisible={isVisible}
            onComplete={onComplete}
            title={getTitle()}
            message={getMessage()}
            type="success"
            icon={CheckCircle}
            position="top-right"
            duration={3000}
        />
    );
}

export default AmenitySuccessToast;