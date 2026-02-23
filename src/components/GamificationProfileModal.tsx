import { X, Trophy, Star, TrendingUp, Award, Calendar, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useGamification } from "../contexts/GamificationContext";
import { formatPoints, calculateLevelProgress, refreshAchievements } from "../api_calls/gamification";
import GamificationCustomization from "./GamificationCustomization";
import LevelRewardsModal from "./LevelRewardsModal";
import AchievementsModal from "./AchievementsModal";

interface GamificationProfileModalProps {
  onClose: () => void;
}

export default function GamificationProfileModal({ onClose }: GamificationProfileModalProps) {
  const { profile, loading, refreshProfile } = useGamification();
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefreshAchievements = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    
    try {
      const result = await refreshAchievements();
      setRefreshMessage(result.message);
      
      // Refrescar el perfil para mostrar los nuevos achievements
      await refreshProfile();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setRefreshMessage(null), 5000);
    } catch (error) {
      console.error("Error refrescando achievements:", error);
      setRefreshMessage("Error al verificar logros");
      setTimeout(() => setRefreshMessage(null), 5000);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const levelProgress = calculateLevelProgress(profile.totalPoints, profile.level);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER STICKY */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div 
            className={`rounded-xl p-6 text-white ${profile.selectedFrame.cssClass} ${profile.selectedEffect.cssClass}`}
            style={{ 
              background: profile.selectedTheme.gradient 
                || `linear-gradient(135deg, ${profile.selectedTheme.primaryColor}, ${profile.selectedTheme.secondaryColor})`
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: profile.level.color }}
              >
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{profile.level.displayName}</h3>
                {profile.selectedTitle && (
                  <p className="text-white/95 text-sm font-medium">
                    {profile.selectedTitle.key === 'custom' && profile.customTitleText 
                      ? profile.customTitleText 
                      : profile.selectedTitle.displayName}
                  </p>
                )}
                <p className="text-white/90">{formatPoints(profile.totalPoints)} puntos</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso al siguiente nivel</span>
                <span>{levelProgress.pointsToNext} pts restantes</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${levelProgress.percentage}%` }}
                />
              </div>
            </div>
            
            {/* Rewards Button */}
            <button
              onClick={() => setShowRewardsModal(true)}
              className="mt-4 w-full px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg border border-white/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Ver Recompensas por Nivel</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="Días consecutivos"
              value={profile.consecutiveDays}
              color="blue"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Reservas completadas"
              value={profile.reservationsCompleted}
              color="green"
            />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="Calificaciones"
              value={profile.ratingsGiven}
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Reclamos creados"
              value={profile.claimsCreated}
              color="purple"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5" />
                Logros Desbloqueados ({profile.achievements.length})
              </h3>
              
              {/* Refresh Achievements Button */}
              <button
                onClick={handleRefreshAchievements}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Verificando...' : 'Verificar Logros'}
              </button>
            </div>
            
            {/* Refresh Message */}
            {refreshMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                refreshMessage.includes('Error') 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              }`}>
                {refreshMessage}
              </div>
            )}
            
            {profile.achievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aún no has desbloqueado ningún logro. ¡Sigue participando!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.achievements.slice(0, 6).map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: ua.achievement.rarity.color + '20',
                        border: `2px solid ${ua.achievement.rarity.color}`
                      }}
                    >
                      {ua.achievement.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {ua.achievement.displayName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {ua.achievement.description}
                      </p>
                      {ua.timesEarned > 1 && (
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          x{ua.timesEarned}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Ver Todos los Logros Button */}
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 group shadow-md"
            >
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Ver Todos los Logros</span>
            </button>
          </div>

          {/* CUSTOMIZATION SECTION */}
          <GamificationCustomization userId={profile.userId} />

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              Cómo Ganar Puntos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PointAction icon="✅" action="Completar reserva" points="+50" positive />
              <PointAction icon="⭐" action="Dar calificación" points="+30" positive />
              <PointAction icon="📝" action="Crear reclamo" points="+20" positive />
              <PointAction icon="✔️" action="Reclamo resuelto" points="+40" positive />
              <PointAction icon="👍" action="Dar adhesión" points="+5" positive />
              <PointAction icon="🎯" action="Recibir adhesión positiva" points="+10" positive />
              <PointAction icon="📅" action="Login diario" points="+10" positive />
              <PointAction icon="🔥" action="7 días consecutivos" points="+50" positive />
              <PointAction icon="❌" action="Cancelar reserva" points="-10" positive={false} />
              <PointAction icon="❌" action="Reclamo rechazado" points="-5" positive={false} />
              <PointAction icon="👎" action="Adhesión negativa" points="-5" positive={false} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Level Rewards Modal */}
      <LevelRewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        currentLevel={profile.level.id}
      />
      
      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        unlockedAchievements={profile.achievements.map(ua => ua.achievement.key)}
      />
    </div>
  );
}

interface PointActionProps {
  icon: string;
  action: string;
  points: string;
  positive: boolean;
}

function PointAction({ icon, action, points, positive }: PointActionProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{action}</p>
      </div>
      <span className={`text-sm font-bold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {points}
      </span>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
