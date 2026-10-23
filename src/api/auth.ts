import { apiRequest } from "./client";

export interface Usuario {
  id: string;
  username: string;
  nombre?: string;
  rol?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function perfil(token: string) {
  return apiRequest<Usuario>("/me", { token });
}
