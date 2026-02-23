const API_URL = import.meta.env.VITE_API_URL as string;

export interface ClaimCategory {
    id: number;
    name: string;
    label: string;
    icon?: string;
    color?: string;
}

export interface ClaimPriority {
    id: number;
    name: string;
    label: string;
    level: number;
    color?: string;
}

export interface ClaimStatus {
    id: number;
    name: string;
    label: string;
    color?: string;
}

export interface GamificationLevel {
    id: number;
    name: string;
    displayName: string;
    minPoints: number;
    maxPoints: number | null;
    order: number;
    icon: string;
    color: string;
}

export interface GamificationTheme {
    id: number;
    name: string;
    displayName: string;
    primaryColor: string;
    secondaryColor: string;
    gradient: string;
    requiredLevelId: number;
}

export interface GamificationFrame {
    id: number;
    name: string;
    displayName: string;
    cssClass: string;
    animation: string;
    requiredLevelId: number;
}

export interface GamificationEffect {
    id: number;
    name: string;
    displayName: string;
    cssClass: string;
    animation: string;
    requiredLevelId: number;
}

export interface UserGamification {
    totalPoints: number;
    customTitle: string | null;
    level: GamificationLevel;
    selectedTheme: GamificationTheme | null;
    selectedFrame: GamificationFrame | null;
    selectedEffect: GamificationEffect | null;
}

export interface ClaimUser {
    id: number;
    name: string;
    email: string;
    gamification?: UserGamification | null;
}

export interface Claim {
    id: number;
    subject: string;
    category: ClaimCategory;
    description: string;
    location: string;
    priority: ClaimPriority;
    status: ClaimStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    userId?: number;
    user?: ClaimUser;
    adminNotes?: string;
    isAnonymous?: boolean;
    projectFlowTaskId?: string | null;
    adhesion_counts?: {
        support: number;
        disagree: number;
    };
    user_adhesion?: boolean | null; // true = support, false = disagree
}

export interface CreateClaimData {
    subject: string;
    category: string;
    description: string;
    location: string;
    priority: string; 
    isAnonymous?: boolean;
}

export interface UpdateClaimData {
    subject?: string;
    category?: string; 
    description?: string;
    location?: string;
    priority?: string; 
    status?: string; 
}

export interface ClaimsListResponse {
    claims: Claim[];
    total: number;
    page: number;
    limit: number;
}


export async function getClaimCategories(): Promise<ClaimCategory[]> {
    try {
        const response = await fetch(`${API_URL}/claims/categories`);
        if (!response.ok) {
            throw new Error(`Error al obtener categorías: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching claim categories:', error);
        throw error;
    }
}

export async function getClaimPriorities(): Promise<ClaimPriority[]> {
    try {
        const response = await fetch(`${API_URL}/claims/priorities`);
        if (!response.ok) {
            throw new Error(`Error al obtener prioridades: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching claim priorities:', error);
        throw error;
    }
}

export async function getClaimStatuses(): Promise<ClaimStatus[]> {
    try {
        const response = await fetch(`${API_URL}/claims/statuses`);
        if (!response.ok) {
            throw new Error(`Error al obtener estados: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching claim statuses:', error);
        throw error;
    }
}


export async function getClaims(
    token: string,
    options?: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        search?: string;
        includeAll?: boolean;
    }
): Promise<ClaimsListResponse> {
    try {
        const params = new URLSearchParams();
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.category && options.category !== 'all') params.append('category', options.category);
        if (options?.status && options.status !== 'all') params.append('status', options.status);
        if (options?.search) params.append('search', options.search);
        if (options?.includeAll) params.append('includeAll', 'true');

        const url = `${API_URL}/claims${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        return {
            claims: Array.isArray(data.claims) ? data.claims : [],
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 10
        };
    } catch (error) {
        console.error('Error en getClaims:', error);
        throw error;
    }
}

export async function getClaim(token: string, claimId: number): Promise<Claim> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en getClaim:', error);
        throw error;
    }
}

export async function createClaim(
    token: string, 
    claimData: CreateClaimData
): Promise<Claim> {
    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(claimData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Datos de reclamo inválidos.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al crear reclamo: ${response.status}`);
        }

        const result = await response.json();
        console.log('Backend response for createClaim:', result);

        if (result && typeof result.then === 'function') {
            console.warn('Backend returned a Promise instead of resolved data');
            throw new Error('Error interno del servidor: respuesta inesperada');
        }

        if (!result || typeof result !== 'object' || !result.id) {
            console.warn('Backend returned invalid claim data:', result);
            throw new Error('Error interno del servidor: datos inválidos');
        }
        
        return result;
    } catch (error) {
        console.error('Error en createClaim:', error);
        throw error;
    }
}

export async function updateClaim(
    token: string, 
    claimId: number,
    claimData: UpdateClaimData
): Promise<Claim> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(claimData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado. Solo puedes actualizar tus propios reclamos.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Datos de reclamo inválidos.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al actualizar reclamo: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en updateClaim:', error);
        throw error;
    }
}

export async function deleteClaim(token: string, claimId: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('Acceso denegado. Solo puedes eliminar tus propios reclamos.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            if (response.status === 409) {
                throw new Error('No se puede eliminar: el reclamo está siendo procesado.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al eliminar reclamo: ${response.status}`);
        }
    } catch (error) {
        console.error('Error en deleteClaim:', error);
        throw error;
    }
}

export async function getAdminClaims(
    token: string,
    options?: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        search?: string;
        userId?: number;
    }
): Promise<ClaimsListResponse> {
    try {
        const params = new URLSearchParams();
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.category && options.category !== 'all') params.append('category', options.category);
        if (options?.status && options.status !== 'all') params.append('status', options.status);
        if (options?.search) params.append('search', options.search);
        if (options?.userId) params.append('userId', options.userId.toString());

        const url = `${API_URL}/admin/claims${params.toString() ? `?${params.toString()}` : ''}`;
        
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
        
        return {
            claims: Array.isArray(data.claims) ? data.claims : [],
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 10
        };
    } catch (error) {
        console.error('Error en getAdminClaims:', error);
        throw error;
    }
}

