import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Crown, AlertTriangle, ChevronDown, UserCheck, User } from "lucide-react";
import { getAdminUsers, updateUserApartment, getAdminApartments, type AdminUser, type AdminApartment } from "../api_calls/admin";
import ClaimSuccessToast from './ClaimSuccessToast';
import ClaimErrorToast from './ClaimErrorToast';
import GenericFilterModal, { type FilterOption } from "./GenericFilterModal";

const getReservationCount = (user: AdminUser): number => {
    return user._count?.reservations ?? user.reservationCount ?? 0;
};

interface UserManagementProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    currentUserEmail?: string;
}

function UserManagement({ isOpen, onClose, token, currentUserEmail }: UserManagementProps) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [apartments, setApartments] = useState<AdminApartment[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    
    const [showRoleFilter, setShowRoleFilter] = useState(false);
    
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const roleFilterOptions: FilterOption[] = [
        {
            value: "all",
            label: "Todos los roles",
            description: "Mostrar usuarios con todos los roles",
            icon: Users
        },
        {
            value: "admin",
            label: "Administradores",
            description: "Usuarios con permisos de administración",
            icon: UserCheck
        },
        {
            value: "tenant",
            label: "Inquilinos",
            description: "Usuarios inquilinos de apartamentos",
            icon: User
        }
    ];

    useEffect(() => {
        if (isOpen && token) {
            loadUsers();
            loadApartments();
        }
    }, [isOpen, token]);

    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterRole !== "all") {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, filterRole]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersData = await getAdminUsers(token);
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            } else {
                console.error("Users data is not an array:", usersData);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error loading users:", error);
            setUsers([]);
            console.warn("Failed to load users, showing empty list");
        } finally {
            setLoading(false);
        }
    };

    const loadApartments = async () => {
        try {
            const apartmentsData = await getAdminApartments(token);
            if (Array.isArray(apartmentsData)) {
                setApartments(apartmentsData);
            } else {
                console.error("Apartments data is not an array:", apartmentsData);
                setApartments([]);
            }
        } catch (error) {
            console.error("Error loading apartments:", error);
            setApartments([]);
        }
    };

    const handleApartmentChange = async (userId: number, newApartmentId: number | null) => {
        const selectedApartment = apartments.find(apt => apt.id === newApartmentId);
        const apartmentName = selectedApartment ? `${selectedApartment.unit} (Piso ${selectedApartment.floor})` : "sin apartamento";
        
        if (!confirm(`¿Estás seguro de mover este usuario a ${apartmentName}?`)) {
            return;
        }

        setUpdatingUserId(userId);
        try {
            const updatedUser = await updateUserApartment(token, userId, newApartmentId);
            
            setUsers(prev => prev.map(user => 
                user.id === userId ? { 
                    ...user, 
                    apartmentId: updatedUser.apartmentId,
                    apartment: updatedUser.apartment 
                } : user
            ));
            
            setToastMessage("Apartamento actualizado exitosamente");
            setShowSuccessToast(true);
        } catch (error) {
            console.error("Error updating apartment:", error);
            setErrorMessage("Error al actualizar apartamento: " + (error instanceof Error ? error.message : "Error desconocido"));
            setShowErrorToast(true);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin": return <Crown className="w-4 h-4 text-yellow-500" />;
            case "tenant": return <Users className="w-4 h-4 text-green-500" />;
            default: return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "tenant": return "bg-green-100 text-green-800 border-green-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] mx-4 overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Role Filter Button */}
                        <button
                            onClick={() => setShowRoleFilter(true)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center gap-2 bg-white"
                        >
                            {roleFilterOptions.find(option => option.value === filterRole)?.label || 'Todos los roles'}
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Users List */}
                    <div className="flex-1 overflow-y-auto scrollbar-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 mb-1">{user.email}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Reservas: {getReservationCount(user)}</span>
                                                    {user.apartment && (
                                                        <span>Apt: {user.apartment.unit} {user.apartment.floor ? `(Piso ${user.apartment.floor})` : ''}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {currentUserEmail === user.email ? (
                                                    // Si es el usuario actual, mostrar badge sin posibilidad de edición
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                                        <span className="text-sm text-gray-600 font-medium">Tu cuenta</span>
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                            {getRoleIcon(user.role)}
                                                            {user.role === 'admin' ? 'Administrador' : 'Inquilino'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Para otros usuarios, mostrar selector de apartamento
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                            {getRoleIcon(user.role)}
                                                            {user.role === 'admin' ? 'Administrador' : 'Inquilino'}
                                                        </div>
                                                        <select
                                                            value={user.apartmentId || ""}
                                                            onChange={(e) => handleApartmentChange(user.id, e.target.value ? parseInt(e.target.value) : null)}
                                                            disabled={updatingUserId === user.id}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 cursor-pointer text-sm"
                                                        >
                                                            <option value="">Sin apartamento</option>
                                                            {apartments.map(apt => (
                                                                <option key={apt.id} value={apt.id}>
                                                                    {apt.unit} - Piso {apt.floor} ({apt.rooms} hab.)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                
                                                {updatingUserId === user.id && (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {filteredUsers.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
                                        <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.length : 0}</div>
                                <div className="text-sm text-gray-500">Total Usuarios</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}</div>
                                <div className="text-sm text-gray-500">Administradores</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{Array.isArray(users) ? users.filter(u => u.role === 'tenant').length : 0}</div>
                                <div className="text-sm text-gray-500">Inquilinos</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Role Filter Modal */}
            <GenericFilterModal
                isVisible={showRoleFilter}
                onClose={() => setShowRoleFilter(false)}
                title="Filtrar por Rol"
                options={roleFilterOptions}
                selectedValue={filterRole}
                onValueSelect={(value: string) => {
                    setFilterRole(value);
                    setShowRoleFilter(false);
                }}
                headerIcon={Users}
                headerIconColor="text-blue-600"
                maxWidth="2xl"
            />

            {/* Success Toast */}
            <ClaimSuccessToast
                isVisible={showSuccessToast}
                onComplete={() => setShowSuccessToast(false)}
                action="updated"
                claimSubject={toastMessage}
            />

            {/* Error Toast */}
            <ClaimErrorToast
                isVisible={showErrorToast}
                onComplete={() => setShowErrorToast(false)}
                errorMessage={errorMessage}
            />
        </AnimatePresence>
    );
}

export default UserManagement;