import { fetchJson, setToken } from "./api";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function login(payload: LoginPayload): Promise<void> {
  const data = await fetchJson<TokenResponse>("/auth/login/json", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setToken(data.access_token);
}

export async function register(payload: RegisterPayload): Promise<void> {
  await fetchJson("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function me() {
  return fetchJson<{
    id: number;
    username: string;
    email: string;
    role: "user" | "supervisor";
    is_active: boolean;
  }>("/auth/me");
}



export async function logout(): Promise<void> {
  // Si tu backend soporta logout, podés hacer una llamada acá.
  // Por ahora solo limpiamos el token localmente.
  localStorage.removeItem("access_token");
}