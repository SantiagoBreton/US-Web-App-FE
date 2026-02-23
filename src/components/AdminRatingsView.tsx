import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, User, Calendar, Filter, ChevronDown } from 'lucide-react';
import { getAllRatings } from '../api_calls/ratings';
import type { Rating } from '../api_calls/ratings';
import AmenityFilterModal from './AmenityFilterModal';

const SUBCATEGORY_LABELS: Record<string, string> = {
    cleanliness: 'Limpieza',
    equipment: 'Equipamiento',
    comfort: 'Comodidad',
    compliance: 'Cumplimiento'
};

interface AdminRatingsViewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminRatingsView({ isOpen, onClose }: AdminRatingsViewProps) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | number>('all');
    const [amenityFilter, setAmenityFilter] = useState<string>('all');
    const [showAmenityModal, setShowAmenityModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadRatings();
        }
    }, [isOpen]);

    const loadRatings = async () => {
        try {
            setLoading(true);
            const data = await getAllRatings();
            setRatings(data);
        } catch (error) {
            console.error('Error loading ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 3 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                ))}
                {hasHalfStar && (
                    <div className="relative w-4 h-4">
                        <Star className="w-4 h-4 text-gray-300 absolute" />
                        <div className="overflow-hidden w-2 absolute">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        className="w-4 h-4 text-gray-300"
                    />
                ))}
            </div>
        );
    };

    const uniqueAmenities = Array.from(new Set(ratings.map(r => r.amenity?.name || 'Sin Amenity'))).sort();
    
    const availableAmenities = uniqueAmenities.map((name, index) => ({
        id: index,
        name: name
    }));

    const getCurrentAmenityLabel = () => {
        return amenityFilter === 'all' ? 'Todas las Amenities' : amenityFilter;
    };

    const filteredRatings = ratings.filter(rating => {
        const matchesStarFilter = filter === 'all' || Math.round(rating.overallRating) === filter;
        const matchesAmenityFilter = amenityFilter === 'all' || rating.amenity?.name === amenityFilter;
        return matchesStarFilter && matchesAmenityFilter;
    });

    const stats = {
        total: ratings.length,
        averageRating: ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length 
            : 0,
        byAmenity: uniqueAmenities.map(amenity => ({
            name: amenity,
            count: ratings.filter(r => r.amenity?.name === amenity).length,
            average: ratings.filter(r => r.amenity?.name === amenity).length > 0
                ? ratings.filter(r => r.amenity?.name === amenity).reduce((sum, r) => sum + r.overallRating, 0) / 
                  ratings.filter(r => r.amenity?.name === amenity).length
                : 0
        }))
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-6 flex items-center justify-between border-b border-yellow-600">
                        <div className="flex items-center gap-3">
                            <Star className="w-8 h-8 text-white fill-white" />
                            <h2 className="text-2xl font-bold text-white">Reseñas de Amenity</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-hidden p-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                        <h3 className="text-lg font-bold text-gray-800">Total Reseñas</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-8 h-8 text-blue-600 fill-blue-600" />
                        <h3 className="text-lg font-bold text-gray-800">Promedio General</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold text-gray-800">
                            {stats.averageRating.toFixed(1)}
                        </p>
                        {renderStars(stats.averageRating)}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-8 h-8 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-800">Con Comentarios</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">
                        {ratings.filter(r => r.comment).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Filtros</h3>
                            <p className="text-sm text-white/90">Personaliza tu búsqueda</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Calificación
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                        filter === 'all'
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    Todas
                                </button>
                                {[3, 2, 1].map(stars => (
                                    <button
                                        key={stars}
                                        onClick={() => setFilter(stars)}
                                        className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                            filter === stars
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        {stars} <Star className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Amenity
                            </label>
                            <button
                                onClick={() => setShowAmenityModal(true)}
                                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <span className={amenityFilter === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                        {getCurrentAmenityLabel()}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                        Reseñas
                    </h3>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {filteredRatings.length} {filteredRatings.length === 1 ? 'reseña' : 'reseñas'}
                    </span>
                </div>

                {filteredRatings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay reseñas que coincidan con los filtros</p>
                        <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros para ver más resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredRatings.map((rating) => (
                            <div
                                key={rating.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <User className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-gray-900">
                                                    {rating.user?.name || 'Usuario'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    {new Date(rating.createdAt).toLocaleDateString('es-AR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900">
                                                {rating.amenity?.name || 'Sin Amenity'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            {renderStars(rating.overallRating)}
                                            <span className="text-lg font-bold text-gray-900">
                                                {rating.overallRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {Object.entries({
                                        cleanliness: rating.cleanliness,
                                        equipment: rating.equipment,
                                        comfort: rating.comfort,
                                        compliance: rating.compliance
                                    }).map(([key, value]) => {
                                        if (!value) return null;
                                        return (
                                            <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs text-gray-600 font-medium mb-1.5">
                                                    {SUBCATEGORY_LABELS[key]}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(value)}
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {value}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {rating.comment && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {rating.comment}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Estadísticas por Amenity</h3>
                            <p className="text-sm text-white/90">Promedio de calificaciones</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="space-y-3">
                        {stats.byAmenity.map(amenity => (
                            <div
                                key={amenity.name}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200"
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{amenity.name}</p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {amenity.count} {amenity.count === 1 ? 'reseña' : 'reseñas'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {renderStars(amenity.average)}
                                    <span className="text-lg font-bold text-gray-900 w-12 text-right">
                                        {amenity.average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AmenityFilterModal
                isVisible={showAmenityModal}
                onClose={() => setShowAmenityModal(false)}
                selectedAmenity={amenityFilter}
                onAmenitySelect={(amenity) => {
                    setAmenityFilter(amenity);
                    setShowAmenityModal(false);
                }}
                availableAmenities={availableAmenities}
            />
                        </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
