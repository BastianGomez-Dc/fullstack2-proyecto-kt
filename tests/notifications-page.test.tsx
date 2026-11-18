import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  enviar: vi.fn(),
  getHistorial: vi.fn(),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
}));

vi.mock("../src/auth/AuthContext", () => ({ useAuth: mocks.useAuth }));

vi.mock("../src/api/notifications", () => ({
  ROLES: ["ADMINISTRADOR", "COORDINADOR", "VOLUNTARIO", "BENEFICIARIO"],
  enviarNotificacionManual: mocks.enviar,
  getHistorial: mocks.getHistorial,
}));

import Notifications from "../src/pages/notifications/Notifications";

const sesion = (rol?: string) => ({
  token: "jwt-de-prueba",
  usuario: rol ? { id: "1", username: "ana", rol } : null,
  isAuthenticated: Boolean(rol),
  isReady: true,
  isLoading: false,
  error: null,
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
});

describe("Notifications", () => {
  beforeEach(() => {
    mocks.getHistorial.mockResolvedValue([]);
    mocks.enviar.mockResolvedValue({ mensaje: "Notificación enviada", enviadoEn: "2026-11-13T22:00:00" });
    mocks.useAuth.mockReturnValue(sesion("ADMINISTRADOR"));
  });

  it("muestra el estado de carga mientras se restaura la sesión", () => {
    mocks.useAuth.mockReturnValue({ ...sesion(), isReady: false });
    render(<Notifications />);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando la sesión…");
    expect(mocks.getHistorial).not.toHaveBeenCalled();
  });

  it("pide iniciar sesión a un visitante", () => {
    mocks.useAuth.mockReturnValue(sesion());
    render(<Notifications />);

    expect(screen.getByRole("heading", { name: /inicia sesión para continuar/i })).toBeInTheDocument();
    expect(mocks.getHistorial).not.toHaveBeenCalled();
  });

  it("niega el acceso a un usuario autenticado que no es administrador", () => {
    mocks.useAuth.mockReturnValue(sesion("VOLUNTARIO"));
    render(<Notifications />);

    expect(screen.getByRole("heading", { name: /acceso denegado/i })).toBeInTheDocument();
    expect(mocks.getHistorial).not.toHaveBeenCalled();
  });

  it("muestra el panel y carga el historial para un administrador", async () => {
    render(<Notifications />);

    expect(screen.getByRole("heading", { name: /notificaciones push/i })).toBeInTheDocument();
    await waitFor(() => expect(mocks.getHistorial).toHaveBeenCalledWith("jwt-de-prueba"));
    expect(await screen.findByText(/aún no hay notificaciones en el historial/i)).toBeInTheDocument();
  });

  it("valida título y cuerpo antes de enviar", () => {
    render(<Notifications />);

    // fireEvent.submit evita la validación nativa (required) y ejercita el handler.
    const formulario = screen.getByRole("button", { name: /enviar notificación/i }).closest("form");
    fireEvent.submit(formulario!);

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe un título y un cuerpo");
    expect(mocks.enviar).not.toHaveBeenCalled();
  });

  it("envía la notificación con los roles seleccionados", async () => {
    const user = userEvent.setup();
    render(<Notifications />);

    await user.type(screen.getByLabelText(/^título$/i), "Recordatorio");
    await user.type(screen.getByLabelText(/cuerpo del mensaje/i), "El curso empieza el lunes");
    await user.click(screen.getByRole("checkbox", { name: "VOLUNTARIO" }));
    await user.click(screen.getByRole("button", { name: /enviar notificación/i }));

    await waitFor(() => {
      expect(mocks.enviar).toHaveBeenCalledWith(
        { titulo: "Recordatorio", cuerpo: "El curso empieza el lunes", roles: ["VOLUNTARIO"] },
        "jwt-de-prueba",
      );
    });
    expect(await screen.findByText("Notificación enviada")).toBeInTheDocument();
  });
});
