const API_URL = import.meta.env.VITE_API_URL as string;

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  apartmentId?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function login({ email, password }: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem("token", data.token); 
  }

  return { success: res.ok, data, message: data.message };
}


export async function register({ name, email, password, apartmentId }: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, apartmentId }),
  });
  const data = await res.json();
  return { success: res.ok, data, message: data.message };
}
