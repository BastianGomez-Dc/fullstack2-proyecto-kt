import { apiRequest } from "./client.ts";

export const ESTADOS_CURSO = ["PLANIFICADO", "EN_CURSO", "FINALIZADO"] as const;

export type EstadoCurso = (typeof ESTADOS_CURSO)[number];

export interface Curso {
  id: number;
  titulo: string;
  descripcion: string | null;
  areaTematica: string;
  unidadVecinal: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoCurso;
}

export interface CursoCreateRequest {
  titulo: string;
  descripcion?: string;
  areaTematica: string;
  unidadVecinal: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoCurso;
}

export type CursoUpdateRequest = Partial<CursoCreateRequest>;

export function listarCursos(token: string): Promise<Curso[]> {
  return apiRequest<Curso[]>("/cursos", { token });
}

/** Público (sin sesión): los últimos cursos activos creados, del más nuevo al más antiguo. */
export function listarCursosRecientes(limite = 3, signal?: AbortSignal): Promise<Curso[]> {
  return apiRequest<Curso[]>(`/cursos/recientes?limite=${limite}`, { signal });
}

export function obtenerCurso(id: number, token: string): Promise<Curso> {
  return apiRequest<Curso>(`/cursos/${id}`, { token });
}

export function crearCurso(datos: CursoCreateRequest, token: string): Promise<Curso> {
  return apiRequest<Curso>("/cursos", { method: "POST", body: datos, token });
}

export function editarCurso(
  id: number,
  datos: CursoUpdateRequest,
  token: string,
): Promise<Curso> {
  return apiRequest<Curso>(`/cursos/${id}`, { method: "PUT", body: datos, token });
}

export async function desactivarCurso(id: number, token: string): Promise<void> {
  await apiRequest<unknown>(`/cursos/${id}/desactivar`, { method: "PATCH", token });
}
