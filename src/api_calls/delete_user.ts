const API_URL = import.meta.env.VITE_API_URL as string;

export async function deleteUser(token: string) {
  const res = await fetch(`${API_URL}/user`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error deleting user");
  return data;
}