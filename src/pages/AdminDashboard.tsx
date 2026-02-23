import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Building, 
    Calendar, 
    Shield,
    Home,
    Clock,
    BarChart3,
    Star,
    Car
} from "lucide-react";

import Header from "../components/Header";
import ProfilePanel from "../components/ProfilePanel";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import UserManagement from "../components/UserManagement";
import ReservationManagement from "../components/ReservationManagement";
import ApartmentManagement from "../components/ApartmentManagement";
import AmenityManagement from "../components/AmenityManagement";
import ClaimsManagement from "../components/ClaimsManagement";
import AnalyticsReports from "../components/AnalyticsReports";
import AdminRatingsView from "../components/AdminRatingsView";
import ParkingManagementModal from "../components/ParkingManagementModal";
import { LoadingOverlay } from "../components/LoadingSpinner";
import LogoutSuccessToast from "../components/LogoutSuccessToast";
import PasswordChangeSuccessToast from "../components/PasswordChangeSuccessToast";
import ReservationErrorToast from "../components/ReservationErrorToast";
import NotificationsModal from "../components/NotificationsModal";
import { getAdminStats, type AdminStats as AdminStatsType } from "../api_calls/admin";
import { updateUserName } from "../api_calls/update_user_name";
import { updateUserPassword } from "../api_calls/update_user_password";
import { deleteUser } from "../api_calls/delete_user";
import useNotifications from "../hooks/useNotifications";
import useNotificationToasts from "../hooks/useNotificationToasts";
import { NotificationToastContainer } from "../components/NotificationToast";
import type { UserData } from "../types";

const API_URL = import.meta.env.VITE_API_URL as string;

