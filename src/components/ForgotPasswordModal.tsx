import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HiOutlineMail } from 'react-icons/hi';
import FormInput from './FormInput';

interface ForgotPasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSendEmail: (email: string) => Promise<void>;
}

function ForgotPasswordModal({ 
    isVisible, 
    onClose, 
    onSendEmail 
}: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const resetForm = () => {
        setEmail("");
        setError("");
        setIsLoading(false);
        setIsSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("El correo electrónico es obligatorio");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Por favor ingresa un correo electrónico válido");
            return;
        }

        setIsLoading(true);
        try {
            await onSendEmail(email);
            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al enviar correo de recuperación");
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
                        {!isSuccess ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineMail className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">Recuperar contraseña</h3>
                                    <p className="text-gray-600 text-sm">
                                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <FormInput
                                            type="email"
                                            placeholder="Correo electrónico"
                                            value={email}
                                            onChange={setEmail}
                                            icon={HiOutlineMail}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all cursor-pointer"
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Enviando..." : "Enviar enlace"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">¡Correo enviado!</h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                                    Revisa tu bandeja de entrada y sigue las instrucciones.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                                    <p className="text-xs text-blue-700">
                                        Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                                >
                                    Entendido
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ForgotPasswordModal;