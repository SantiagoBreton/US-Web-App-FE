const API_URL = import.meta.env.VITE_API_URL as string;

export interface AdminStats {
    totalUsers: number;
    totalApartments: number;
    totalReservations: number;
    activeReservations: number;
    totalAmenities: number;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    apartmentId?: number;
    apartment?: {
        id?: number;
        unit: string;
        floor: number;
        rooms?: number;
    };
    _count?: {
        reservations: number;
    };
    reservationCount?: number;
    ownedApartmentsCount?: number;
}

export interface AdminAmenity {
    id: number;
    name: string;
    capacity: number;
    maxDuration: number;
    openTime?: string;
    closeTime?: string;
    isActive: boolean;
    requiresApproval?: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        reservations: number;
        activeReservations: number;
    };
    reservationCount?: number;
    activeReservationCount?: number;
}

export interface AdminApartment {
    id: number;
    unit: string;
    floor: number;
    rooms: number;
    areaM2?: number;
    observations?: string;
    isOccupied: boolean;
    createdAt: string;
    updatedAt: string;
    owner?: {
        id: number;
        name: string;
        email: string;
    };
    tenant?: {
        id: number;
        name: string;
        email: string;
    };
    _count?: {
        reservations: number;
        users: number;
    };
    reservationCount?: number;
    userCount?: number;
}

export interface AdminReservation {
    id: number;
    startTime: string;
    endTime: string;
    status: {
        id: number;
        name: string;
        label: string;
    };
    createdAt: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        apartment?: {
            unit: string;
        };
    };
    amenity?: {
        id: number;
        name: string;
        capacity?: number;
        maxDuration?: number;
    };
}

export async function getAdminStats(token: string): Promise<AdminStats> {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            totalUsers: data.totalUsers || 0,
            totalApartments: data.totalApartments || 0,
            totalReservations: data.totalReservations || 0,
            activeReservations: data.activeReservations || 0,
            totalAmenities: data.totalAmenities || 0,
        };
    } catch (error) {
        console.error('Error in getAdminStats:', error);
        throw error;
    }
}

export async function getAdminUsers(token: string): Promise<AdminUser[]> {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // El backend devuelve un objeto con estructura {users: Array, totalCount: number, retrievedAt: string}
        if (data && Array.isArray(data.users)) {
            return data.users;
        } else if (Array.isArray(data)) {
            
            return data;
        } else {
            console.error('API did not return expected users structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error in getAdminUsers:', error);
        throw error;
    }
}

export async function updateUserRole(token: string, userId: number, role: string): Promise<AdminUser> {
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to update user role: ${response.status}`);
    }

    return response.json();
}

export async function updateUserApartment(token: string, userId: number, apartmentId: number | null): Promise<AdminUser> {
    const response = await fetch(`${API_URL}/admin/users/${userId}/apartment`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apartmentId })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to update user apartment: ${response.status}`);
    }

    const data = await response.json();
    return data.user;
}

