import { AlertTriangle } from "lucide-react";
import GenericConfirmModal from './GenericConfirmModal';

interface DeleteAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isDeleting?: boolean;
}

function DeleteAccountModal({ 
    isVisible, 
    onClose, 
    onConfirm,
    userName,
    isDeleting = false
}: DeleteAccountModalProps) {
    const description = `¿Estás seguro de que quieres eliminar tu cuenta permanentemente? Esta acción no se puede deshacer y perderás todos tus datos.`;

    return (
        <GenericConfirmModal
            isVisible={isVisible}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Eliminar cuenta"
            description={description}
            itemName={userName}
            confirmText={isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
            cancelText="Cancelar"
            variant="danger"
            icon={AlertTriangle}
            isLoading={isDeleting}
        />
    );
}

export default DeleteAccountModal;