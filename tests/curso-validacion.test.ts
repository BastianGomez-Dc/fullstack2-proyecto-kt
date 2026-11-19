// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Curso } from "../src/api/cursos";
import {
  describirDuracion,
  duracionEnDias,
  formatearFecha,
  ordenarCursos,
  validarCurso,
  valoresUnicos,
} from "../src/components/organisms/curso";

const VALIDO = {
  titulo: "Alfabetización Digital",
  descripcion: "",
  areaTematica: "Educación",
  unidadVecinal: "UV 01",
  fechaInicio: "2027-03-01",
  fechaTermino: "2027-06-30",
  estado: "PLANIFICADO",
} as const;

describe("validarCurso", () => {
  it("un curso completo no tiene errores", () => {
    expect(validarCurso(VALIDO)).toEqual({});
  });

  it("la fecha de término no puede ser anterior a la de inicio", () => {
    const errores = validarCurso({ ...VALIDO, fechaInicio: "2027-06-30", fechaTermino: "2027-03-01" });
    expect(errores.fechaTermino).toMatch(/no puede ser anterior al inicio \(30 de junio de 2027\)/);
    expect(errores.fechaInicio).toBeUndefined();
  });

  it("inicio y término el mismo día es válido", () => {
    expect(validarCurso({ ...VALIDO, fechaTermino: VALIDO.fechaInicio })).toEqual({});
  });

  it("fechas vacías o imposibles se rechazan", () => {
    const vacias = validarCurso({ ...VALIDO, fechaInicio: "", fechaTermino: "" });
    expect(vacias.fechaInicio).toBe("Elige una fecha de inicio válida.");
    expect(vacias.fechaTermino).toBe("Elige una fecha de término válida.");
    expect(validarCurso({ ...VALIDO, fechaTermino: "2027-02-30" }).fechaTermino).toBeTruthy();
  });

  it("campos obligatorios en blanco y límites de largo", () => {
    const errores = validarCurso({
      ...VALIDO,
      titulo: "   ",
      areaTematica: "",
      unidadVecinal: "x".repeat(101),
      descripcion: "x".repeat(1001),
    });
    expect(errores.titulo).toBe("Escribe el título del curso.");
    expect(errores.areaTematica).toBeTruthy();
    expect(errores.unidadVecinal).toMatch(/100 caracteres/);
    expect(errores.descripcion).toMatch(/1000 caracteres/);
  });
});

describe("utilidades de curso", () => {
  it("la duración cuenta ambos días y es nula si las fechas están invertidas", () => {
    expect(duracionEnDias("2027-03-01", "2027-03-01")).toBe(1);
    expect(duracionEnDias("2027-03-01", "2027-03-14")).toBe(14);
    // Cruza el cambio de horario de Chile sin perder ni ganar un día
    expect(duracionEnDias("2027-04-01", "2027-04-30")).toBe(30);
    expect(duracionEnDias("2027-03-14", "2027-03-01")).toBeNull();
    expect(duracionEnDias("", "2027-03-01")).toBeNull();
    expect(describirDuracion(1)).toBe("1 día");
    expect(describirDuracion(5)).toBe("5 días");
    expect(describirDuracion(30)).toBe("30 días (≈ 4 semanas)");
  });

  it("las fechas se muestran en español sin corrimiento de zona horaria", () => {
    expect(formatearFecha("2027-03-01", "largo")).toBe("1 de marzo de 2027");
    expect(formatearFecha("2027-01-01", "largo")).toBe("1 de enero de 2027");
    expect(formatearFecha("no-es-fecha")).toBe("no-es-fecha");
  });

  it("ordenarCursos sigue el orden del backend: fecha de inicio y luego id", () => {
    const cursos = [
      { id: 3, fechaInicio: "2027-05-01" },
      { id: 2, fechaInicio: "2027-01-01" },
      { id: 1, fechaInicio: "2027-05-01" },
    ] as Curso[];
    expect(ordenarCursos(cursos).map((curso) => curso.id)).toEqual([2, 1, 3]);
  });

  it("valoresUnicos quita duplicados sin importar mayúsculas y ordena", () => {
    expect(valoresUnicos(["Salud", "educación", "Educación ", "", "Arte"])).toEqual(["Arte", "educación", "Salud"]);
  });
});
