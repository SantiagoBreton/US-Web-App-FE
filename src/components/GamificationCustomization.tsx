import { useState, useEffect } from "react";
import { Palette, Frame, Sparkles, Award, Check, Loader2 } from "lucide-react";
import { getCustomizationOptions, updateCustomization, type CustomizationOptions } from "../api_calls/gamification";
import { useGamification } from "../contexts/GamificationContext";

interface GamificationCustomizationProps {
  userId: number;
}

type TabType = 'themes' | 'frames' | 'effects' | 'titles';

export default function GamificationCustomization({ userId }: GamificationCustomizationProps) {
  const { profile, refreshProfile } = useGamification();
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [options, setOptions] = useState<CustomizationOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => {
    loadOptions();
  }, [userId]);

  useEffect(() => {
    if (profile?.customTitleText) {
      setCustomTitle(profile.customTitleText);
    }
  }, [profile]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomizationOptions(userId);
      setOptions(data);
      // All items returned by API are unlocked for the user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar opciones");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = async (themeId: number) => {
    if (saving) return;
    try {
      setSaving(true);
      setError(null);
      await updateCustomization({ themeId });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar tema");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFrame = async (frameId: number) => {
    if (saving) return;
    try {
      setSaving(true);
      setError(null);
      await updateCustomization({ frameId });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar marco");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectEffect = async (effectId: number) => {
    if (saving) return;
    try {
      setSaving(true);
      setError(null);
      await updateCustomization({ effectId });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar efecto");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTitle = async (titleId: number) => {
    if (saving) return;
    try {
      setSaving(true);
      setError(null);
      await updateCustomization({ titleId });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar título");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomTitle = async () => {
    if (saving || !customTitle.trim()) return;
    try {
      setSaving(true);
      setError(null);
      await updateCustomization({ customTitleText: customTitle });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar título personalizado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadOptions}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!options || !profile) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'themes', label: 'Temas', icon: <Palette className="w-4 h-4" /> },
    { id: 'frames', label: 'Marcos', icon: <Frame className="w-4 h-4" /> },
    { id: 'effects', label: 'Efectos', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'titles', label: 'Títulos', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Personalización
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nivel actual: <span className="font-semibold" style={{ color: profile.level.color }}>{profile.level.displayName}</span>
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* THEMES TAB */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.themes.map((theme) => {
            const isSelected = profile.selectedThemeId === theme.id;
            
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                disabled={saving}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div 
                  className="h-20 rounded-lg mb-3"
                  style={{
                    background: theme.gradient || `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{theme.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Desbloqueado</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* FRAMES TAB */}
      {activeTab === 'frames' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.frames.map((frame) => {
            const isSelected = profile.selectedFrameId === frame.id;
            
            return (
              <button
                key={frame.id}
                onClick={() => handleSelectFrame(frame.id)}
                disabled={saving}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 ${frame.cssClass}`} />
                  {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{frame.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desbloqueado</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* EFFECTS TAB */}
      {activeTab === 'effects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.effects.map((effect) => {
            const isSelected = profile.selectedEffectId === effect.id;
            
            return (
              <button
                key={effect.id}
                onClick={() => handleSelectEffect(effect.id)}
                disabled={saving}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 ${effect.cssClass}`}>
                    <Sparkles className="w-8 h-8 text-white m-auto mt-4" />
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{effect.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desbloqueado</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TITLES TAB */}
      {activeTab === 'titles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {options.titles.map((title) => {
              const isSelected = profile.selectedTitleId === title.id;
              const isCustomTitle = title.key === 'custom';
              
              return (
                <div key={title.id}>
                  <button
                    onClick={() => handleSelectTitle(title.id)}
                    disabled={saving}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{title.displayName}</p>
                        {title.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Desbloqueado</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                      </div>
                    </div>
                  </button>

                  {isCustomTitle && isSelected && (                    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título Personalizado (máx. 30 caracteres)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value.slice(0, 30))}
                          maxLength={30}
                          placeholder="Mi título personalizado"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleUpdateCustomTitle}
                          disabled={saving || !customTitle.trim()}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {customTitle.length}/30 caracteres
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {saving && (
        <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Guardando cambios...</span>
        </div>
      )}
    </div>
  );
}
