// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  describirDestinatarios,
  describirDispositivos,
  formatearFechaHora,
} from "../src/utils/notificaciones";

describe("utils/notificaciones", () => {
  it("formatearFechaHora muestra el LocalDateTime del backend en español, con hora de 24 h", () => {
    const texto = formatearFechaHora("2026-11-13T22:00:00");
    expect(texto).toMatch(/13/);
    expect(texto).toMatch(/nov/);
    expect(texto).toMatch(/2026/);
    expect(texto).toMatch(/22:00/);
    // Sin segundos ni zona también es un LocalDateTime válido
    expect(formatearFechaHora("2026-11-14T08:30")).toMatch(/08:30/);
  });

  it("formatearFechaHora devuelve el texto original si no es una fecha y hora", () => {
    expect(formatearFechaHora("ayer")).toBe("ayer");
    expect(formatearFechaHora("2026-11-13")).toBe("2026-11-13");
    expect(formatearFechaHora("2026-13-45T99:99:00")).toBe("2026-13-45T99:99:00");
  });

  it("describirDestinatarios: roles vacíos o null significan todos los usuarios activos", () => {
    expect(describirDestinatarios(["VOLUNTARIO", "COORDINADOR"])).toBe("VOLUNTARIO, COORDINADOR");
    expect(describirDestinatarios([])).toBe("Todos los usuarios activos");
    expect(describirDestinatarios(null)).toBe("Todos los usuarios activos");
  });

  it("describirDispositivos usa singular y plural", () => {
    expect(describirDispositivos(1)).toBe("1 dispositivo");
    expect(describirDispositivos(0)).toBe("0 dispositivos");
    expect(describirDispositivos(12)).toBe("12 dispositivos");
  });
});