export async function getAdminReservations(
    token: string, 
    params?: {
        status?: string;
        amenityId?: number;
        limit?: number;
    }
): Promise<AdminReservation[]> {
    try {
        const searchParams = new URLSearchParams();
        
        if (params?.status) searchParams.append('status', params.status);
        if (params?.amenityId) searchParams.append('amenityId', params.amenityId.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        const url = `${API_URL}/admin/reservations${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // El backend devuelve un objeto con estructura {reservations: Array, totalCount: number, filters: object, retrievedAt: string}
        if (data && Array.isArray(data.reservations)) {
            return data.reservations;
        } else if (Array.isArray(data)) {
            // Fallback: si es un array directo
            return data;
        } else {
            console.error('API did not return expected reservations structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error in getAdminReservations:', error);
        throw error;
    }
}

export async function createAmenity(
    token: string, 
    amenityData: {
        name: string;
        capacity: number;
        maxDuration: number;
        openTime?: string;
        closeTime?: string;
        isActive?: boolean;
    }
): Promise<AdminAmenity> {
    try {
        const response = await fetch(`${API_URL}/admin/amenities`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(amenityData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 409) {
                throw new Error('Ya existe un amenity con ese nombre.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al crear amenity: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in createAmenity:', error);
        throw error;
    }
}
export async function updateAmenity(
    token: string, 
    amenityId: number,
    amenityData: {
        name?: string;
        capacity?: number;
        maxDuration?: number;
        openTime?: string;
        closeTime?: string;
        isActive?: boolean;
    }
): Promise<AdminAmenity> {
    try {
        const response = await fetch(`${API_URL}/admin/amenities/${amenityId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(amenityData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Amenity no encontrado.');
            }
            if (response.status === 409) {
                throw new Error('Ya existe un amenity con ese nombre.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al actualizar amenity: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in updateAmenity:', error);
        throw error;
    }
}

export async function getAdminApartments(token: string): Promise<AdminApartment[]> {
    try {
        const response = await fetch(`${API_URL}/admin/apartments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // El backend puede devolver un objeto estructurado o array directo
        if (data && Array.isArray(data.apartments)) {
            return data.apartments;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            console.error('API did not return expected apartments structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error in getAdminApartments:', error);
        throw error;
    }
}

export async function createApartment(
    token: string, 
    apartmentData: {
        unit: string;
        floor: number;
        rooms: number;
        areaM2?: number;
        observations?: string;
        ownerId?: number;
    }
): Promise<AdminApartment> {
    try {
        const response = await fetch(`${API_URL}/admin/apartments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apartmentData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 409) {
                throw new Error('Ya existe un apartamento con esa unidad.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al crear apartamento: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in createApartment:', error);
        throw error;
    }
}
export async function updateApartment(
    token: string, 
    apartmentId: number,
    apartmentData: {
        unit?: string;
        floor?: number;
        rooms?: number;
        areaM2?: number | null;
        observations?: string | null;
        ownerId?: number | null;
        tenantId?: number | null;
    }
): Promise<AdminApartment> {
    try {
        const response = await fetch(`${API_URL}/admin/apartments/${apartmentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apartmentData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Departamento no encontrado.');
            }
            if (response.status === 409) {
                throw new Error('Ya existe un apartamento con esa unidad.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al actualizar apartamento: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in updateApartment:', error);
        throw error;
    }
}

export async function deleteApartment(token: string, apartmentId: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/admin/apartments/${apartmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Departamento no encontrado.');
            }
            if (response.status === 409) {
                throw new Error('No se puede eliminar: el apartamento tiene reservas activas o usuarios asignados.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al eliminar apartamento: ${response.status}`);
        }
    } catch (error) {
        console.error('Error in deleteApartment:', error);
        throw error;
    }
}


export async function getAdminAmenities(token: string): Promise<AdminAmenity[]> {
    try {
        const response = await fetch(`${API_URL}/admin/amenities`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        // El backend puede devolver un objeto estructurado o array directo
        if (data && Array.isArray(data.amenities)) {
            return data.amenities;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            console.error('API did not return expected amenities structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error in getAdminAmenities:', error);
        throw error;
    }
}


export async function deleteAmenity(token: string, amenityId: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/admin/amenities/${amenityId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Amenity no encontrado.');
            }
            if (response.status === 409) {
                throw new Error('No se puede eliminar: el amenity tiene reservas activas.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al eliminar amenity: ${response.status}`);
        }
    } catch (error) {
        console.error('Error in deleteAmenity:', error);
        throw error;
    }
}

export async function getAmenityReservations(
    token: string, 
    amenityId: number,
    params?: {
        status?: string;
        limit?: number;
    }
): Promise<{ reservations: AdminReservation[]; amenityName: string; totalCount: number }> {
    try {
        const searchParams = new URLSearchParams();
        
        if (params?.status) searchParams.append('status', params.status);
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        const url = `${API_URL}/admin/amenities/${amenityId}/reservations${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Amenity no encontrado.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            reservations: Array.isArray(data.reservations) ? data.reservations : [],
            amenityName: data.amenityName || 'Amenity desconocido',
            totalCount: data.totalCount || 0
        };
    } catch (error) {
        console.error('Error in getAmenityReservations:', error);
        throw error;
    }
}


export async function getPendingReservations(token: string): Promise<AdminReservation[]> {
    try {
        const response = await fetch(`${API_URL}/admin/reservations/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data.reservations)) {
            return data.reservations;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            console.error('API did not return expected reservations structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error in getPendingReservations:', error);
        throw error;
    }
}

export async function approveReservation(token: string, reservationId: number): Promise<AdminReservation> {
    try {
        const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reserva no encontrada.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'No se puede aprobar esta reserva.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al aprobar reserva: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in approveReservation:', error);
        throw error;
    }
}

export async function rejectReservation(
    token: string, 
    reservationId: number,
    reason?: string
): Promise<AdminReservation> {
    try {
        const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reserva no encontrada.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'No se puede rechazar esta reserva.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al rechazar reserva: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in rejectReservation:', error);
        throw error;
    }
}


export async function cancelReservationAsAdmin(
    token: string, 
    reservationId: number,
    reason?: string
): Promise<AdminReservation> {
    try {
        const response = await fetch(`${API_URL}/admin/reservations/${reservationId}/cancel`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reserva no encontrada.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'No se puede cancelar esta reserva.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al cancelar reserva: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error in cancelReservationAsAdmin:', error);
        throw error;
    }
}