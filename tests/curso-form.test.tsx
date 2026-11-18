import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CursoForm from "../src/components/organisms/CursoForm";

const curso = {
  id: 8,
  titulo: "Alfabetización Digital",
  descripcion: "Uso de herramientas digitales",
  areaTematica: "Educación",
  unidadVecinal: "UV 01",
  fechaInicio: "2026-01-15",
  fechaTermino: "2026-06-30",
  estado: "EN_CURSO" as const,
};

describe("CursoForm", () => {
  it("valida los campos obligatorios y no llama a onGuardar", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    render(<CursoForm curso={null} guardando={false} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /crear curso/i }));

    expect(await screen.findByText("El título es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El área temática es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("La unidad vecinal es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de inicio es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de término es obligatoria.")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("envía los datos normalizados cuando el formulario es válido", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    render(<CursoForm curso={null} guardando={false} onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await user.type(screen.getByLabelText(/título/i), "  Curso de prueba  ");
    await user.type(screen.getByLabelText(/área temática/i), "  Educación  ");
    await user.type(screen.getByLabelText(/unidad vecinal/i), "  UV 01  ");
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: "2026-02-01" } });
    fireEvent.change(screen.getByLabelText(/fecha de término/i), { target: { value: "2026-06-30" } });
    fireEvent.change(screen.getByLabelText(/estado/i), { target: { value: "EN_CURSO" } });
    await user.click(screen.getByRole("button", { name: /crear curso/i }));

    await waitFor(() => {
      expect(onGuardar).toHaveBeenCalledWith({
        titulo: "Curso de prueba",
        descripcion: undefined,
        areaTematica: "Educación",
        unidadVecinal: "UV 01",
        fechaInicio: "2026-02-01",
        fechaTermino: "2026-06-30",
        estado: "EN_CURSO",
      });
    });
  });

  it("notifica la cancelación", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    render(<CursoForm curso={null} guardando={false} onGuardar={vi.fn()} onCancelar={onCancelar} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el formulario mientras guarda", () => {
    render(<CursoForm curso={null} guardando onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
    expect(screen.getByLabelText(/título/i)).toBeDisabled();
  });

  it("precarga los datos al editar un curso", () => {
    render(<CursoForm curso={curso} guardando={false} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /editar curso/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toHaveValue(curso.titulo);
    expect(screen.getByLabelText(/área temática/i)).toHaveValue(curso.areaTematica);
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });
});
