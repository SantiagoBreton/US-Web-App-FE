import { User, LogOut, Settings, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmModal from "./LogoutConfirmModal";
import LogoutSuccessToast from "./LogoutSuccessToast";
import NotificationBell, { type Notification } from "./NotificationBell";
import UserNotificationBell from "./UserNotificationBell";
import GamificationBadge from "./GamificationBadge";
import GamificationProfileModal from "./GamificationProfileModal";
import type { UserNotification } from "../hooks/useUserNotifications";
import logoUs from '../assets/Logo_Us_2.png';

interface HeaderProps {
    userName: string;
    onProfileClick: () => void;
    showProfileMenu?: boolean;
    onLogout?: () => void;
    onClaimsClick?: () => void;
    onDashboardClick?: () => void;
    onCocherasClick?: () => void;
    activeTab?: 'dashboard' | 'reclamos' | 'cocheras';
    showClaimsTab?: boolean;
    showAmenitiesTab?: boolean;
    showCocherasTab?: boolean;
    showGamification?: boolean;
    notifications?: Notification[];
    onMarkNotificationAsRead?: (notificationId: string) => void;
    onMarkAllNotificationsAsRead?: () => void;
    onNotificationClick?: (notification: Notification) => void;
    onNotificationsClick?: () => void;
    showNotifications?: boolean;
    userNotifications?: UserNotification[];
    userUnreadCount?: number;
    onMarkUserNotificationAsRead?: (notificationId: string) => void;
    onMarkAllUserNotificationsAsRead?: () => void;
    onDeleteUserNotification?: (notificationId: string) => void;
    onUserNotificationClick?: (notification: UserNotification) => void;
}

function Header({ 
    userName,
    onProfileClick, 
    showProfileMenu = true, 
    onLogout, 
    onClaimsClick, 
    onDashboardClick, 
    onCocherasClick,
    activeTab = 'dashboard', 
    showClaimsTab = true, 
    showAmenitiesTab = true,
    showCocherasTab = true,
    showGamification = true,
    notifications = [],
    onMarkNotificationAsRead,
    onMarkAllNotificationsAsRead,
    onNotificationClick,
    onNotificationsClick,
    showNotifications = false,
    userNotifications = [],
    userUnreadCount = 0,
    onMarkUserNotificationAsRead,
    onMarkAllUserNotificationsAsRead,
    onDeleteUserNotification,
    onUserNotificationClick
}: HeaderProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showGamificationModal, setShowGamificationModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowLogoutModal(true);
        setIsMenuOpen(false);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        if (onLogout) onLogout();
        
        setShowSuccessToast(true);
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleLogoutComplete = () => {
        setShowSuccessToast(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logoUs}
                            alt="Logo US"
                            className="w-10 h-10 object-contain"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900">US</h1>
                            <span className="text-xs text-gray-500 -mt-1">Gestión de Consorcio</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <button 
                            onClick={onDashboardClick}
                            className={`font-medium transition-colors cursor-pointer ${
                                activeTab === 'dashboard' 
                                    ? 'text-gray-900 font-semibold' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Reservas
                        </button>
                        {showClaimsTab && (
                            <button 
                                onClick={onClaimsClick}
                                className={`font-medium transition-colors cursor-pointer ${
                                    activeTab === 'reclamos' 
                                        ? 'text-gray-900 font-semibold' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Reclamos
                            </button>
                        )}
                        {showCocherasTab && (
                        <button 
                            onClick={onCocherasClick}
                            className={`font-medium transition-colors cursor-pointer ${
                                activeTab === 'cocheras' 
                                    ? 'text-gray-900 font-semibold' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cocheras
                        </button>
                        )}
                    
                    </nav>

                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        {showGamification && (
                            <GamificationBadge 
                                onClick={() => setShowGamificationModal(true)} 
                            />
                        )}
                        
                        {showNotifications && (
                            <NotificationBell
                                notifications={notifications}
                                onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                                onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                                onNotificationClick={onNotificationClick || (() => {})}
                                onNotificationsClick={onNotificationsClick}
                            />
                        )}

                        {userNotifications.length > 0 || userUnreadCount > 0 ? (
                            <UserNotificationBell
                                notifications={userNotifications}
                                unreadCount={userUnreadCount}
                                onMarkAsRead={onMarkUserNotificationAsRead || (() => {})}
                                onMarkAllAsRead={onMarkAllUserNotificationsAsRead || (() => {})}
                                onDeleteNotification={onDeleteUserNotification || (() => {})}
                                onNotificationClick={onUserNotificationClick || (() => {})}
                            />
                        ) : null}

                        {showProfileMenu && (
                            <div className="relative hidden md:block" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">
                                            {userName}
                                        </p>

                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 rounded-full flex items-center justify-center group-hover:from-gray-500 group-hover:via-gray-600 group-hover:to-gray-800 transition-all">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                        onClick={() => {
                                            onProfileClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Configuración</span>
                                    </button>
                                    
                                    <hr className="my-1 border-gray-200" />
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-2 space-y-1">
                        <button 
                            onClick={() => {
                                onDashboardClick?.();
                                setIsMobileMenuOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                                activeTab === 'dashboard' 
                                    ? 'text-gray-900 bg-gray-100 font-semibold' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Dashboard
                        </button>
                        {showClaimsTab && (
                            <button 
                                onClick={() => {
                                    onClaimsClick?.();
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                                    activeTab === 'reclamos' 
                                        ? 'text-gray-900 bg-gray-100 font-semibold' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                Reclamos
                            </button>
                        )}
                        {showCocherasTab && (
                        <button 
                            onClick={() => {
                                onCocherasClick?.();
                                setIsMobileMenuOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                                activeTab === 'cocheras' 
                                    ? 'text-gray-900 bg-gray-100 font-semibold' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Cocheras
                        </button>
                        )}
                        {showAmenitiesTab && (
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block w-full text-left px-3 py-2 rounded-lg font-medium text-gray-400 cursor-not-allowed"
                            >
                                Amenities
                            </button>
                        )}
                        
                        {/* Mobile User Menu */}
                        {showProfileMenu && (
                            <>
                                <hr className="my-2 border-gray-200" />
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-gray-900 mb-2">{userName}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        onProfileClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Configuración</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Cerrar sesión</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isVisible={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
            
            {/* Logout Success Toast */}
            <LogoutSuccessToast
                isVisible={showSuccessToast}
                onComplete={handleLogoutComplete}
            />
            
            {showGamificationModal && (
                <GamificationProfileModal 
                    onClose={() => setShowGamificationModal(false)} 
                />
            )}
        </header>
    );
}

export default Header;