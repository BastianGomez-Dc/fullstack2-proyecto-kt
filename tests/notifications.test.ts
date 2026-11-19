// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/api/client";
import { enviarNotificacionManual, getHistorial, type HistorialResponse } from "../src/api/notifications";

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

  it("getHistorial devuelve los registros tipados según el HistorialItem del backend", async () => {
    const historial: HistorialResponse = [
      {
        id: 1,
        titulo: "Recordatorio",
        cuerpo: "El curso empieza el lunes",
        roles: ["VOLUNTARIO"],
        enviadoEn: "2026-11-13T22:00:00",
        dispositivosEnviados: 12,
      },
      { id: 2, titulo: "Aviso", cuerpo: "Para todos", roles: null, enviadoEn: "2026-11-14T08:30:00", dispositivosEnviados: 0 },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify(historial), { status: 200, headers: { "Content-Type": "application/json" } }),
      ),
    );

    const respuesta = await getHistorial("jwt");
    expect(respuesta).toEqual(historial);
    expect(respuesta[0].dispositivosEnviados).toBe(12);
  });

  it("getHistorial rechaza con 502 un historial que no cumple el contrato", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify([{ id: "1", titulo: "Sin campos" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const promesa = getHistorial("jwt");
    await expect(promesa).rejects.toBeInstanceOf(ApiError);
    await expect(promesa).rejects.toMatchObject({ status: 502 });
  });

  it("enviarNotificacionManual rechaza con 502 una respuesta sin mensaje", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })),
    );

    await expect(
      enviarNotificacionManual({ titulo: "Aviso", cuerpo: "Mensaje", roles: [] }, "jwt"),
    ).rejects.toMatchObject({ status: 502 });
  });
});
