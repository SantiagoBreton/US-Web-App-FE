import { useState, useEffect } from 'react';
import { X, AlertTriangle, Wrench, Droplets, Zap, Wind, Users, Building } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FormInput from './FormInput';
import { type Claim } from '../api_calls/claims';

interface CreateClaimModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (claimData: ClaimFormData) => void;
  editingClaim?: Claim | null;
  isSaving?: boolean;
}

interface ClaimFormData {
  subject: string;
  category: string;
  description: string;
  location: string;
  priority: string;
  isAnonymous: boolean;
}



const categoryOptions = [
  { value: 'ascensor', label: 'Ascensor', icon: Wrench, color: 'purple' },
  { value: 'plomeria', label: 'Plomería', icon: Droplets, color: 'blue' },
  { value: 'electricidad', label: 'Eléctrico', icon: Zap, color: 'yellow' },
  { value: 'temperatura', label: 'Calefacción/Aire', icon: Wind, color: 'green' },
  { value: 'areas_comunes', label: 'Áreas Comunes', icon: Users, color: 'indigo' },
  { value: 'edificio', label: 'Edificio', icon: Building, color: 'gray' },
  { value: 'otro', label: 'Otros', icon: AlertTriangle, color: 'orange' }
];

const priorityOptions = [
  { value: 'baja', label: 'Baja', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'media', label: 'Media', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-50 text-red-700 border-red-200' }
];

function CreateClaimModal({ isVisible, onClose, onSave, editingClaim, isSaving = false }: CreateClaimModalProps) {
  const [formData, setFormData] = useState<ClaimFormData>({
    subject: '',
    category: '',
    description: '',
    location: '',
    priority: 'medium',
    isAnonymous: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingClaim) {
      setFormData({
        subject: editingClaim.subject,
        category: editingClaim.category?.name || '',
        description: editingClaim.description,
        location: editingClaim.location,
        priority: editingClaim.priority?.name || '',
        isAnonymous: (editingClaim as any).isAnonymous || false
      });
    } else {
      setFormData({
        subject: '',
        category: '',
        description: '',
        location: '',
        priority: 'medium',
        isAnonymous: false
      });
    }
    setErrors({});
  }, [editingClaim, isVisible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      if (validateForm()) {
        console.log('Form validation passed, calling onSave');
        onSave(formData);
      } else {
        console.log('Form validation failed:', errors);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleChange = (field: keyof ClaimFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
      <AnimatePresence>
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingClaim ? 'Editar Reclamo' : 'Nuevo Reclamo'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingClaim ? 'Modifica los detalles del reclamo' : 'Reporta un problema o solicita mantenimiento'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              disabled={isSaving}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Subject */}
            <FormInput
              label="Asunto"
              type="text"
              value={formData.subject}
              onChange={(value) => handleChange('subject', value)}
              placeholder="Ej: Ascensor principal fuera de servicio"
              error={errors.subject}
              disabled={isSaving}
              required
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryOptions.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleChange('category', category.value)}
                      disabled={isSaving}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Location */}
            <FormInput
              label="Ubicación"
              type="text"
              value={formData.location}
              onChange={(value) => handleChange('location', value)}
              placeholder="Ej: Lobby principal - Ascensor A, Departamento 3B, Gimnasio"
              error={errors.location}
              disabled={isSaving}
              required
            />

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorityOptions.map((priority) => {
                  const isSelected = formData.priority === priority.value;
                  
                  return (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleChange('priority', priority.value)}
                      disabled={isSaving}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        isSelected
                          ? priority.color + ' border-current'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {priority.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <FormInput
                label="Descripción detallada"
                value={formData.description}
                onChange={(value) => handleChange('description', value.slice(0, 500))}
                rows={4}
                placeholder="Describe el problema con el mayor detalle posible. Incluye cuándo comenzó, síntomas específicos, etc."
                error={errors.description}
                disabled={isSaving}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {!errors.description && (
                  <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                )}
                <p className="text-sm text-gray-400 ml-auto">{formData.description.length}/500</p>
              </div>
            </div>

            {/* Anonymity Option */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => handleChange('isAnonymous', e.target.checked)}
                    disabled={isSaving}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Publicar como anónimo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Cuando esté marcado, tu nombre no será visible para otros usuarios. Los administradores siempre podrán ver quién creó el reclamo.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors cursor-pointer"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {isSaving ? 'Guardando...' : editingClaim ? 'Actualizar' : 'Crear Reclamo'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
    </>
  );
}

export default CreateClaimModal;