function AdminDashboard() {
    const [token, setToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [adminStats, setAdminStats] = useState<AdminStatsType | null>(null);
    
    const [showProfile, setShowProfile] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showReservationManagement, setShowReservationManagement] = useState(false);
    const [showApartmentManagement, setShowApartmentManagement] = useState(false);
    const [showAmenityManagement, setShowAmenityManagement] = useState(false);
    const [showClaimsManagement, setShowClaimsManagement] = useState(false);
    const [showAnalyticsReports, setShowAnalyticsReports] = useState(false);
    const [showRatingsView, setShowRatingsView] = useState(false);
    const [showParkingManagement, setShowParkingManagement] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showPasswordChangeToast, setShowPasswordChangeToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [newName, setNewName] = useState("");
    
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const { toasts, removeToast, showNewClaimToast } = useNotificationToasts();
    
    const {
        notifications,
        markAsRead,
        markAllAsRead
    } = useNotifications({ 
        token,
        onNewNotification: (notification) => {
            if (notification.type === 'new_claim' || notification.type === 'urgent_claim') {
                const isUrgent = notification.type === 'urgent_claim';
                const match = notification.message.match(/^(.+?) creó un reclamo: "(.+)"$/);
                if (match) {
                    const [, userName, claimTitle] = match;
                    showNewClaimToast(claimTitle, userName, isUrgent);
                }
            }
        }
    });

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            setToken(null);
            setIsInitialLoading(false);
            return;
        }
        setToken(savedToken);

        Promise.all([
            fetch(`${API_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()),
            
            getAdminStats(savedToken).catch(() => ({
                totalUsers: 0,
                totalApartments: 0,
                totalReservations: 0,
                activeReservations: 0,
                totalAmenities: 0
            }))
        ])
        .then(([dashboardData, statsData]) => {
            setUserData(dashboardData);
            setNewName(dashboardData.user.name);
            setAdminStats(statsData);
        })
        .catch(console.error)
        .finally(() => {
            setIsInitialLoading(false);
        });
    }, []);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <LoadingOverlay isVisible={true} text="Cargando panel de administración..." />
            </div>
        );
    }

    const handleLogout = () => {
        setShowProfile(false);
        setShowSuccessToast(true);
    };

    const handleLogoutComplete = () => {
        setShowSuccessToast(false);
        localStorage.removeItem("token");
        window.location.replace("/#/login");
    };

    const handlePasswordChangeComplete = () => {
        setShowPasswordChangeToast(false);
        localStorage.removeItem("token");
        window.location.href = "/#/login";
    };

    const handleSaveName = async () => {
        if (!token) return;
        setIsSavingName(true);
        try {
            await updateUserName(token, { name: newName });
            setUserData((prev) => prev && { ...prev, user: { ...prev.user, name: newName } });
            setShowEditPopup(false);
        } catch (err) {
            setErrorMessage("Error al actualizar nombre: " + (err instanceof Error ? err.message : "Error desconocido"));
            setShowErrorToast(true);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        if (!token || isChangingPassword) return;
        
        setIsChangingPassword(true);
        try {
            await updateUserPassword(token, { currentPassword, newPassword });
            setShowPasswordPopup(false);
            setShowPasswordChangeToast(true);
        } catch (err) {
            setErrorMessage("Error al cambiar contraseña: " + (err instanceof Error ? err.message : "Error desconocido"));
            setShowErrorToast(true);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!token || isDeletingAccount) return;

        setIsDeletingAccount(true);
        try {
            await deleteUser(token);
            localStorage.removeItem("token");
            setShowDeleteConfirm(false);
            setShowProfile(false);
            setShowSuccessToast(true);

            setTimeout(() => {
                window.location.replace("/#/login");
            }, 2000);
        } catch (err) {
            setShowDeleteConfirm(false);
            setErrorMessage("Error al eliminar la cuenta: " + (err instanceof Error ? err.message : "Error desconocido"));
            setShowErrorToast(true);
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <>
            <div className={`min-h-screen bg-gray-100 ${(showSuccessToast || showPasswordChangeToast) ? 'pointer-events-none' : ''}`}>
                <Header
                    userName={userData?.user.name || ""}
                    onProfileClick={() => setShowProfile((prev) => !prev)}
                    onLogout={handleLogout}
                    showClaimsTab={false}
                    showAmenitiesTab={false}
                    showCocherasTab={false}
                    showGamification={false}
                showNotifications={true}
                notifications={notifications}
                onMarkNotificationAsRead={markAsRead}
                onMarkAllNotificationsAsRead={markAllAsRead}
                onNotificationClick={(notification) => {
                    markAsRead(notification.id);
                    if (notification.claimId) {
                        setShowClaimsManagement(true);
                    }
                }}
                onNotificationsClick={() => setShowNotificationsModal(true)}
            />

            <div className="relative p-8">
                <div className="mb-12 relative overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-3xl p-8 shadow-2xl border border-blue-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">
                                        Panel de Administración
                                    </h1>
                                    <p className="text-blue-200 text-lg">
                                        Bienvenido, {userData?.user.name} - Administrador del Sistema
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                                <motion.div 
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all"
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowUserManagement(true)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">Usuarios</h3>
                                            <p className="text-2xl font-bold text-white">{adminStats?.totalUsers || 0}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all"
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowApartmentManagement(true)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <Building className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">Departamentos</h3>
                                            <p className="text-2xl font-bold text-white">{adminStats?.totalApartments || 0}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all"
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowReservationManagement(true)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">Reservas Totales</h3>
                                            <p className="text-2xl font-bold text-white">{adminStats?.totalReservations || 0}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all"
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowReservationManagement(true)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">Reservas Activas</h3>
                                            <p className="text-2xl font-bold text-white">{adminStats?.activeReservations || 0}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUserManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Administra usuarios y asignación de apartamentos
                        </p>
                        <div className="text-sm text-gray-500">
                            • Ver todos los usuarios<br />
                            • Asignar usuarios a apartamentos<br />
                            • Gestionar información de inquilinos
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowApartmentManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Gestión de Departamentos</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Administra apartamentos y asignaciones de inquilinos
                        </p>
                        <div className="text-sm text-gray-500">
                            • Crear/editar apartamentos<br />
                            • Asignar inquilinos<br />
                            • Ver ocupación
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAmenityManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Gestión de Amenities</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Configura espacios comunes y sus características
                        </p>
                        <div className="text-sm text-gray-500">
                            • Crear/editar amenities<br />
                            • Configurar capacidades<br />
                            • Establecer horarios
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReservationManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Gestión de Reservas</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Supervisa y administra todas las reservas del sistema
                        </p>
                        <div className="text-sm text-gray-500">
                            • Ver todas las reservas<br />
                            • Aprobar/rechazar reservas<br />
                            • Generar reportes
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowClaimsManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Gestión de Reclamos</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Administra y resuelve reclamos de los inquilinos
                        </p>
                        <div className="text-sm text-gray-500">
                            • Ver todos los reclamos<br />
                            • Cambiar estados<br />
                            • Asignar prioridades<br />
                            • Crear reclamos administrativos
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAnalyticsReports(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Análisis y Reportes</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Visualiza estadísticas
                        </p>
                        <div className="text-sm text-gray-500">
                            • Reportes de uso<br />
                            • Estadísticas de ocupación<br />
                            • Análisis de tendencias
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRatingsView(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Reseñas de Amenity</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Ver y analizar las calificaciones de los usuarios
                        </p>
                        <div className="text-sm text-gray-500">
                            • Ver todas las reseñas<br />
                            • Estadísticas por Amenity<br />
                            • Filtros avanzados
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowParkingManagement(true)}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Cocheras & Vehículos</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Gestioná cocheras, asignaciones y vehículos del edificio
                        </p>
                        <div className="text-sm text-gray-500">
                            • Crear/editar cocheras<br />
                            • Asignar a unidades<br />
                            • Ver vehículos registrados
                        </div>
                    </motion.div>
                </div>
            </div>

            <ProfilePanel
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
                userName={userData?.user.name || ""}
                onEditProfile={() => setShowEditPopup(true)}
                onChangePassword={() => setShowPasswordPopup(true)}
                onDeleteAccount={handleDeleteAccount}
                onLogout={handleLogout}
                isAdmin={true}
            />

            <EditProfileModal
                isVisible={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                newName={newName}
                onNameChange={setNewName}
                onSave={handleSaveName}
                isSaving={isSavingName}
            />

            <ChangePasswordModal
                isVisible={showPasswordPopup}
                onClose={() => setShowPasswordPopup(false)}
                onSave={handleChangePassword}
            />

            <DeleteAccountModal
                isVisible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                userName={userData?.user.name || ""}
                isDeleting={isDeletingAccount}
            />

            {token && (
                <UserManagement
                    isOpen={showUserManagement}
                    onClose={() => setShowUserManagement(false)}
                    token={token}
                    currentUserEmail={userData?.user?.email}
                />
            )}

            {token && (
                <ReservationManagement
                    isOpen={showReservationManagement}
                    onClose={() => setShowReservationManagement(false)}
                    token={token}
                />
            )}

            {token && (
                <ApartmentManagement
                    isOpen={showApartmentManagement}
                    onClose={() => setShowApartmentManagement(false)}
                    token={token}
                />
            )}

            {token && (
                <AmenityManagement
                    isOpen={showAmenityManagement}
                    onClose={() => setShowAmenityManagement(false)}
                    token={token}
                />
            )}

            {token && (
                <ClaimsManagement
                    isOpen={showClaimsManagement}
                    onClose={() => setShowClaimsManagement(false)}
                    token={token}
                />
            )}

            <LogoutSuccessToast
                isVisible={showSuccessToast}
                onComplete={handleLogoutComplete}
            />

            <PasswordChangeSuccessToast
                isVisible={showPasswordChangeToast}
                onComplete={handlePasswordChangeComplete}
            />
            
            <ReservationErrorToast
                isVisible={showErrorToast}
                errorMessage={errorMessage}
                onComplete={() => {
                    setShowErrorToast(false);
                    setErrorMessage('');
                }}
            />

            <NotificationToastContainer
                toasts={toasts}
                onRemoveToast={removeToast}
            />

            <NotificationsModal
                isOpen={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                onClaimClick={() => {
                    setShowNotificationsModal(false);
                    setShowClaimsManagement(true);
                }}
            />

            <AnalyticsReports
                isOpen={showAnalyticsReports}
                onClose={() => setShowAnalyticsReports(false)}
                token={token || ''}
            />

            <AdminRatingsView
                isOpen={showRatingsView}
                onClose={() => setShowRatingsView(false)}
            />

            {token && (
                <ParkingManagementModal
                    isOpen={showParkingManagement}
                    onClose={() => setShowParkingManagement(false)}
                    token={token}
                />
            )}
            </div>
        </>
    );
}

export default AdminDashboard;