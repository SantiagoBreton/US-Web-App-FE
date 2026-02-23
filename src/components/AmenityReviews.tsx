import { useState, useEffect, useRef } from 'react';
import { Star, MessageCircle, Filter, ChevronDown } from 'lucide-react';
import { getAmenityRatings } from '../api_calls/ratings';
import type { AmenityRatingsResponse, Rating } from '../api_calls/ratings';
import AmenityRatingStats from './AmenityRatingStats';

interface AmenityReviewsProps {
    amenityId: number;
    amenityName: string;
}

const RATING_LABELS: Record<number, string> = {
    1: 'Malo',
    2: 'Bueno',
    3: 'Muy bueno'
};

const SUBCATEGORY_LABELS: Record<string, string> = {
    cleanliness: 'Limpieza',
    equipment: 'Equipamiento',
    comfort: 'Comodidad',
    compliance: 'Cumplimiento'
};

export default function AmenityReviews({ amenityId, amenityName }: AmenityReviewsProps) {
    const [data, setData] = useState<AmenityRatingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRating, setSelectedRating] = useState<string>('all');
    const [showRatingFilter, setShowRatingFilter] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadRatings();
    }, [amenityId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowRatingFilter(false);
            }
        };

        if (showRatingFilter) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRatingFilter]);

    const loadRatings = async () => {
        try {
            const response = await getAmenityRatings(amenityId);
            setData(response);
        } catch (error) {
            console.error('Error loading ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const renderRatingCard = (rating: Rating) => {
        const subcategories = [
            { key: 'cleanliness', value: rating.cleanliness },
            { key: 'equipment', value: rating.equipment },
            { key: 'comfort', value: rating.comfort },
            { key: 'compliance', value: rating.compliance }
        ].filter(sub => sub.value !== null);

        return (
            <div key={rating.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-2">
                            {rating.user.name}
                        </div>
                        <div className="flex items-center gap-3">
                            {renderStars(rating.overallRating)}
                            <span className="text-sm font-medium text-gray-700">
                                {RATING_LABELS[rating.overallRating]}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                        {new Date(rating.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                {subcategories.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                        {subcategories.map(sub => (
                            <div key={sub.key} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 font-medium">
                                    {SUBCATEGORY_LABELS[sub.key]}
                                </span>
                                <div className="flex items-center gap-1">
                                    {renderStars(sub.value!)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {rating.comment && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{rating.comment}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getRatingLabel = () => {
        if (selectedRating === 'all') return 'Todas las calificaciones';
        return RATING_LABELS[parseInt(selectedRating)];
    };

    const filteredRatings = data?.ratings.filter(rating => {
        if (selectedRating === 'all') return true;
        return rating.overallRating === parseInt(selectedRating);
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
        );
    }

    if (!data || data.ratings.length === 0) {
        return (
            <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Sin reseñas aún</p>
                <p className="text-sm text-gray-500 mt-1">
                    Sé el primero en calificar {amenityName}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div>
                <AmenityRatingStats stats={data.stats} />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-600">
                    {filteredRatings.length} {filteredRatings.length === 1 ? 'reseña' : 'reseñas'}
                </p>
                
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setShowRatingFilter(!showRatingFilter)}
                        className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left cursor-pointer min-w-[200px]"
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className={selectedRating === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                                {getRatingLabel()}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Filter Dropdown */}
                    {showRatingFilter && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setSelectedRating('all');
                                        setShowRatingFilter(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                        selectedRating === 'all'
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Todas las calificaciones
                                </button>
                                {[3, 2, 1].map(rating => (
                                    <button
                                        key={rating}
                                        onClick={() => {
                                            setSelectedRating(rating.toString());
                                            setShowRatingFilter(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                                            selectedRating === rating.toString()
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{RATING_LABELS[rating]}</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 ${
                                                        star <= rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredRatings.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No hay reseñas con esta calificación</p>
                    </div>
                ) : (
                    filteredRatings.map(renderRatingCard)
                )}
            </div>
        </div>
    );
}
