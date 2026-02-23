import { LogOut } from "lucide-react";
import GenericConfirmModal from './GenericConfirmModal';

interface LogoutConfirmModalProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function LogoutConfirmModal({ isVisible, onConfirm, onCancel }: LogoutConfirmModalProps) {
    return (
        <GenericConfirmModal
            isVisible={isVisible}
            onClose={onCancel}
            onConfirm={onConfirm}
            title="Cerrar Sesión"
            description="¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder al sistema."
            confirmText="Cerrar Sesión"
            cancelText="Cancelar"
            variant="danger"
            icon={LogOut}
        />
    );
}

export default LogoutConfirmModal;