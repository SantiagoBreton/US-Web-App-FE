import { Star } from 'lucide-react';
import type { AmenityRatingsResponse } from '../api_calls/ratings';

interface AmenityRatingStatsProps {
    stats: AmenityRatingsResponse['stats'];
    compact?: boolean;
}

const SUBCATEGORY_LABELS: Record<string, string> = {
    cleanliness: 'Limpieza',
    equipment: 'Equipamiento',
    comfort: 'Comodidad',
    compliance: 'Cumplimiento'
};

export default function AmenityRatingStats({ stats, compact = false }: AmenityRatingStatsProps) {
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

    if (stats.totalRatings === 0) {
        return (
            <div className="text-gray-500 text-sm">
                Sin calificaciones aún
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {renderStars(stats.averageRating)}
                <span className="text-sm font-medium text-gray-700">
                    {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                    ({stats.totalRatings} {stats.totalRatings === 1 ? 'reseña' : 'reseñas'})
                </span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800">
                        {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-2">
                        {renderStars(stats.averageRating)}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        {stats.totalRatings} {stats.totalRatings === 1 ? 'reseña' : 'reseñas'}
                    </div>
                </div>
                
                <div className="flex-1 space-y-3">
                    {Object.entries(stats.averages).map(([key, value]) => {
                        if (value === null) return null;
                        return (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {SUBCATEGORY_LABELS[key]}
                                </span>
                                <div className="flex items-center gap-2">
                                    {renderStars(value)}
                                    <span className="text-sm font-medium text-gray-700 w-8">
                                        {value.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
