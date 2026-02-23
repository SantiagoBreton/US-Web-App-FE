const API_URL = import.meta.env.VITE_API_URL as string;

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al restablecer la contraseña");
  return data;
}