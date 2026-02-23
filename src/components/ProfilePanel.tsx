import { ArrowLeft, User, Edit3, Lock, Trash2, LogOut, Settings, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfilePanelProps {
    isVisible: boolean;
    onClose: () => void;
    userName: string;
    onEditProfile: () => void;
    onChangePassword: () => void;
    onDeleteAccount: () => void;
    onLogout: () => void;
    isAdmin?: boolean;
}

function ProfilePanel({ 
    isVisible, 
    onClose, 
    userName, 
    onEditProfile,
    onChangePassword,
    onDeleteAccount, 
    onLogout,
    isAdmin = false
}: ProfilePanelProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Enhanced Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 backdrop-blur-md bg-black/30 z-40"
                        onClick={onClose}
                    />

                    {/* Responsive Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30,
                            mass: 0.8
                        }}
                        className="fixed top-0 right-0 h-full w-full sm:w-96 md:w-[420px] bg-white shadow-2xl flex flex-col z-50"
                    >
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                            
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors cursor-pointer p-2 rounded-lg hover:bg-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            {/* Profile Header */}
                            <div className="mt-8 relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Configuración</h2>
                                        <p className="text-slate-200">Gestiona tu cuenta</p>
                                    </div>
                                </div>
                                
                                {/* User Info Card */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{userName}</p>
                                            <p className="text-sm text-slate-300">Usuario del sistema</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-6 bg-gray-50">
                            <div className="space-y-4">
                                {/* Account Management Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Gestión de Cuenta
                                    </h3>
                                    
                                    <div className="space-y-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onEditProfile}
                                            className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100 hover:border-blue-200"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                <Edit3 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Editar Nombre</p>
                                                <p className="text-sm text-gray-500">Cambiar información personal</p>
                                            </div>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onChangePassword}
                                            className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100 hover:border-green-200"
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                <Lock className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Cambiar Contraseña</p>
                                                <p className="text-sm text-gray-500">Actualizar credenciales de acceso</p>
                                            </div>
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                {!isAdmin && (
                                    <div className="pt-4">
                                        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Zona Peligrosa
                                        </h3>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onDeleteAccount}
                                            className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-red-100 hover:border-red-200"
                                        >
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900">Eliminar Cuenta</p>
                                                <p className="text-sm text-gray-500">Eliminar permanentemente la cuenta</p>
                                            </div>
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="p-6 bg-white border-t border-gray-200">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default ProfilePanel;