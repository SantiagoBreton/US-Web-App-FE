const API_URL = import.meta.env.VITE_API_URL as string;

export interface CortesiaReservationGarage {
  id:       number;
  number:   string;
  location: string | null;
}

export interface CortesiaReservation {
  id:           number;
  garageId:     number;
  createdById:  number;
  personName:   string;
  licensePlate: string | null;
  reason:       string;
  startTime:    string;
  endTime:      string;
  status:       "activa" | "cancelada" | "vencida";
  createdAt:    string;
  updatedAt:    string;
  garage:       CortesiaReservationGarage;
  createdBy:    { id: number; name: string };
}

export interface CreateCortesiaReservationPayload {
  garageId:     number;
  personName:   string;
  licensePlate?: string;
  reason:       string;
  startTime:    string;
  endTime:      string;
}

export const getCortesiaReservations = async (token: string): Promise<CortesiaReservation[]> => {
  const res = await fetch(`${API_URL}/admin/cortesia-reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener reservas de cortesía");
  return res.json();
};

export const createCortesiaReservation = async (
  token: string,
  data: CreateCortesiaReservationPayload
): Promise<CortesiaReservation> => {
  const res = await fetch(`${API_URL}/admin/cortesia-reservations`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la reserva");
  }
  return res.json();
};

export const cancelCortesiaReservation = async (
  token: string,
  id: number
): Promise<CortesiaReservation> => {
  const res = await fetch(`${API_URL}/admin/cortesia-reservations/${id}`, {
    method:  "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al cancelar la reserva");
  }
  return res.json();
};