export async function updateClaimStatus(
    token: string, 
    claimId: number,
    status: 'pendiente' | 'en_progreso' | 'resuelto' | 'rechazado',
    adminNotes?: string
): Promise<Claim> {
    try {
        const response = await fetch(`${API_URL}/admin/claims/${claimId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, adminNotes })
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Estado de reclamo inválido.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al actualizar estado del reclamo: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en updateClaimStatus:', error);
        throw error;
    }
}

export async function deleteAdminClaim(token: string, claimId: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/admin/claims/${claimId}`, {
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
                throw new Error('Reclamo no encontrado.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al eliminar reclamo: ${response.status}`);
        }
    } catch (error) {
        console.error('Error en deleteAdminClaim:', error);
        throw error;
    }
}

export async function linkClaimToProjectFlowTask(
    token: string, 
    claimId: number, 
    projectFlowTaskId: string
): Promise<Claim> {
    try {
        const response = await fetch(`${API_URL}/admin/claims/${claimId}/projectflow-task`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectFlowTaskId })
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Acceso denegado. Se requieren permisos de administrador.');
            }
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            const error = await response.json();
            throw new Error(error.message || `Error al vincular reclamo con ProjectFlow: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error en linkClaimToProjectFlowTask:', error);
        throw error;
    }
}

export async function getClaimAdhesions(token: string, claimId: number): Promise<{
    total_support: number;
    total_disagree: number;
    user_adhesion: 'support' | 'disagree' | null;
}> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/adhesions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en getClaimAdhesions:', error);
        throw error;
    }
}

// POST /claims/:id/adhesions - Crear/actualizar adhesión
export async function createClaimAdhesion(
    token: string, 
    claimId: number, 
    isSupport: boolean
): Promise<{ message: string; adhesion_type: string }> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/adhesions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adhesion_type: isSupport })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 403) {
                throw new Error('No puedes adherirte a tu propio reclamo.');
            }
            if (response.status === 404) {
                throw new Error('Reclamo no encontrado.');
            }
            if (response.status === 400) {
                const error = await response.json();
                throw new Error(error.message || 'Datos de adhesión inválidos.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en createClaimAdhesion:', error);
        throw error;
    }
}

export async function deleteClaimAdhesion(token: string, claimId: number): Promise<{ message: string }> {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/adhesions`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token de autenticación inválido.');
            }
            if (response.status === 404) {
                throw new Error('Adhesión no encontrada.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error en deleteClaimAdhesion:', error);
        throw error;
    }
}