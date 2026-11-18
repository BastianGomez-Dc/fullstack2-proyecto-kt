// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/api/client";
import { enviarNotificacionManual, getHistorial } from "../src/api/notifications";

afterEach(() => vi.unstubAllGlobals());

interface Peticion {
  url: string | URL | Request;
  opciones: RequestInit;
}

const autorizacion = (peticion: Peticion | undefined) =>
  (peticion?.opciones.headers as Record<string, string> | undefined)?.Authorization;

const respuestaOk = () =>
  new Response(JSON.stringify({ mensaje: "Notificación enviada", enviadoEn: "2026-11-13T22:00:00" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("api/notifications", () => {
  it("enviarNotificacionManual envía el token y los roles seleccionados al endpoint", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return respuestaOk();
      }),
    );

    const respuesta = await enviarNotificacionManual(
      { titulo: "Aviso", cuerpo: "Mensaje", roles: ["VOLUNTARIO"] },
      "jwt-de-prueba",
    );

    expect(peticion?.url).toBe("/api/notifications/manual");
    expect(peticion?.opciones.method).toBe("POST");
    expect(autorizacion(peticion)).toBe("Bearer jwt-de-prueba");
    expect(JSON.parse(String(peticion?.opciones.body))).toEqual({
      titulo: "Aviso",
      cuerpo: "Mensaje",
      roles: ["VOLUNTARIO"],
    });
    expect(respuesta.mensaje).toBe("Notificación enviada");
  });

  it("enviarNotificacionManual permite roles vacíos para notificar a todos", async () => {
    let cuerpo: { roles?: string[] } | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, opciones: RequestInit) => {
        cuerpo = JSON.parse(String(opciones.body));
        return respuestaOk();
      }),
    );

    await enviarNotificacionManual({ titulo: "Aviso", cuerpo: "Mensaje", roles: [] }, "jwt");
    expect(cuerpo?.roles).toEqual([]);
  });

  it("enviarNotificacionManual conserva el error de permisos 403", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "No tienes permisos para realizar esta acción." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const promesa = enviarNotificacionManual({ titulo: "Aviso", cuerpo: "Mensaje", roles: [] }, "jwt");
    await expect(promesa).rejects.toBeInstanceOf(ApiError);
    await expect(promesa).rejects.toMatchObject({ status: 403 });
  });

  it("getHistorial envía el token y acepta el array vacío del backend", async () => {
    let peticion: Peticion | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opciones: RequestInit) => {
        peticion = { url, opciones };
        return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
      }),
    );

    expect(await getHistorial("jwt-de-prueba")).toEqual([]);
    expect(peticion?.url).toBe("/api/notifications/historial");
    expect(autorizacion(peticion)).toBe("Bearer jwt-de-prueba");
  });
});
