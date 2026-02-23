import { useState } from "react";
import { useGamification } from "../contexts/GamificationContext";
import { Info } from "lucide-react";
import LevelRewardsModal from "./LevelRewardsModal";

interface WelcomeSectionProps {
  userName: string;
}

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  const { profile } = useGamification();
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  return (
    <>
    <div className="mb-12 relative overflow-hidden">
      <div 
        className={`rounded-3xl p-8 shadow-2xl border ${profile?.selectedFrame.cssClass || ''} ${profile?.selectedEffect.cssClass || ''}`}
        style={{
          background: profile?.selectedTheme.gradient 
            || (profile ? `linear-gradient(135deg, ${profile.selectedTheme.primaryColor}, ${profile.selectedTheme.secondaryColor})` : 'linear-gradient(to br, #111827, #1f2937, #374151)'),
          borderColor: profile?.selectedTheme.primaryColor + '40' || 'rgba(229, 231, 235, 1)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Hola, {userName}!
              </h1>
              {profile?.selectedTitle && (
                <p className="text-white/95 text-lg font-medium mb-1">
                  {profile.selectedTitle.key === 'custom' && profile.customTitleText 
                    ? profile.customTitleText 
                    : profile.selectedTitle.displayName}
                </p>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-lg">Sistema activo</span>
              </div>
            </div>
          </div>
          
          {/* Level Rewards Button */}
          {profile && (
            <button
              onClick={() => setShowRewardsModal(true)}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 transition-all flex items-center gap-2 group"
            >
              <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Ver Recompensas por Nivel</span>
            </button>
          )}
        </div>
      </div>
    </div>
    
    <LevelRewardsModal
      isOpen={showRewardsModal}
      onClose={() => setShowRewardsModal(false)}
      currentLevel={profile?.level.id || 1}
    />
    </>
  );
}
