const API_URL = import.meta.env.VITE_API_URL as string;

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function updateUserName(token: string, payload: UpdateUserPayload) {
  const res = await fetch(`${API_URL}/user/name`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error updating user");
  return data;
}
