import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { createReservation } from "../api_calls/post_reservation";
import { Car, MapPin, ChevronRight, ParkingSquare } from "lucide-react";

import { getReservationsByAmenity } from "../api_calls/get_amenity_reservations";
import { updateUserName } from "../api_calls/update_user_name";
import { updateUserPassword } from "../api_calls/update_user_password";
import { deleteUser } from "../api_calls/delete_user";
import { cancelReservation } from "../api_calls/cancel_reservation";
import { hideReservationFromUser } from "../api_calls/hide_reservation";
import Header from "../components/Header";
import ProfilePanel from "../components/ProfilePanel";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import SpaceSelector from "../components/SpaceSelector";
import TimeSelector from "../components/TimeSelector";
import ReservationList from "../components/ReservationList";
import { LoadingOverlay } from "../components/LoadingSpinner";
import LogoutSuccessToast from "../components/LogoutSuccessToast";
import PasswordChangeSuccessToast from "../components/PasswordChangeSuccessToast";
import CancelReservationModal from "../components/CancelReservationModal";
import ReservationCancelledToast from "../components/ReservationCancelledToast";
import ReservationHiddenToast from "../components/ReservationHiddenToast";
import ReservationSuccessToast from "../components/ReservationSuccessToast";
import ReservationErrorToast from "../components/ReservationErrorToast";
import ClaimsPage from "./ClaimsPage";
import useUserNotifications from "../hooks/useUserNotifications";
import useNotificationToasts from "../hooks/useNotificationToasts";
import { NotificationToastContainer } from "../components/NotificationToast";
import { GamificationProvider } from "../contexts/GamificationContext";
import WelcomeSection from "../components/WelcomeSection";
import MyVehiclesModal from "../components/MyVehiclesModal";
import VisitorParkingModal from "../components/VisitorParkingModal";
import { getMyGarages, type MyGarage } from "../api_calls/garages";
import type { UserData, ReservationData, Reservation, Amenity } from "../types";

const API_URL = import.meta.env.VITE_API_URL as string;

