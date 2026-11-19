// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  confirmarRegistro,
  mensajeDeRegistro,
  reenviarCodigo,
  registrarUsuario,
} from "../src/api/registro";

afterEach(() => vi.unstubAllGlobals());

interface Peticion {
  url: string | URL | Request;
  opciones: RequestInit;
}

describe("api/registro", () => {
  it("registrarUsuario envía nombre, correo, teléfono y contraseña a /api/auth/registro, sin rol", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(
          JSON.stringify({
            id: 7,
            username: "sub-1",
            nombre: "Ana",
            email: "ana@syncpass.cl",
            rol: "BENEFICIARIO",
            activo: true,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    const usuario = await registrarUsuario({
      nombre: "Ana",
      email: "ana@syncpass.cl",
      telefono: "+56912345678",
      password: "Clave#2026",
    });

    expect(peticion?.url).toBe("/api/auth/registro");
    expect(peticion?.opciones.method).toBe("POST");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual({
      nombre: "Ana",
      email: "ana@syncpass.cl",
      telefono: "+56912345678",
      password: "Clave#2026",
    });
    expect(usuario.rol).toBe("BENEFICIARIO");
  });

  it("confirmarRegistro acepta la respuesta 204 sin cuerpo", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(null, { status: 204 });
      }),
    );

    await confirmarRegistro({ email: "ana@syncpass.cl", codigo: "123456" });
    expect(peticion?.url).toBe("/api/auth/registro/confirmar");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual({
      email: "ana@syncpass.cl",
      codigo: "123456",
    });
  });

  it("reenviarCodigo envía solo el correo en el cuerpo", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response(null, { status: 204 });
      }),
    );

    await reenviarCodigo({ email: "ana@syncpass.cl" });
    expect(peticion?.url).toBe("/api/auth/registro/reenviar-codigo");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual({ email: "ana@syncpass.cl" });
  });

  it("mensajeDeRegistro muestra el error del backend o uno de conexión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "Ya existe una cuenta con ese email" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const error = await registrarUsuario({
      nombre: "Ana",
      email: "ana@syncpass.cl",
      telefono: "+56912345678",
      password: "Clave#2026",
    }).catch((e: unknown) => e);

    expect(mensajeDeRegistro(error)).toBe("Ya existe una cuenta con ese email");
    expect(mensajeDeRegistro(new TypeError("Failed to fetch"))).toMatch(/No pudimos conectar/);
  });
});
