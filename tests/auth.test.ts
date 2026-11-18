// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "../src/api/client";

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest", () => {
  it("devuelve la respuesta exitosa del backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            token: "token-de-prueba",
            usuario: { id: "1", username: "juan_perez", rol: "COORDINADOR" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const data = await apiRequest<{ token: string }>("/auth/login", {
      method: "POST",
      body: { username: "juan_perez", password: "Password123" },
    });

    expect(data.token).toBe("token-de-prueba");
  });

  it("lanza ApiError con el mensaje del backend cuando la respuesta falla", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: "El usuario o la contraseña no son correctos." }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const promesa = apiRequest("/auth/login", {
      method: "POST",
      body: { username: "juan_perez", password: "incorrecta" },
    });

    await expect(promesa).rejects.toBeInstanceOf(ApiError);
    await expect(promesa).rejects.toThrow("El usuario o la contraseña no son correctos.");
  });
});
