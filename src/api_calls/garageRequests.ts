const API_URL = import.meta.env.VITE_API_URL as string;

export interface GarageRequestGarage {
  id:       number;
  number:   string;
  location: string | null;
}

export interface GarageRequest {
  id:                 number;
  userId:             number;
  type:               "nueva" | "cambio";
  currentGarageId:    number | null;
  currentGarage:      GarageRequestGarage | null;
  requestedGarageId:  number | null;
  requestedGarage:    GarageRequestGarage | null;
  reason:             string | null;
  status:             "pendiente" | "aprobada" | "rechazada";
  adminNote:          string | null;
  createdAt:          string;
  updatedAt:          string;
}

export interface AdminGarageRequest extends GarageRequest {
  user: {
    id:        number;
    name:      string;
    email:     string;
    apartment: { id: number; unit: string; floor: number } | null;
  };
}

export interface CreateGarageRequestPayload {
  type:               "nueva" | "cambio";
  currentGarageId?:   number;
  requestedGarageId?: number;
  reason?:            string;
}

export interface AvailableGarage {
  id:       number;
  number:   string;
  location: string | null;
  type:     string;
}

export const getAvailableGaragesForRequest = async (token: string): Promise<AvailableGarage[]> => {
  const res = await fetch(`${API_URL}/garage-requests/available`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener cocheras disponibles");
  return res.json();
};

export const getMyGarageRequests = async (token: string): Promise<GarageRequest[]> => {
  const res = await fetch(`${API_URL}/garage-requests/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener tus solicitudes");
  return res.json();
};

export const createGarageRequest = async (
  token: string,
  data: CreateGarageRequestPayload
): Promise<GarageRequest> => {
  const res = await fetch(`${API_URL}/garage-requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la solicitud");
  }
  return res.json();
};

export const cancelGarageRequest = async (token: string, id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/garage-requests/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al cancelar la solicitud");
  }
};

export const adminGetAllGarageRequests = async (
  token: string,
  status?: string
): Promise<AdminGarageRequest[]> => {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${API_URL}/garage-requests/admin/all${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener las solicitudes");
  return res.json();
};

export const adminResolveGarageRequest = async (
  token: string,
  id: number,
  status: "aprobada" | "rechazada",
  adminNote?: string
): Promise<AdminGarageRequest> => {
  const res = await fetch(`${API_URL}/garage-requests/admin/${id}/resolve`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminNote }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al resolver la solicitud");
  }
  return res.json();
};
