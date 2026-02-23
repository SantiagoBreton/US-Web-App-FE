const API_URL = import.meta.env.VITE_API_URL as string;

export interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al enviar correo de recuperación");
  return data;
}