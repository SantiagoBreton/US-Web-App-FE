const API_URL = import.meta.env.VITE_API_URL as string;

export interface UpdateUserPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function updateUserPassword(token: string, payload: UpdateUserPasswordPayload) {
  const res = await fetch(`${API_URL}/user/password`, {
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