import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Calendar, Star, MessageSquare, Users, CheckCircle } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedAchievements?: string[]; 
}

const achievementCategories = [
  {
    id: 'reservations',
    name: 'Reservas',
    icon: Calendar,
    color: 'from-blue-400 to-blue-600',
    achievements: [
      {
        key: 'first_reservation',
        name: 'Primera Reserva',
        description: 'Completaste tu primera reserva',
        icon: '🎯',
        points: 25,
        rarity: 'common',
        requirement: '1 reserva completada'
      },
      {
        key: 'reservation_streak_5',
        name: '5 Sin Cancelar',
        description: 'Completaste 5 reservas',
        icon: '🔥',
        points: 50,
        rarity: 'rare',
        requirement: '5 reservas completadas'
      },
      {
        key: 'reservation_master_50',
        name: 'Maestro de Reservas',
        description: 'Completaste 50 reservas',
        icon: '🏅',
        points: 100,
        rarity: 'epic',
        requirement: '50 reservas completadas'
      }
    ]
  },
  {
    id: 'ratings',
    name: 'Calificaciones',
    icon: Star,
    color: 'from-yellow-400 to-orange-500',
    achievements: [
      {
        key: 'first_rating',
        name: 'Primera Calificación',
        description: 'Dejaste tu primera calificación',
        icon: '⭐',
        points: 15,
        rarity: 'common',
        requirement: '1 calificación dada'
      },
      {
        key: 'rating_master_10',
        name: 'Crítico Experto',
        description: 'Dejaste 10 calificaciones',
        icon: '🌟',
        points: 75,
        rarity: 'rare',
        requirement: '10 calificaciones dadas'
      },
      {
        key: 'helpful_reviewer',
        name: 'Reseñas Útiles',
        description: 'Dejaste 5 comentarios constructivos',
        icon: '📝',
        points: 60,
        rarity: 'rare',
        requirement: '5 comentarios con más de 20 caracteres'
      }
    ]
  },
  {
    id: 'claims',
    name: 'Reclamos',
    icon: MessageSquare,
    color: 'from-red-400 to-red-600',
    achievements: [
      {
        key: 'first_claim',
        name: 'Primer Reclamo',
        description: 'Creaste tu primer reclamo',
        icon: '📢',
        points: 15,
        rarity: 'common',
        requirement: '1 reclamo creado'
      },
      {
        key: 'problem_solver_5',
        name: 'Solucionador',
        description: 'Tuviste 5 reclamos resueltos',
        icon: '🛠️',
        points: 100,
        rarity: 'epic',
        requirement: '5 reclamos resueltos'
      },
      {
        key: 'community_voice',
        name: 'Voz de la Comunidad',
        description: 'Diste 20 adhesiones a reclamos',
        icon: '🗣️',
        points: 60,
        rarity: 'rare',
        requirement: '20 adhesiones dadas'
      }
    ]
  },
  {
    id: 'social',
    name: 'Social',
    icon: Users,
    color: 'from-green-400 to-green-600',
    achievements: [
      {
        key: 'perfect_week',
        name: 'Semana Perfecta',
        description: 'Entraste 7 días consecutivos',
        icon: '📅',
        points: 50,
        rarity: 'rare',
        requirement: '7 días consecutivos de actividad',
        repeatable: true
      },
      {
        key: 'veteran',
        name: 'Veterano',
        description: 'Llevas 1 año en la app',
        icon: '🎖️',
        points: 200,
        rarity: 'legendary',
        requirement: '365 días desde el registro'
      },
      {
        key: 'pioneer',
        name: 'Pionero',
        description: 'Entre los primeros 50 usuarios',
        icon: '🚀',
        points: 100,
        rarity: 'epic',
        requirement: 'Usuario #1-50'
      }
    ]
  }
];

const rarityColors = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
};

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario'
};

export default function AchievementsModal({ isOpen, onClose, unlockedAchievements = [] }: AchievementsModalProps) {
  const totalAchievements = achievementCategories.reduce((acc, cat) => acc + cat.achievements.length, 0);
  const unlockedCount = unlockedAchievements.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Logros Disponibles</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      {unlockedCount} de {totalAchievements} logros desbloqueados
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
              <div className="space-y-6">
                {achievementCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  const categoryUnlocked = category.achievements.filter(a => 
                    unlockedAchievements.includes(a.key)
                  ).length;
                  
                  return (
                    <div key={category.id} className="space-y-3">
                      {/* Category Header */}
                      <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${category.color} text-white`}>
                        <CategoryIcon className="w-5 h-5" />
                        <h3 className="text-lg font-bold">{category.name}</h3>
                        <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                          {categoryUnlocked}/{category.achievements.length}
                        </span>
                      </div>

                      {/* Achievements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.achievements.map((achievement) => {
                          const isUnlocked = unlockedAchievements.includes(achievement.key);
                          
                          return (
                            <motion.div
                              key={achievement.key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                                isUnlocked
                                  ? 'border-green-300 bg-green-50/50 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 opacity-75'
                              }`}
                            >
                              {/* Achievement Icon & Status */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-4xl">{achievement.icon}</div>
                                {isUnlocked && (
                                  <div className="p-1 bg-green-500 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Achievement Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {achievement.name}
                                  </h4>
                                  {achievement.repeatable && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                      Repetible
                                    </span>
                                  )}
                                </div>
                                
                                <p className={`text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                                  {achievement.description}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                    rarityColors[achievement.rarity as keyof typeof rarityColors]
                                  }`}>
                                    {rarityLabels[achievement.rarity as keyof typeof rarityLabels]}
                                  </span>
                                  <span className="text-sm font-bold text-yellow-600">
                                    +{achievement.points} pts
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Requisito:</span> {achievement.requirement}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <p>💡 Completa logros para ganar puntos de experiencia y subir de nivel</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-xs">Común</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-xs">Raro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-xs">Épico</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-xs">Legendario</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
