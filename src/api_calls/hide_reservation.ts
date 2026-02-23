const API_URL = import.meta.env.VITE_API_URL as string;

export async function hideReservationFromUser(token: string, reservationId: number) {
  const res = await fetch(`${API_URL}/reservations/${reservationId}/hide`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error hiding reservation");
  return data;
}