const API_URL = import.meta.env.VITE_API_URL as string;

export type GarageType   = "fija" | "cortesia" | "visitante";
export type GarageStatus = "activa" | "fuera_de_uso";

export interface GarageApartment {
  id:    number;
  unit:  string;
  floor: number;
}

export interface AdminGarage {
  id:           number;
  number:       string;
  location:     string | null;
  type:         GarageType;
  status:       GarageStatus;
  apartment:    GarageApartment | null;
  vehicleCount: number;
  createdAt:    string;
}

export interface CreateGaragePayload {
  number:      string;
  location?:   string;
  type:        GarageType;
  status:      GarageStatus;
  apartmentId?: number | null;
}

export type UpdateGaragePayload = Partial<CreateGaragePayload>;

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const getAdminGarages = async (token: string): Promise<AdminGarage[]> => {
  const res = await fetch(`${API_URL}/admin/garages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener cocheras");
  return res.json();
};

export const createGarage = async (
  token: string,
  data: CreateGaragePayload
): Promise<AdminGarage> => {
  const res = await fetch(`${API_URL}/admin/garages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear cochera");
  }
  return res.json();
};

export const updateGarage = async (
  token: string,
  id: number,
  data: UpdateGaragePayload
): Promise<AdminGarage> => {
  const res = await fetch(`${API_URL}/admin/garages/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al actualizar cochera");
  }
  return res.json();
};

export const deleteGarage = async (token: string, id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/admin/garages/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al eliminar cochera");
  }
};

export const assignGarage = async (
  token: string,
  garageId: number,
  apartmentId: number
): Promise<AdminGarage> => {
  const res = await fetch(`${API_URL}/admin/garages/${garageId}/assign`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apartmentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al asignar cochera");
  }
  return res.json();
};

export const unassignGarage = async (
  token: string,
  garageId: number
): Promise<AdminGarage> => {
  const res = await fetch(`${API_URL}/admin/garages/${garageId}/unassign`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al desasignar cochera");
  }
  return res.json();
};
