import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

type Props = ComponentProps<typeof CursoForm>;

const renderForm = (props: Partial<Props> = {}) =>
  render(
    <CursoForm
      curso={null}
      guardando={false}
      errorServidor={null}
      sugerencias={{ areas: ["Educación"], unidades: ["UV 01"] }}
      onGuardar={vi.fn()}
      onCancelar={vi.fn()}
      {...props}
    />,
  );

// jsdom no implementa estas APIs; el formulario las usa al abrirse y en el diálogo de descarte
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
});

describe("CursoForm", () => {
  it("valida los campos obligatorios y no llama a onGuardar", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    renderForm({ onGuardar });

    await user.click(screen.getByRole("button", { name: /crear curso/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/revisa 5 campos antes de guardar/i);
    expect(screen.getByText("Escribe el título del curso.")).toBeInTheDocument();
    expect(screen.getByText("Indica el área temática, por ejemplo «Educación».")).toBeInTheDocument();
    expect(screen.getByText("Indica la unidad vecinal donde se realiza el curso.")).toBeInTheDocument();
    expect(screen.getByText("Elige una fecha de inicio válida.")).toBeInTheDocument();
    expect(screen.getByText("Elige una fecha de término válida.")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("rechaza una fecha de término anterior a la de inicio", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { target: { value: "2026-06-30" } });
    fireEvent.change(screen.getByLabelText(/fecha de término/i), { target: { value: "2026-02-01" } });

    expect(await screen.findByText(/no puede ser anterior al inicio \(30 de junio de 2026\)/)).toBeInTheDocument();
  });

  it("envía los datos normalizados cuando el formulario es válido", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    renderForm({ onGuardar });

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

  it("notifica la cancelación si no hay cambios", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    renderForm({ onCancelar });

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("pide confirmación antes de descartar lo escrito", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    renderForm({ onCancelar });

    await user.type(screen.getByLabelText(/título/i), "Borrador");
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancelar).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /descartar/i }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el formulario mientras guarda", () => {
    renderForm({ guardando: true });

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
    expect(screen.getByLabelText(/título/i)).toBeDisabled();
  });

  it("precarga los datos al editar un curso", () => {
    renderForm({ curso });

    expect(screen.getByRole("heading", { name: /editar curso/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toHaveValue(curso.titulo);
    expect(screen.getByLabelText(/área temática/i)).toHaveValue(curso.areaTematica);
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });
});
