import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getGamificationProfile, type UserGamification } from '../api_calls/gamification';

interface GamificationContextType {
  profile: UserGamification | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
  userId: number;
}

export function GamificationProvider({ children, userId }: GamificationProviderProps) {
  const [profile, setProfile] = useState<UserGamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getGamificationProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading gamification profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <GamificationContext.Provider value={{ profile, loading, error, refreshProfile }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
