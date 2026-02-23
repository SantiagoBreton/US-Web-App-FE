const API_URL = import.meta.env.VITE_API_URL as string;

export interface Reservation {
  id: number;
  amenityId: number;
  userId: number;
  user?: { id: number; name: string }; 
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export async function getReservationsByAmenity(
  token: string,
  amenityId: number,
  startDate?: string,
  endDate?: string
): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await fetch(
    `${API_URL}/reservations/amenity/${amenityId}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error fetching reservations");
  return data;
}
