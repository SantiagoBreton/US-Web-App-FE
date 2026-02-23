import { Trophy } from "lucide-react";
import { useGamification } from "../contexts/GamificationContext";
import { formatPoints } from "../api_calls/gamification";

interface GamificationBadgeProps {
  onClick?: () => void;
}

export default function GamificationBadge({ onClick }: GamificationBadgeProps) {
  const { profile, loading } = useGamification();

  if (loading || !profile) {
    return null;
  }

  const themeGradient = profile.selectedTheme.gradient 
    || `linear-gradient(135deg, ${profile.selectedTheme.primaryColor}, ${profile.selectedTheme.secondaryColor})`;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg ${profile.selectedFrame.cssClass} ${profile.selectedEffect.cssClass}`}
      style={{ 
        background: themeGradient,
        borderColor: profile.selectedTheme.primaryColor + '60'
      }}
    >
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
        style={{ backgroundColor: profile.level.color }}
      >
        <Trophy className="w-3.5 h-3.5" />
      </div>
      
      <div className="flex flex-col items-start">
        <span className="text-xs font-semibold text-white drop-shadow-sm">
          {profile.level.displayName}
        </span>
        <span className="text-[10px] text-white/90 drop-shadow-sm">
          {formatPoints(profile.totalPoints)} pts
        </span>
      </div>
    </button>
  );
}
