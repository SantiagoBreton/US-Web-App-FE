const API_URL = import.meta.env.VITE_API_URL as string;



export interface AvailableVisitorGarage {
  id:       number;
  number:   string;
  location: string | null;
}

export interface VisitorParking {
  id:           number;
  garageId:     number;
  apartmentId:  number;
  requestedById: number;
  visitorName:  string | null;
  licensePlate: string;
  startTime:    string;
  endTime:      string;
  status:       "activa" | "cancelada" | "vencida";
  createdAt:    string;
  garage: {
    id:       number;
    number:   string;
    location: string | null;
  };
  requestedBy?: {
    id:   number;
    name: string;
  };
}

export interface CreateVisitorParkingPayload {
  garageId:    number;
  licensePlate: string;
  visitorName?: string;
  startTime:   string; // ISO string
  endTime:     string; // ISO string
}



export const getAvailableVisitorGarages = async (
  token: string,
  startTime: string,
  endTime: string
): Promise<AvailableVisitorGarage[]> => {
  const params = new URLSearchParams({ startTime, endTime });
  const res = await fetch(`${API_URL}/visitor-parking/garages-available?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al obtener cocheras disponibles");
  }
  return res.json();
};

export const getMyVisitorParkings = async (token: string): Promise<VisitorParking[]> => {
  const res = await fetch(`${API_URL}/visitor-parking/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener tus reservas de cochera visitante");
  return res.json();
};

export const createVisitorParking = async (
  token: string,
  data: CreateVisitorParkingPayload
): Promise<VisitorParking> => {
  const res = await fetch(`${API_URL}/visitor-parking`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la reserva");
  }
  return res.json();
};

export const cancelVisitorParking = async (
  token: string,
  id: number
): Promise<VisitorParking> => {
  const res = await fetch(`${API_URL}/visitor-parking/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al cancelar la reserva");
  }
  return res.json();
};
