const API_URL = import.meta.env.VITE_API_URL as string;



export interface GamificationLevel {
  id: number;
  key: string;
  displayName: string;
  minPoints: number;
  maxPoints: number | null;
  order: number;
  icon: string;
  color: string;
  badgeImage: string | null;
}

export interface GamificationTheme {
  id: number;
  key: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  gradient: string | null;
  requiredLevelId: number;
  order: number;
  isActive: boolean;
}

export interface GamificationFrame {
  id: number;
  key: string;
  displayName: string;
  cssClass: string;
  animation: string | null;
  requiredLevelId: number;
  order: number;
  isActive: boolean;
}

export interface GamificationEffect {
  id: number;
  key: string;
  displayName: string;
  cssClass: string;
  animation: string | null;
  requiredLevelId: number;
  order: number;
  isActive: boolean;
}

export interface GamificationTitle {
  id: number;
  key: string;
  displayName: string;
  description: string | null;
  requiredLevelId: number;
  isActive: boolean;
}

export interface AchievementCategory {
  id: number;
  key: string;
  displayName: string;
  description: string | null;
  icon: string;
  color: string;
  order: number;
}

export interface AchievementRarity {
  id: number;
  key: string;
  displayName: string;
  color: string;
  glowEffect: string | null;
  order: number;
}

export interface Achievement {
  id: number;
  key: string;
  displayName: string;
  description: string;
  icon: string;
  categoryId: number;
  category: AchievementCategory;
  pointsReward: number;
  rarityId: number;
  rarity: AchievementRarity;
  requiredCount: number | null;
  requiredAction: string | null;
  isRepeatable: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  achievement: Achievement;
  unlockedAt: string;
  timesEarned: number;
}

export interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  action: string;
  description: string;
  reservationId: number | null;
  claimId: number | null;
  ratingId: number | null;
  createdAt: string;
}

export interface UserGamification {
  id: number;
  userId: number;
  totalPoints: number;
  levelId: number;
  level: GamificationLevel;
  selectedThemeId: number;
  selectedTheme: GamificationTheme;
  selectedFrameId: number;
  selectedFrame: GamificationFrame;
  selectedEffectId: number;
  selectedEffect: GamificationEffect;
  selectedTitleId: number | null;
  selectedTitle: GamificationTitle | null;
  customTitleText: string | null;
  reservationsCompleted: number;
  reservationsCancelled: number;
  ratingsGiven: number;
  claimsCreated: number;
  claimsResolved: number;
  claimsRejected: number;
  adhesionsGiven: number;
  adhesionsReceived: number;
  negativeAdhesions: number;
  consecutiveDays: number;
  lastLoginDate: string | null;
  createdAt: string;
  updatedAt: string;
  achievements: UserAchievement[];
  favoriteBadges: any[];
}

export interface LeaderboardEntry {
  id: number;
  userId: number;
  month: string;
  points: number;
  rank: number;
  levelId: number;
  level: GamificationLevel;
  createdAt: string;
}

export interface CustomizationOptions {
  themes: GamificationTheme[];
  frames: GamificationFrame[];
  effects: GamificationEffect[];
  titles: GamificationTitle[];
  currentLevel: GamificationLevel;
}


export async function getGamificationProfile(userId: number): Promise<UserGamification> {
  const res = await fetch(`${API_URL}/gamification/profile/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener perfil de gamificación");
  }

  return res.json();
}


export async function getLeaderboard(month?: string): Promise<LeaderboardEntry[]> {
  const url = month 
    ? `${API_URL}/gamification/leaderboard?month=${month}`
    : `${API_URL}/gamification/leaderboard`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener leaderboard");
  }

  return res.json();
}


export async function getAllAchievements(): Promise<Achievement[]> {
  const res = await fetch(`${API_URL}/gamification/achievements`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener achievements");
  }

  return res.json();
}


export async function getCustomizationOptions(userId: number): Promise<CustomizationOptions> {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API_URL}/gamification/customization/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener opciones de customización");
  }

  return res.json();
}


export async function updateCustomization(data: {
  themeId?: number;
  frameId?: number;
  effectId?: number;
  titleId?: number;
  customTitleText?: string;
}): Promise<UserGamification> {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API_URL}/gamification/customize`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar customización");
  }

  return res.json();
}


export async function getPointTransactions(
  userId: number,
  options?: { limit?: number; offset?: number }
): Promise<{
  transactions: PointTransaction[];
  total: number;
  limit: number;
  offset: number;
}> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const url = `${API_URL}/gamification/transactions/${userId}${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener transacciones");
  }

  return res.json();
}


export async function refreshAchievements(): Promise<{
  success: boolean;
  unlockedCount: number;
  unlockedAchievements: Array<Achievement & { timesEarned: number; isNew: boolean }>;
  totalPointsEarned: number;
  message: string;
}> {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API_URL}/gamification/refresh-achievements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al refrescar achievements");
  }

  return res.json();
}


export function formatPoints(points: number): string {
  return new Intl.NumberFormat('es-AR').format(points);
}


export function calculateLevelProgress(
  currentPoints: number,
  currentLevel: GamificationLevel
): { percentage: number; pointsToNext: number } {
  if (currentLevel.maxPoints === null) {
    
    return { percentage: 100, pointsToNext: 0 };
  }

  const pointsInLevel = currentPoints - currentLevel.minPoints;
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
  const percentage = Math.min((pointsInLevel / levelRange) * 100, 100);
  const pointsToNext = Math.max(currentLevel.maxPoints - currentPoints, 0);

  return { percentage, pointsToNext };
}
