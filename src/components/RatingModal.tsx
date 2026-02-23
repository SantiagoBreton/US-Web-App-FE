import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, AlertCircle } from 'lucide-react';
import { createRating, getUserRatingForAmenity, updateRating } from '../api_calls/ratings';
import type { RatingData } from '../api_calls/ratings';
import { LoadingButton } from './LoadingSpinner';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    amenityId: number;
    amenityName: string;
    onSuccess: () => void;
}

const SUBCATEGORY_LABELS = {
    cleanliness: 'Limpieza',
    equipment: 'Estado del equipamiento',
    comfort: 'Comodidad',
    compliance: 'Cumplimiento de normas'
};

export default function RatingModal({
    isOpen,
    onClose,
    amenityId,
    amenityName,
    onSuccess
}: RatingModalProps) {
    const [cleanliness, setCleanliness] = useState<number>(0);
    const [equipment, setEquipment] = useState<number>(0);
    const [comfort, setComfort] = useState<number>(0);
    const [compliance, setCompliance] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingRating, setExistingRating] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadExistingRating = async () => {
            if (!isOpen) return;
            
            setIsLoading(true);
            setError(null);
            try {
                const rating = await getUserRatingForAmenity(amenityId);
                if (rating) {
                    setExistingRating(rating);
                    setCleanliness(rating.cleanliness || 0);
                    setEquipment(rating.equipment || 0);
                    setComfort(rating.comfort || 0);
                    setCompliance(rating.compliance || 0);
                    setComment(rating.comment || '');
                    setIsEditing(false);
                } else {
                    setExistingRating(null);
                    setIsEditing(true);
                }
            } catch (err) {
                console.error('Error loading existing rating:', err);
                setExistingRating(null);
                setIsEditing(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadExistingRating();
    }, [isOpen, amenityId]);

    const handleSubmit = async () => {
        const ratedCategories = [cleanliness, equipment, comfort, compliance].filter(r => r > 0);
        
        if (ratedCategories.length === 0) {
            setError('Debes calificar al menos una categoría');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const data: RatingData = {
                amenityId,
                ...(cleanliness > 0 && { cleanliness }),
                ...(equipment > 0 && { equipment }),
                ...(comfort > 0 && { comfort }),
                ...(compliance > 0 && { compliance }),
                ...(comment.trim() && { comment: comment.trim() })
            };

            if (existingRating) {
                await updateRating(data);
            } else {
                await createRating(data);
            }
            
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al enviar calificación');
        } finally {
            setIsSubmitting(false);
        }
    };

    const RatingStars = ({ 
        value, 
        onChange 
    }: { 
        value: number; 
        onChange: (val: number) => void;
    }) => (
        <div className="flex gap-2">
            {[1, 2, 3].map((rating) => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`w-8 h-8 ${
                            rating <= value
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                        <span className="text-gray-700">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {existingRating ? 'Editar calificación' : 'Calificar Amenity'}
                            </h2>
                            <p className="text-gray-600 mt-1">{amenityName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {existingRating && !isEditing && (
                        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                                        Ya calificaste esta Amenity
                                    </p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        Editar calificación
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-800">
                                La calificación general se calcula automáticamente con el promedio de las categorías.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-4">
                                Califica al menos una categoría
                            </p>

                            <div className={`space-y-4 ${existingRating && !isEditing ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        {SUBCATEGORY_LABELS.cleanliness}
                                    </label>
                                    <RatingStars value={cleanliness} onChange={setCleanliness} />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        {SUBCATEGORY_LABELS.equipment}
                                    </label>
                                    <RatingStars value={equipment} onChange={setEquipment} />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        {SUBCATEGORY_LABELS.comfort}
                                    </label>
                                    <RatingStars value={comfort} onChange={setComfort} />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        {SUBCATEGORY_LABELS.compliance}
                                    </label>
                                    <RatingStars value={compliance} onChange={setCompliance} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Comentario
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Comparte tu experiencia..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                                rows={4}
                                maxLength={500}
                                disabled={existingRating && !isEditing}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {comment.length}/500 caracteres
                            </p>
                        </div>

                        {(!existingRating || isEditing) && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <LoadingButton
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                                    loadingText={existingRating ? "Actualizando..." : "Enviando..."}
                                >
                                    {existingRating ? 'Actualizar calificación' : 'Enviar calificación'}
                                </LoadingButton>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
