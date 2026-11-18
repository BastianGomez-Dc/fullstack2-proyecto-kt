// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/api/client";
import {
  crearCurso,
  desactivarCurso,
  editarCurso,
  listarCursos,
  obtenerCurso,
} from "../src/api/cursos";

afterEach(() => vi.unstubAllGlobals());

interface Peticion {
  url: string | URL | Request;
  opciones: RequestInit;
}

const CURSO = {
  id: 8,
  titulo: "Alfabetización Digital",
  descripcion: "Uso de herramientas digitales",
  areaTematica: "Educación",
  unidadVecinal: "UV 01",
  fechaInicio: "2026-01-15",
  fechaTermino: "2026-06-30",
  estado: "EN_CURSO",
} as const;

const autorizacion = (peticion: Peticion | undefined) =>
  (peticion?.opciones.headers as Record<string, string> | undefined)?.Authorization;

describe("api/cursos", () => {
  it("listarCursos incluye el JWT y obtiene el catálogo activo", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(JSON.stringify([CURSO]), { status: 200 });
      }),
    );

    expect(await listarCursos("jwt")).toEqual([CURSO]);
    expect(peticion?.url).toBe("/api/cursos");
    expect(autorizacion(peticion)).toBe("Bearer jwt");
  });

  it("obtenerCurso consulta el detalle por id", async () => {
    let url: string | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (requestUrl: string) => {
        url = requestUrl;
        return new Response(JSON.stringify(CURSO), { status: 200 });
      }),
    );

    expect(await obtenerCurso(8, "jwt")).toEqual(CURSO);
    expect(url).toBe("/api/cursos/8");
  });

  it("crearCurso envía el contrato esperado mediante POST", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(JSON.stringify(CURSO), { status: 201 });
      }),
    );
    const datos = {
      titulo: CURSO.titulo,
      descripcion: CURSO.descripcion,
      areaTematica: CURSO.areaTematica,
      unidadVecinal: CURSO.unidadVecinal,
      fechaInicio: CURSO.fechaInicio,
      fechaTermino: CURSO.fechaTermino,
      estado: CURSO.estado,
    };

    expect(await crearCurso(datos, "jwt")).toEqual(CURSO);
    expect(peticion?.url).toBe("/api/cursos");
    expect(peticion?.opciones.method).toBe("POST");
    expect(autorizacion(peticion)).toBe("Bearer jwt");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual(datos);
  });

  it("editarCurso actualiza campos mediante PUT", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(JSON.stringify(CURSO), { status: 200 });
      }),
    );

    await editarCurso(8, { titulo: "Nuevo título" }, "jwt");
    expect(peticion?.url).toBe("/api/cursos/8");
    expect(peticion?.opciones.method).toBe("PUT");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual({ titulo: "Nuevo título" });
  });

  it("desactivarCurso usa PATCH en la ruta de desactivación", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(null, { status: 204 });
      }),
    );

    await desactivarCurso(8, "jwt");
    expect(peticion?.url).toBe("/api/cursos/8/desactivar");
    expect(peticion?.opciones.method).toBe("PATCH");
    expect(autorizacion(peticion)).toBe("Bearer jwt");
  });

  it("las operaciones conservan los errores de autorización del backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "Se requiere el rol ADMINISTRADOR", status: 403 }), {
          status: 403,
        }),
      ),
    );

    const promesa = crearCurso(
      {
        titulo: CURSO.titulo,
        areaTematica: CURSO.areaTematica,
        unidadVecinal: CURSO.unidadVecinal,
        fechaInicio: CURSO.fechaInicio,
        fechaTermino: CURSO.fechaTermino,
        estado: "PLANIFICADO",
      },
      "jwt",
    );

    await expect(promesa).rejects.toBeInstanceOf(ApiError);
    await expect(promesa).rejects.toMatchObject({
      status: 403,
      message: "Se requiere el rol ADMINISTRADOR",
    });
  });
});
