const API_URL = import.meta.env.VITE_API_URL as string;

export interface RatingData {
    amenityId: number;
    cleanliness?: number;
    equipment?: number;
    comfort?: number;
    compliance?: number;
    comment?: string;
}

export interface Rating {
    id: number;
    userId: number;
    amenityId: number;
    reservationId: number;
    overallRating: number;
    cleanliness: number | null;
    equipment: number | null;
    comfort: number | null;
    compliance: number | null;
    comment: string | null;
    createdAt: string;
    user: {
        id: number;
        name: string;
    };
    amenity?: {
        id: number;
        name: string;
    };
}

export interface AmenityRatingsResponse {
    ratings: Rating[];
    stats: {
        averageRating: number;
        totalRatings: number;
        averages: {
            cleanliness: number | null;
            equipment: number | null;
            comfort: number | null;
            compliance: number | null;
        };
    };
}

export const createRating = async (data: RatingData): Promise<Rating> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Error al crear calificación');
    }
    
    return response.json();
};

export const getAmenityRatings = async (amenityId: number): Promise<AmenityRatingsResponse> => {
    const response = await fetch(`${API_URL}/ratings/amenity/${amenityId}`);
    
    if (!response.ok) {
        throw new Error('Error al obtener calificaciones');
    }
    
    return response.json();
};

export const getUserRatings = async (): Promise<Rating[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ratings/my-ratings`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Error al obtener calificaciones');
    }
    
    return response.json();
};

export const getAllRatings = async (): Promise<Rating[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/ratings`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Error al obtener calificaciones');
    }
    
    return response.json();
};

export const getUserRatingForAmenity = async (amenityId: number): Promise<Rating | null> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ratings/my-rating/${amenityId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 404) {
        return null;
    }
    
    if (!response.ok) {
        throw new Error('Error al obtener calificación');
    }
    
    return response.json();
};

export const updateRating = async (data: RatingData): Promise<Rating> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ratings`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar calificación');
    }
    
    return response.json();
};