function TenantDashboard() {
    const [token, setToken] = useState<string | null | undefined>(undefined);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<string>("Gym");
    const [selectedTime, setSelectedTime] = useState<string>("08:00 - 09:00");
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [reservations, setReservations] = useState<ReservationData>({});
    const [timeError, setTimeError] = useState<string | null>(null);
    const [userReservations, setUserReservations] = useState<Reservation[]>([]);
    const [selectedDate, setSelectedDate] = useState("");

    const [showProfile, setShowProfile] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showPasswordChangeToast, setShowPasswordChangeToast] = useState(false);
    const [newName, setNewName] = useState("");
    const [activeTab, setActiveTab] = useState<"dashboard" | "reclamos" | "cocheras">("dashboard");
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isReserving, setIsReserving] = useState(false);
    const [isCancelling, setIsCancelling] = useState<number | null>(null);
    const [isHiding, setIsHiding] = useState<number | null>(null);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
    const [showCancelToast, setShowCancelToast] = useState(false);
    const [showHiddenToast, setShowHiddenToast] = useState(false);
    const [showReservationToast, setShowReservationToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successReservationData, setSuccessReservationData] = useState<{ amenityName: string; timeSlot: string } | null>(null);
    const [showReservationErrorToast, setShowReservationErrorToast] = useState(false);
    const [reservationErrorMessage, setReservationErrorMessage] = useState<string | null>(null);
    const [showMyVehicles,       setShowMyVehicles]       = useState(false);
    const [showVisitorParking,    setShowVisitorParking]    = useState(false);
    const [myGarages,             setMyGarages]             = useState<MyGarage[]>([]);

    const { toasts, removeToast, addToast } = useNotificationToasts();
    
    const {
        notifications: userNotifications,
        unreadCount: userUnreadCount,
        markAsRead: markUserNotificationAsRead,
        markAllAsRead: markAllUserNotificationsAsRead,
        deleteNotification: deleteUserNotification,
        refresh: refreshUserNotifications
    } = useUserNotifications({ 
        token: token || null,
        onNewNotification: (notification) => {
            const getToastType = (notifType: string) => {
                switch (notifType) {
                    case 'reservation_confirmed':
                        return 'new_notification' as const;
                    case 'reservation_reminder':
                        return 'new_notification' as const;
                    case 'reservation_cancelled':
                        return 'urgent_notification' as const;
                    case 'reservation_modified':
                        return 'urgent_notification' as const;
                    default:
                        return 'new_notification' as const;
                }
            };

            addToast({
                type: getToastType(notification.type),
                title: notification.title,
                message: notification.message,
                duration: 5000
            });
        }
    });

    const fetchReservations = useCallback(async (id: number) => {
        if (!token) return [];
        return getReservationsByAmenity(token, id);
    }, [token]);

    const getCurrentReservationCount = useCallback(async (amenityName: string, date: string, timeSlot: string): Promise<number> => {
        if (!token) return 0;
        
        const amenity = amenities.find(a => a.name === amenityName);
        if (!amenity) return 0;

        try {
            const [startTimeStr, endTimeStr] = timeSlot.split(" - ");
            if (!startTimeStr || !endTimeStr) return 0;

            const buildTimestampFromUserTime = (dateStr: string, timeStr: string): string => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                
                const [year, month, day] = dateStr.split('-').map(Number);
                const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
                
                return localDate.toISOString();
            };

            const utcSlotStart = new Date(buildTimestampFromUserTime(date, startTimeStr));
            const utcSlotEnd = new Date(buildTimestampFromUserTime(date, endTimeStr));

            const reservations = await getReservationsByAmenity(token, amenity.id, date, date);
            
            if (reservations.length === 0) {
                return 0;
            }
            
            let count = 0;
            reservations.forEach(reservation => {
                const resStart = new Date(reservation.startTime);
                const resEnd = new Date(reservation.endTime);

                const hasOverlap = resStart < utcSlotEnd && resEnd > utcSlotStart;
                
                if (hasOverlap) {
                    count++;
                }
            });

            return count;
        } catch (error) {
            console.error('Error calculating reservation count:', error);
            return 0;
        }
    }, [token, amenities]);

    const getAmenityOccupancy = useCallback(async (amenityName: string, date: string, timeSlot: string): Promise<number> => {
        if (!token) return 0;
        
        const amenity = amenities.find(a => a.name === amenityName);
        if (!amenity) return 0;

        try {
            const currentReservations = await getCurrentReservationCount(amenityName, date, timeSlot);
            const occupancyPercentage = (currentReservations / amenity.capacity) * 100;
            return Math.min(100, occupancyPercentage);
        } catch (error) {
            console.error('Error calculating amenity occupancy:', error);
            return 0;
        }
    }, [amenities, getCurrentReservationCount]);

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
            
            fetch(`${API_URL}/amenities`, {
                headers: { Authorization: `Bearer ${savedToken}` },
            }).then((res) => res.json()),

            getMyGarages(savedToken).catch(() => [])
        ])
        .then(([dashboardData, amenitiesData, garagesData]) => {
            if (dashboardData && dashboardData.user) {
                setUserData(dashboardData);
                setNewName(dashboardData.user.name);
            }
            if (Array.isArray(amenitiesData)) {
                setAmenities(amenitiesData);
            }
            if (Array.isArray(garagesData)) {
                setMyGarages(garagesData);
            }
        })
        .catch((error) => {
            console.error('Error loading dashboard data:', error);
            setUserData(null);
            setAmenities([]);
        })
        .finally(() => {
            setIsInitialLoading(false);
        });
    }, []);

    useEffect(() => {
        if (amenities.length > 0) {
            setSelectedSpace(amenities[0].name);
            
            if (!selectedDate) {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                setSelectedDate(formattedDate);
            }
            
            setReservations((prev) => {
                const newReservations: ReservationData = { ...prev };
                amenities.forEach((a) => {
                    if (!newReservations[a.name]) {
                        newReservations[a.name] = { "08:00 - 09:00": 0, "09:00 - 10:00": 0 };
                    }
                });
                return newReservations;
            });
            setSelectedTime("08:00 - 09:00");
        }
    }, [amenities]);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/reservations`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(setUserReservations)
            .catch(console.error);
    }, [token]);

    if (token === undefined || isInitialLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <LoadingOverlay isVisible={true} text="Cargando dashboard..." />
            </div>
        );
    }
    if (!token) return <Navigate to="/login" />;

    const handleReserve = async () => {
        setIsReserving(true);
        setTimeError(null);
        
        const buildTimestampFromUserTime = (dateStr: string, timeStr: string): string => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            const [year, month, day] = dateStr.split('-').map(Number);
            const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
            
            return localDate.toISOString();
        };
        
        try {
            const [startStr, endStr] = selectedTime.split(" - ");
            
            const selectedAmenity = amenities.find((a) => a.name === selectedSpace);
            if (!selectedAmenity) {
                setTimeError("❌ Amenity no encontrado");
                setIsReserving(false);
                return;
            }

            if (selectedAmenity.isActive === false) {
                setTimeError("❌ Este amenity no está disponible actualmente");
                setIsReserving(false);
                return;
            }

            if (selectedAmenity.openTime && selectedAmenity.closeTime) {
                const [openHour, openMin] = selectedAmenity.openTime.split(":").map(Number);
                const [closeHour, closeMin] = selectedAmenity.closeTime.split(":").map(Number);
                const [startHour, startMin] = startStr.split(":").map(Number);
                const [endHour, endMin] = endStr.split(":").map(Number);
                
                const openMinutes = openHour * 60 + openMin;
                const closeMinutes = closeHour * 60 + closeMin;
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                
                if (startMinutes < openMinutes || endMinutes > closeMinutes) {
                    setTimeError(`❌ El horario seleccionado está fuera del horario de operación (${selectedAmenity.openTime} - ${selectedAmenity.closeTime})`);
                    setIsReserving(false);
                    return;
                }
            }
            
            const [year, month, day] = selectedDate.split('-').map(Number);
            const baseDate = new Date(year, month - 1, day);
            const startDateTime = new Date(baseDate);
            const endDateTime = new Date(baseDate);

            const [sh, sm] = startStr.split(":").map(Number);
            const [eh, em] = endStr.split(":").map(Number);
            startDateTime.setHours(sh, sm, 0, 0);
            endDateTime.setHours(eh, em, 0, 0);

            const currentTime = new Date();
            if (startDateTime < currentTime) {
                setTimeError("❌ No puedes hacer una reserva para una hora que ya ha pasado");
                setIsReserving(false);
                return;
            }

            const fiveMinutesFromNow = new Date(currentTime.getTime() + 5 * 60 * 1000);
            if (startDateTime < fiveMinutesFromNow) {
                setTimeError("❌ Las reservas deben hacerse con al menos 5 minutos de anticipación");
                setIsReserving(false);
                return;
            }

            const amenity = selectedAmenity;
            if (!amenity) return;

            const reservationData = await createReservation(token, {
                amenityId: amenity.id,
                startTime: buildTimestampFromUserTime(selectedDate, startStr),
                endTime: buildTimestampFromUserTime(selectedDate, endStr),
            });

            setReservations((prev) => ({
                ...prev,
                [selectedSpace]: {
                    ...prev[selectedSpace],
                    [selectedTime]: (prev[selectedSpace][selectedTime] || 0) + 1,
                },
            }));

            const newReservation: Reservation = {
                id: reservationData.id || reservationData.reservation?.id || Date.now(),
                startTime: buildTimestampFromUserTime(selectedDate, startStr),
                endTime: buildTimestampFromUserTime(selectedDate, endStr),
                status: reservationData.status || reservationData.reservation?.status,
                amenity: {
                    id: amenity.id,
                    name: amenity.name,
                }
            };

            setUserReservations((prev) => [newReservation, ...prev]);

            setTimeError(null);
            
            if (newReservation.status.name !== 'pendiente') {
                setSuccessReservationData({
                    amenityName: selectedSpace,
                    timeSlot: selectedTime
                });
                setShowReservationToast(true);
            }

            refreshUserNotifications();

        } catch (err: any) {
            setReservationErrorMessage(err.message || "Error al procesar la reserva");
            setShowReservationErrorToast(true);
            setTimeError(null);
        } finally {
            setIsReserving(false);
        }
    };
    const handleCancelReservation = (reservationId: number) => {
        const reservation = userReservations.find(r => r.id === reservationId);
        if (reservation) {
            setReservationToCancel(reservation);
            setShowCancelModal(true);
        }
    };

    const handleConfirmCancelReservation = async () => {
        if (!token || !reservationToCancel) return;
        
        setIsCancelling(reservationToCancel.id);
        try {
            await cancelReservation(token, reservationToCancel.id);
            setUserReservations(prev =>
                prev.map(r => r.id === reservationToCancel.id ? { ...r, status: { id: 3, name: "cancelada", label: "Cancelada" } } : r)
            );
            
            setShowCancelModal(false);
            setShowCancelToast(true);

            refreshUserNotifications();
        } catch (err: any) {
            console.error(err);
            setErrorMessage("Error canceling reservation: " + err.message);
            setShowErrorToast(true);
        } finally {
            setIsCancelling(null);
            setReservationToCancel(null);
        }
    };

    const handleRemoveFromView = async (reservationId: number) => {
        if (!token) return;
        setIsHiding(reservationId);
        try {
            await hideReservationFromUser(token, reservationId);
            
            setUserReservations(prev =>
                prev.filter(r => r.id !== reservationId)
            );
            
            setShowHiddenToast(true);
        } catch (err: any) {
            console.error(err);
            setErrorMessage("Error ocultando reserva: " + err.message);
            setShowErrorToast(true);
        } finally {
            setIsHiding(null);
        }
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
        if (!token) return;
        await updateUserPassword(token, { currentPassword, newPassword });
        setShowPasswordPopup(false);
        setShowPasswordChangeToast(true);
    };

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
        <GamificationProvider userId={userData?.user.id || 0}>
            <div className={`min-h-screen bg-gray-100 overflow-hidden ${(showSuccessToast || showPasswordChangeToast) ? 'pointer-events-none' : ''}`}>
                {/* HEADER */}
                <Header
                    userName={userData?.user.name || ""}
                    onProfileClick={() => setShowProfile((prev) => !prev)}
                    onLogout={handleLogout}
                    onClaimsClick={() => setActiveTab("reclamos")}
                    onDashboardClick={() => setActiveTab("dashboard")}
                    onCocherasClick={() => setActiveTab("cocheras")}
                    activeTab={activeTab}
                userNotifications={userNotifications}
                userUnreadCount={userUnreadCount}
                onMarkUserNotificationAsRead={markUserNotificationAsRead}
                onMarkAllUserNotificationsAsRead={markAllUserNotificationsAsRead}
                onDeleteUserNotification={deleteUserNotification}
                onUserNotificationClick={(notification) => {
                    console.log('Notificación clickeada:', notification);
                }}
            />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative p-8">
                {/* WELCOME SECTION */}
                <WelcomeSection userName={userData?.user.name || ""} />

            {/* Mostrar ClaimsPage si activeTab es 'reclamos', sino mostrar el dashboard original */}
            {activeTab === "reclamos" ? (
                <ClaimsPage />
            ) : activeTab === "cocheras" ? (
                <div className="space-y-6 mt-2">

                    {/* ─ Header banner ─────────────────────────────────────── */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-3xl p-6 flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <ParkingSquare className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Cocheras &amp; Vehículos</h2>
                            <p className="text-slate-300 text-sm mt-0.5">
                                {myGarages.length > 0
                                    ? `Tenés ${myGarages.length} cochera${myGarages.length !== 1 ? 's' : ''} asignada${myGarages.length !== 1 ? 's' : ''} a tu unidad`
                                    : 'Gestioná tus cocheras, vehículos y visitas'}
                            </p>
                        </div>
                    </div>

                    {/* ─ Mis Cocheras ─────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-slate-600" />
                            </div>
                            <h3 className="font-bold text-gray-800">Mis Cocheras</h3>
                        </div>
                        {myGarages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                                    <ParkingSquare className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-sm">Sin cocheras asignadas</p>
                                <p className="text-gray-400 text-xs mt-1">Comunicate con el administrador para asignar una.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {myGarages.map(g => (
                                    <div key={g.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            g.type === 'fija' ? 'bg-blue-100'
                                            : g.type === 'cortesia' ? 'bg-purple-100'
                                            : 'bg-amber-100'
                                        }`}>
                                            <ParkingSquare className={`w-4 h-4 ${
                                                g.type === 'fija' ? 'text-blue-600'
                                                : g.type === 'cortesia' ? 'text-purple-600'
                                                : 'text-amber-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-sm">{g.number}</p>
                                            {g.location && <p className="text-gray-400 text-xs truncate">{g.location}</p>}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                            g.type === 'fija' ? 'bg-blue-100 text-blue-700'
                                            : g.type === 'cortesia' ? 'bg-purple-100 text-purple-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {g.type === 'fija' ? 'Fija' : g.type === 'cortesia' ? 'Cortesía' : 'Visitante'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─ Acciones ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Mis Vehículos */}
                        <button
                            className="group text-left bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
                            onClick={() => setShowMyVehicles(true)}
                        >
                            <div className="w-12 h-12 bg-slate-100 group-hover:bg-slate-200 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                                <Car className="w-5 h-5 text-slate-600" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">Mis Vehículos</h4>
                            <p className="text-gray-500 text-sm mb-4">Registrá y gestioná los autos de tu unidad.</p>
                            <span className="inline-flex items-center gap-1 text-slate-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                Gestionar <ChevronRight className="w-4 h-4" />
                            </span>
                        </button>

                        {/* Cochera Visitante */}
                        <button
                            className="group text-left bg-white rounded-3xl border border-amber-100 shadow-sm p-6 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
                            onClick={() => setShowVisitorParking(true)}
                        >
                            <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                                <Car className="w-5 h-5 text-amber-600" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">Cochera Visitante</h4>
                            <p className="text-gray-500 text-sm mb-4">Reservá una cochera temporaria para tus visitas (máx. 48 h).</p>
                            <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                Reservar <ChevronRight className="w-4 h-4" />
                            </span>
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Layout de selección - Amenities a la izquierda, Horario a la derecha */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
                        {/* Columna izquierda - Selector de amenities */}
                        <SpaceSelector
                            spaces={amenities}
                            selectedSpace={selectedSpace}
                            onSpaceSelect={setSelectedSpace}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            getAmenityOccupancy={getAmenityOccupancy}
                            token={token}
                            fetchReservations={fetchReservations}
                        />

                        {/* Columna derecha - Selector de horario */}
                        <TimeSelector
                            selectedSpace={selectedSpace}
                            selectedTime={selectedTime}
                            selectedDate={selectedDate}
                            amenities={amenities}
                            reservations={reservations}
                            timeError={timeError}
                            getCurrentReservationCount={getCurrentReservationCount}
                            onTimeChange={(newTime) => {
                                const [start, end] = newTime.split(" - ");
                                const space = amenities.find(a => a.name === selectedSpace);
                                const maxDuration = space?.maxDuration || 60;

                                const [sh, sm] = start.split(":").map(Number);
                                const [eh, em] = end.split(":").map(Number);
                                const duration = (eh * 60 + em) - (sh * 60 + sm);

                                if (duration > maxDuration) {
                                    setTimeError(`⛔ La duración máxima para ${selectedSpace} es de ${maxDuration} minutos`);
                                    return;
                                }

                                setSelectedTime(newTime);
                                setTimeError(null);
                            }}
                            onDateChange={setSelectedDate}
                            onReserve={handleReserve}
                            isReserving={isReserving}
                        />
                    </div>

                    {/* Resumen de reservas del usuario - Ancho completo */}
                    <ReservationList
                        reservations={userReservations}
                        onCancelReservation={handleCancelReservation}
                        onRemoveFromView={handleRemoveFromView}
                        cancellingId={isCancelling}
                        hidingId={isHiding}
                    />

                </>
            )}

            {/* PANEL PERFIL (Derecha) */}
            <ProfilePanel
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
                userName={userData?.user.name || ""}
                onEditProfile={() => setShowEditPopup(true)}
                onChangePassword={() => setShowPasswordPopup(true)}
                onDeleteAccount={handleDeleteAccount}
                onLogout={handleLogout}
            />

            {/* POPUP EDITAR */}
            <EditProfileModal
                isVisible={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                newName={newName}
                onNameChange={setNewName}
                onSave={handleSaveName}
                isSaving={isSavingName}
            />

            {/* POPUP CAMBIAR CONTRASEÑA */}
            <ChangePasswordModal
                isVisible={showPasswordPopup}
                onClose={() => setShowPasswordPopup(false)}
                onSave={handleChangePassword}
            />

            {/* POPUP CONFIRMAR ELIMINACIÓN */}
            <DeleteAccountModal
                isVisible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                userName={userData?.user.name || ""}
                isDeleting={isDeletingAccount}
            />
            </div> {/* MAIN CONTENT CONTAINER */}

            {/* Cancel Reservation Modal */}
            <CancelReservationModal
                isVisible={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setReservationToCancel(null);
                }}
                onConfirm={handleConfirmCancelReservation}
                reservation={reservationToCancel}
                isCancelling={reservationToCancel ? isCancelling === reservationToCancel.id : false}
            />

            {/* Reservation Cancelled Toast */}
            <ReservationCancelledToast
                isVisible={showCancelToast}
                onComplete={() => setShowCancelToast(false)}
            />

            {/* Reservation Hidden Toast */}
            <ReservationHiddenToast
                isVisible={showHiddenToast}
                onComplete={() => setShowHiddenToast(false)}
            />

            {/* Reservation Success Toast */}
            <ReservationSuccessToast
                isVisible={showReservationToast}
                onComplete={() => {
                    setShowReservationToast(false);
                    setSuccessReservationData(null);
                }}
                amenityName={successReservationData?.amenityName}
                timeSlot={successReservationData?.timeSlot}
            />

            {/* Reservation Error Toast */}
            <ReservationErrorToast
                isVisible={showReservationErrorToast}
                onComplete={() => {
                    setShowReservationErrorToast(false);
                    setReservationErrorMessage(null);
                }}
                errorMessage={reservationErrorMessage || undefined}
            />

            {/* Logout Success Toast */}
            <LogoutSuccessToast
                isVisible={showSuccessToast}
                onComplete={handleLogoutComplete}
            />

            {/* Password Change Success Toast */}
            <PasswordChangeSuccessToast
                isVisible={showPasswordChangeToast}
                onComplete={handlePasswordChangeComplete}
            />
            
            {/* General Error Toast */}
            <ReservationErrorToast
                isVisible={showErrorToast}
                errorMessage={errorMessage}
                onComplete={() => {
                    setShowErrorToast(false);
                    setErrorMessage('');
                }}
            />

            {/* Notification Toasts */}
            <NotificationToastContainer
                toasts={toasts}
                onRemoveToast={removeToast}
            />

            {token && (
                <MyVehiclesModal
                    isOpen={showMyVehicles}
                    onClose={() => setShowMyVehicles(false)}
                    token={token}
                />
            )}

            {token && (
                <VisitorParkingModal
                    isOpen={showVisitorParking}
                    onClose={() => setShowVisitorParking(false)}
                    token={token}
                />
            )}

            </div>
        </GamificationProvider>
    );
}

export default TenantDashboard;
