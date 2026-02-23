const API_URL = import.meta.env.VITE_API_URL as string;

export interface ReservationPayload {
  amenityId: number;
  startTime: string;
  endTime: string;  
}

export async function createReservation(token: string, payload: ReservationPayload) {
  const res = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error creating reservation");
  return data;
}
