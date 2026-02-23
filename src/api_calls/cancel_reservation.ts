const API_URL = import.meta.env.VITE_API_URL as string;


export async function cancelReservation(token: string, reservationId: number) {
  const res = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error cancelling reservation");
  return data;
}
