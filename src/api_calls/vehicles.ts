const API_URL = import.meta.env.VITE_API_URL as string;

export interface Vehicle {
  id:          number;
  licensePlate: string;
  brand:        string;
  model:        string;
  color:        string;
  userId:       number;
  garageId:     number | null;
  garage: {
    id:       number;
    number:   string;
    location: string | null;
    type:     string;
    status:   string;
  } | null;
  createdAt: string;
}

export interface AdminVehicle extends Vehicle {
  user: {
    id:          number;
    name:        string;
    email:       string;
    apartmentId: number | null;
    apartment:   { id: number; unit: string; floor: number } | null;
  };
}

export interface CreateVehiclePayload {
  licensePlate: string;
  brand:        string;
  model:        string;
  color:        string;
  garageId?:    number | null;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

// ─── TENANT ───────────────────────────────────────────────────────────────────

export const getMyVehicles = async (token: string): Promise<Vehicle[]> => {
  const res = await fetch(`${API_URL}/vehicles/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener vehículos");
  return res.json();
};

export const createVehicle = async (
  token: string,
  data: CreateVehiclePayload
): Promise<Vehicle> => {
  const res = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear vehículo");
  }
  return res.json();
};

export const updateVehicle = async (
  token: string,
  id: number,
  data: UpdateVehiclePayload
): Promise<Vehicle> => {
  const res = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al actualizar vehículo");
  }
  return res.json();
};

export const deleteVehicle = async (token: string, id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al eliminar vehículo");
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface AdminVehicleFilters {
  garageId?:     number;
  apartmentId?:  number;
  licensePlate?: string;
}

export const getAdminVehicles = async (
  token: string,
  filters?: AdminVehicleFilters
): Promise<AdminVehicle[]> => {
  const params = new URLSearchParams();
  if (filters?.garageId)     params.set("garageId",     String(filters.garageId));
  if (filters?.apartmentId)  params.set("apartmentId",  String(filters.apartmentId));
  if (filters?.licensePlate) params.set("licensePlate", filters.licensePlate);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/admin/vehicles${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener vehículos");
  return res.json();
};
