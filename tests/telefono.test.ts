// @vitest-environment node
import { describe, expect, it } from "vitest";
import { esTelefonoValido, normalizarTelefono } from "../src/utils/telefono";

describe("utils/telefono", () => {
  it("normalizarTelefono deja los celulares chilenos en formato E.164", () => {
    expect(normalizarTelefono("9 1234 5678")).toBe("+56912345678");
    expect(normalizarTelefono("+56 9 1234-5678")).toBe("+56912345678");
    expect(normalizarTelefono("56912345678")).toBe("+56912345678");
    expect(normalizarTelefono("+1 (415) 555-0100")).toBe("+14155550100");
    expect(normalizarTelefono("12345")).toBe("12345");
  });

  it("esTelefonoValido acepta solo E.164 (+, código de país y 8 a 15 dígitos)", () => {
    expect(esTelefonoValido("+56912345678")).toBe(true);
    expect(esTelefonoValido("+14155550100")).toBe(true);
    expect(esTelefonoValido("912345678")).toBe(false);
    expect(esTelefonoValido("+0912345678")).toBe(false);
    expect(esTelefonoValido("+56 9 1234 5678")).toBe(false);
    expect(esTelefonoValido(normalizarTelefono("9 1234 5678"))).toBe(true);
  });
});
