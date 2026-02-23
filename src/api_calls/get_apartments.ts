const API_URL = import.meta.env.VITE_API_URL as string;

export interface Apartment {
  id: number;
  unit: string;
  floor: number;
  areaM2?: number;
  observations?: string;
  rooms: number;
  ownerId: number;
}

export async function getApartments() {
  const res = await fetch(`${API_URL}/apartments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener apartamentos");
  return data;
}