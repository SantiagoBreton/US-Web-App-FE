import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FormInput from "./FormInput";
import PasswordRequirements from "./PasswordRequirements";
import { validatePassword } from "../utils/passwordValidation";

interface ChangePasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

function ChangePasswordModal({ 
    isVisible, 
    onClose, 
    onSave 
}: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);


    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setIsLoading(false);
        setShowRequirements(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        setError("");

        const validation = validatePassword(newPassword, confirmPassword, currentPassword);
        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        if (!currentPassword) {
            setError("La contraseña actual es obligatoria");
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentPassword, newPassword);
            resetForm();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Cambiar contraseña</h3>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <FormInput
                                type="password"
                                placeholder="Contraseña actual"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                showPasswordToggle
                                disabled={isLoading}
                            />
                            
                            <div>
                                <FormInput
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    showPasswordToggle
                                    onFocus={() => setShowRequirements(true)}
                                    onBlur={() => setShowRequirements(false)}
                                    disabled={isLoading}
                                />
                                
                                <PasswordRequirements
                                    password={newPassword}
                                    currentPassword={currentPassword}
                                    isVisible={showRequirements}
                                    className="mt-2"
                                />
                            </div>
                            
                            <FormInput
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                showPasswordToggle
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all cursor-pointer"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-all disabled:opacity-50 cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ChangePasswordModal;