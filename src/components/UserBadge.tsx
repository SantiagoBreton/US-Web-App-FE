import { Trophy } from 'lucide-react';

interface GamificationLevel {
  id: number;
  name: string;
  displayName: string;
  minPoints: number;
  maxPoints: number | null;
  order: number;
  icon: string;
  color: string;
}

interface GamificationTheme {
  id: number;
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  requiredLevelId: number;
}

interface GamificationFrame {
  id: number;
  name: string;
  displayName: string;
  cssClass: string;
  animation: string;
  requiredLevelId: number;
}

interface GamificationEffect {
  id: number;
  name: string;
  displayName: string;
  cssClass: string;
  animation: string;
  requiredLevelId: number;
}

interface UserGamification {
  totalPoints?: number | null;
  customTitle: string | null;
  level: GamificationLevel;
  selectedTheme: GamificationTheme | null;
  selectedFrame: GamificationFrame | null;
  selectedEffect: GamificationEffect | null;
}

interface UserBadgeProps {
  gamification: UserGamification | null | undefined;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showPoints?: boolean;
}

const formatPoints = (points: number | undefined | null): string => {
  if (!points && points !== 0) return '0';
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

export default function UserBadge({ 
  gamification, 
  userName, 
  size = 'md', 
  showName = true,
  showPoints = true 
}: UserBadgeProps) {
  if (!gamification) {
    // Por si queda un usuario sin gamification o antiguo, mostrar un badge genérico
    return (
      <div className="flex items-center gap-2">
        {showName && (
          <span className={`text-gray-700 font-medium ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          }`}>
            {userName}
          </span>
        )}
        <div className={`rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center ${
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
        }`}>
          <Trophy className={`text-gray-400 ${
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          }`} />
        </div>
      </div>
    );
  }

  const { level, selectedTheme, selectedFrame, selectedEffect, customTitle, totalPoints } = gamification;

  const themeGradient = selectedTheme?.gradient 
    || `linear-gradient(135deg, ${selectedTheme?.primaryColor || level.color}, ${selectedTheme?.secondaryColor || level.color})`;

  const frameClass = selectedFrame?.cssClass || '';
  const effectClass = selectedEffect?.cssClass || '';

  const sizeConfig = {
    sm: {
      container: 'px-3 py-1.5',
      circle: 'w-6 h-6',
      icon: 'w-4 h-4',
      levelText: 'text-xs',
      pointsText: 'text-[10px]'
    },
    md: {
      container: 'px-4 py-2',
      circle: 'w-8 h-8',
      icon: 'w-5 h-5',
      levelText: 'text-sm',
      pointsText: 'text-xs'
    },
    lg: {
      container: 'px-5 py-2.5',
      circle: 'w-10 h-10',
      icon: 'w-6 h-6',
      levelText: 'text-base',
      pointsText: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      {/* User Name and Custom Title */}
      {showName && (
        <div className="flex flex-col items-end">
          <span className={`font-medium text-gray-700 ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          }`}>
            {userName}
          </span>
          {customTitle && (
            <span 
              className={`font-semibold italic ${
                size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs'
              }`}
              style={{ 
                color: selectedTheme?.primaryColor || level.color,
                textShadow: `0 0 8px ${selectedTheme?.primaryColor || level.color}40`
              }}
            >
              "{customTitle}"
            </span>
          )}
        </div>
      )}

      {/* Gamification Badge - styled like GamificationBadge */}
      <div
        className={`flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg ${config.container} ${frameClass} ${effectClass}`}
        style={{ 
          background: themeGradient,
          borderColor: (selectedTheme?.primaryColor || level.color) + '60'
        }}
        title={`${level.displayName} - ${totalPoints || 0} puntos`}
      >
        {/* Level Icon Circle */}
        <div 
          className={`${config.circle} rounded-full flex items-center justify-center text-white shadow-lg`}
          style={{ backgroundColor: level.color }}
        >
          <Trophy className={config.icon} />
        </div>
        
        {/* Level Name and Points */}
        {showPoints && (
          <div className="flex flex-col items-start">
            <span className={`${config.levelText} font-semibold text-white drop-shadow-sm`}>
              {level.displayName}
            </span>
            <span className={`${config.pointsText} text-white/90 drop-shadow-sm`}>
              {formatPoints(totalPoints)} pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
