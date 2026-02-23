export interface UserData {
    user: {
        id: number;
        name: string;
        email: string;
        role?: string;
        iat: number;
        exp: number;
    };
    message: string;
}

export interface ReservationData {
    [space: string]: {
        [time: string]: number;
    };
}

export interface ReservationStatus {
    id: number;
    name: string; // "pendiente", "confirmada", "cancelada", "finalizada"
    label: string;
}

export interface Reservation {
    id: number;
    startTime: string;
    endTime: string;
    status: ReservationStatus;
    amenity: {
        id: number;
        name: string;
    };
}

export interface Amenity {
    id: number;
    name: string;
    capacity: number;
    maxDuration: number;
    openTime?: string;
    closeTime?: string; 
    isActive: boolean;
    requiresApproval?: boolean;
}