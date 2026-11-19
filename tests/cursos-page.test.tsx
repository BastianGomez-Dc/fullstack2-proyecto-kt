import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/api/client";
import type { Curso } from "../src/api/cursos";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  listar: vi.fn(),
  crear: vi.fn(),
  editar: vi.fn(),
  desactivar: vi.fn(),
}));

vi.mock("../src/contexts/AuthContext", () => ({ useAuth: mocks.useAuth }));

// Se conservan las constantes reales (ESTADOS_CURSO) y se simulan solo las llamadas HTTP
vi.mock("../src/api/cursos", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/api/cursos")>()),
  listarCursos: mocks.listar,
  crearCurso: mocks.crear,
  editarCurso: mocks.editar,
  desactivarCurso: mocks.desactivar,
}));

import Cursos from "../src/pages/cursos/Cursos";

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
    fechaTermino: "2027-06-30",
    estado: "EN_CURSO",
  },
];

const sesion = (rol: string) => ({
  token: "jwt-de-prueba",
  usuario: { id: "1", username: "ana", rol },
  isAuthenticated: true,
  isReady: true,
  isLoading: false,
  error: null,
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
});

// jsdom no implementa <dialog>.showModal ni scrollIntoView (los usan Dialogo y CursoForm)
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  mocks.useAuth.mockReturnValue(sesion("ADMINISTRADOR"));
  mocks.listar.mockResolvedValue(CURSOS);
});

describe("Cursos (página)", () => {
  it("lista los cursos activos con las acciones del administrador", async () => {
    render(<Cursos />);

    expect(await screen.findByRole("button", { name: "Huertos urbanos" })).toBeInTheDocument();
    expect(mocks.listar).toHaveBeenCalledWith("jwt-de-prueba");
    expect(screen.getByText("2 cursos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nuevo curso/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar Huertos urbanos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desactivar Huertos urbanos" })).toBeInTheDocument();
  });

  it("a otros roles solo les permite consultar", async () => {
    mocks.useAuth.mockReturnValue(sesion("VOLUNTARIO"));
    render(<Cursos />);

    expect(await screen.findByRole("button", { name: "Huertos urbanos" })).toBeInTheDocument();
    expect(screen.getByText("Consulta los cursos activos y sus detalles.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /nuevo curso/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^desactivar/i })).not.toBeInTheDocument();
  });

  it("abre el detalle del curso en un diálogo", async () => {
    const user = userEvent.setup();
    render(<Cursos />);

    await user.click(await screen.findByRole("button", { name: "Ver detalle de Huertos urbanos" }));

    const dialogo = screen.getByRole("dialog", { name: "Huertos urbanos" });
    expect(within(dialogo).getByText("Cultivo en espacios pequeños")).toBeInTheDocument();
    expect(within(dialogo).getByText("1 de marzo de 2027")).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: /editar curso/i })).toBeInTheDocument();
  });

  it("desactiva un curso tras confirmarlo en el diálogo", async () => {
    const user = userEvent.setup();
    mocks.desactivar.mockResolvedValue(undefined);
    render(<Cursos />);

    await user.click(await screen.findByRole("button", { name: "Desactivar Huertos urbanos" }));
    const dialogo = screen.getByRole("dialog", { name: "¿Desactivar este curso?" });
    expect(dialogo).toHaveTextContent("pasará a Finalizado");

    await user.click(within(dialogo).getByRole("button", { name: "Desactivar" }));

    await waitFor(() => expect(mocks.desactivar).toHaveBeenCalledWith(7, "jwt-de-prueba"));
    expect(await screen.findByText("Se desactivó «Huertos urbanos».")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ver detalle de Huertos urbanos" })).not.toBeInTheDocument();
  });

  it("crea un curso con el formulario y lo agrega al listado", async () => {
    const user = userEvent.setup();
    const nuevo: Curso = {
      id: 9,
      titulo: "Primeros auxilios",
      descripcion: null,
      areaTematica: "Salud",
      unidadVecinal: "UV 02",
      fechaInicio: "2027-05-10",
      fechaTermino: "2027-05-10",
      estado: "PLANIFICADO",
    };
    mocks.crear.mockResolvedValue(nuevo);
    render(<Cursos />);

    await user.click(await screen.findByRole("button", { name: /nuevo curso/i }));
    // El formulario se descarga aparte (React.lazy)
    expect(await screen.findByRole("heading", { name: "Nuevo curso" })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/título/i), "Primeros auxilios");
    await user.type(screen.getByLabelText(/área temática/i), "Salud");
    await user.type(screen.getByLabelText(/unidad vecinal/i), "UV 02");
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: "2027-05-10" } });
    fireEvent.change(screen.getByLabelText(/fecha de término/i), { target: { value: "2027-05-10" } });
    await user.click(screen.getByRole("button", { name: /crear curso/i }));

    await waitFor(() =>
      expect(mocks.crear).toHaveBeenCalledWith(
        {
          titulo: "Primeros auxilios",
          descripcion: undefined,
          areaTematica: "Salud",
          unidadVecinal: "UV 02",
          fechaInicio: "2027-05-10",
          fechaTermino: "2027-05-10",
          estado: "PLANIFICADO",
        },
        "jwt-de-prueba",
      ),
    );
    expect(await screen.findByText("Se creó el curso «Primeros auxilios».")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Primeros auxilios" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nuevo curso" })).not.toBeInTheDocument();
  });

  it("muestra el error de carga y permite reintentar", async () => {
    const user = userEvent.setup();
    mocks.listar.mockRejectedValueOnce(new ApiError(403, "No tienes permisos para realizar esta acción."));
    render(<Cursos />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permisos para realizar esta acción.");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("button", { name: "Huertos urbanos" })).toBeInTheDocument();
    expect(mocks.listar).toHaveBeenCalledTimes(2);
  });

  it("invita al administrador a crear el primer curso cuando no hay ninguno", async () => {
    mocks.listar.mockResolvedValue([]);
    render(<Cursos />);

    expect(await screen.findByRole("heading", { name: "Aún no hay cursos activos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear el primer curso/i })).toBeInTheDocument();
  });
});
