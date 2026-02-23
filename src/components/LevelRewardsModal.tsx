import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Star, Crown, Lock, Check } from 'lucide-react';

interface LevelRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel?: number;
}

const levelRewards = [
  {
    level: 1,
    name: 'Nuevo Vecino',
    xpRequired: 0,
    rewards: [
      '1 tema de color (Predeterminado)',
      '1 marco de avatar (Sin Marco)',
      '1 efecto visual (Sin Efecto)',
      'Acceso al sistema de gamificación'
    ],
    icon: Star,
    color: 'from-orange-300 to-orange-500'
  },
  {
    level: 2,
    name: 'Buen Vecino',
    xpRequired: 200,
    rewards: [
      '2 temas nuevos (Atardecer, Océano)',
      '1 marco nuevo (Marco Plateado)',
      '1 efecto nuevo (Brillo)',
      'Desbloqueo de personalización'
    ],
    icon: Star,
    color: 'from-gray-300 to-gray-500'
  },
  {
    level: 3,
    name: 'Gran Vecino',
    xpRequired: 500,
    rewards: [
      '3 temas nuevos (Bosque, Lavanda, Medianoche)',
      '1 marco nuevo (Marco Dorado)',
      '1 efecto nuevo (Resplandor)',
      '1 título personalizable (Vecino Activo)'
    ],
    icon: Award,
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    level: 4,
    name: 'Vecino Ejemplar',
    xpRequired: 1000,
    rewards: [
      '3 temas nuevos (Rosa, Aurora, Neón)',
      '1 marco nuevo (Marco Platino)',
      '3 efectos nuevos (Chispa, Partículas, Holográfico)',
      '2 títulos nuevos (Guardián Comunitario, Organizador Estrella)'
    ],
    icon: Award,
    color: 'from-slate-300 to-slate-500'
  },
  {
    level: 5,
    name: 'Vecino VIP',
    xpRequired: 2000,
    rewards: [
      '1 tema exclusivo (Galaxia)',
      '2 marcos premium (Marco Diamante, Marco Legendario)',
      '2 efectos premium (Arcoíris, Estelas)',
      '5 títulos VIP (Leyenda Urbana, Embajador Vecinal, Maestro de Convivencia, Innovador Social)',
      'Título 100% personalizado'
    ],
    icon: Crown,
    color: 'from-cyan-400 to-blue-600'
  }
];

export default function LevelRewardsModal({ isOpen, onClose, currentLevel = 1 }: LevelRewardsModalProps) {
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Recompensas por Nivel</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Descubre qué desbloqueas al subir de nivel
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
              <div className="space-y-4">
                {levelRewards.map((levelData) => {
                  const Icon = levelData.icon;
                  const isUnlocked = currentLevel >= levelData.level;
                  const isCurrent = currentLevel === levelData.level;
                  
                  return (
                    <motion.div
                      key={levelData.level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: levelData.level * 0.1 }}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 shadow-lg shadow-blue-200'
                          : isUnlocked
                          ? 'border-green-300 bg-green-50/50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Level Header */}
                      <div className={`bg-gradient-to-r ${levelData.color} p-4 text-white relative`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isUnlocked ? 'bg-white/30' : 'bg-black/20'
                            }`}>
                              {isUnlocked ? (
                                <Icon className="w-6 h-6" />
                              ) : (
                                <Lock className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">
                                  Nivel {levelData.level}
                                </h3>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-medium">
                                    Nivel Actual
                                  </span>
                                )}
                                {isUnlocked && !isCurrent && (
                                  <Check className="w-5 h-5" />
                                )}
                              </div>
                              <p className="text-sm opacity-90">{levelData.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-75">XP Requerido</p>
                            <p className="text-lg font-bold">{levelData.xpRequired}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rewards List */}
                      <div className="p-4">
                        <h4 className={`text-sm font-semibold mb-3 ${
                          isUnlocked ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          Recompensas:
                        </h4>
                        <ul className="space-y-2">
                          {levelData.rewards.map((reward, index) => (
                            <li
                              key={index}
                              className={`flex items-start gap-2 text-sm ${
                                isUnlocked ? 'text-gray-700' : 'text-gray-500'
                              }`}
                            >
                              <div className={`mt-0.5 p-0.5 rounded-full ${
                                isUnlocked 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-300 text-gray-500'
                              }`}>
                                {isUnlocked ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                              </div>
                              <span className={isUnlocked ? '' : 'line-through'}>
                                {reward}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Progress indicator for next level */}
                      {!isUnlocked && levelData.level === currentLevel + 1 && (
                        <div className="px-4 pb-4">
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium">
                              📌 Próximo nivel a desbloquear
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                💡 Gana XP completando reservas, creando reclamos y participando en la comunidad
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
