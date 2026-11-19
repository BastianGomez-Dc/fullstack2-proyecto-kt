import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Curso } from "../src/api/cursos";

const mocks = vi.hoisted(() => ({ listarCursosRecientes: vi.fn() }));

vi.mock("../src/api/cursos", () => ({ listarCursosRecientes: mocks.listarCursosRecientes }));

import UltimosCursos from "../src/pages/home/UltimosCursos";

const CURSOS: Curso[] = [
  {
    id: 7,
    titulo: "Huertos urbanos",
    descripcion: "Cultivo en espacios pequeños",
    areaTematica: "Medio ambiente",
    unidadVecinal: "UV 03",
    fechaInicio: "2027-03-01",
    fechaTermino: "2027-03-28",
    estado: "PLANIFICADO",
  },
  {
    id: 5,
    titulo: "Alfabetización digital",
    descripcion: null,
    areaTematica: "Educación",
    unidadVecinal: "UV 01",
    fechaInicio: "2027-04-05",
    fechaTermino: "2027-04-05",
    estado: "EN_CURSO",
  },
];

describe("UltimosCursos (portada)", () => {
  beforeEach(() => {
    mocks.listarCursosRecientes.mockResolvedValue(CURSOS);
  });

  it("muestra el estado de carga mientras responde el endpoint público", () => {
    mocks.listarCursosRecientes.mockReturnValue(new Promise(() => {}));
    render(<UltimosCursos autenticado={false} />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando los últimos cursos…");
    expect(mocks.listarCursosRecientes).toHaveBeenCalledWith(3, expect.any(AbortSignal));
  });

  it("lista los últimos cursos e invita al visitante a inscribirse", async () => {
    render(<UltimosCursos autenticado={false} />);

    expect(await screen.findByRole("heading", { name: "Huertos urbanos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alfabetización digital" })).toBeInTheDocument();
    expect(screen.getByText("Planificado")).toBeInTheDocument();
    expect(screen.getByText("4 semanas", { exact: false })).toBeInTheDocument();
    // jsdom omite el espacio inicial del texto sr-only al calcular el nombre accesible
    expect(screen.getByRole("link", { name: /inscribirme\s*en huertos urbanos/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /ver todos los cursos/i })).toHaveAttribute("href", "/cursos");
  });

  it("al usuario autenticado lo lleva al detalle en /cursos", async () => {
    render(<UltimosCursos autenticado />);

    expect(await screen.findByRole("link", { name: /ver detalles\s*de huertos urbanos/i })).toHaveAttribute("href", "/cursos");
    expect(screen.queryByRole("link", { name: /inscribirme/i })).not.toBeInTheDocument();
  });

  it("muestra un estado vacío cuando aún no hay cursos", async () => {
    mocks.listarCursosRecientes.mockResolvedValue([]);
    render(<UltimosCursos autenticado={false} />);

    expect(await screen.findByText(/aún no hay cursos publicados/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver todos los cursos/i })).not.toBeInTheDocument();
  });

  it("ante un error permite reintentar la carga", async () => {
    const user = userEvent.setup();
    mocks.listarCursosRecientes.mockRejectedValueOnce(new Error("sin red"));
    render(<UltimosCursos autenticado={false} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar los cursos");
    await user.click(screen.getByRole("button", { name: /intentar de nuevo/i }));

    expect(await screen.findByRole("heading", { name: "Huertos urbanos" })).toBeInTheDocument();
    expect(mocks.listarCursosRecientes).toHaveBeenCalledTimes(2);
  });
});
