// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mensajeDeError, mensajeDePaso, usuarioDesdeClaims } from "../src/auth/cognito";

describe("cognito (helpers sin red)", () => {
  it("usuarioDesdeClaims prefiere el correo cuando cognito:username es un UUID", () => {
    const usuario = usuarioDesdeClaims({
      sub: "a1b2",
      "cognito:username": "a1b2",
      email: "juan@syncpass.cl",
      name: "Juan Pérez",
      "cognito:groups": ["COORDINADOR"],
    });

    expect(usuario).toEqual({
      id: "a1b2",
      username: "juan@syncpass.cl",
      nombre: "Juan Pérez",
      rol: "COORDINADOR",
    });
  });

  it("usuarioDesdeClaims usa cognito:username si no hay correo ni grupos", () => {
    const usuario = usuarioDesdeClaims({ sub: "a1b2", "cognito:username": "juan_perez" });

    expect(usuario.username).toBe("juan_perez");
    expect(usuario.rol).toBeUndefined();
  });

  it("mensajeDeError traduce los errores de Cognito y usa uno genérico para el resto", () => {
    const credenciales = Object.assign(new Error("Incorrect username or password."), {
      name: "NotAuthorizedException",
    });

    expect(mensajeDeError(credenciales)).toBe("El usuario o la contraseña no son correctos.");
    expect(mensajeDeError(new TypeError("Failed to fetch"))).toMatch(/Revisa tu conexión/);
  });

  it("mensajeDePaso avisa cuando la cuenta tiene una contraseña temporal", () => {
    expect(mensajeDePaso("CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED")).toMatch(/contraseña temporal/);
  });
});
