import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
  navigate: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href}>{children}</a>,
  useLocation: () => ["/login", mocks.navigate],
}));

vi.mock("../src/auth/AuthContext", () => ({ useAuth: mocks.useAuth }));

import { MENSAJE_CUENTA_NO_CONFIRMADA } from "../src/auth/cognito";
import Login from "../src/pages/login/Login";

describe("Login", () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isReady: true,
      isLoading: false,
      error: null,
      iniciarSesion: mocks.iniciarSesion,
      cerrarSesion: mocks.cerrarSesion,
    });
    mocks.iniciarSesion.mockResolvedValue(false);
  });

  it("valida los campos vacíos sin llamar a autenticación", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Escribe tu correo para continuar.")).toBeInTheDocument();
    expect(screen.getByText("Escribe tu contraseña para continuar.")).toBeInTheDocument();
    expect(mocks.iniciarSesion).not.toHaveBeenCalled();
  });

  it("autentica y navega al inicio cuando las credenciales son válidas", async () => {
    mocks.iniciarSesion.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@syncpass.cl");
    await user.type(screen.getByLabelText("Contraseña", { selector: "input" }), "Clave#2026");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mocks.iniciarSesion).toHaveBeenCalledWith("ana@syncpass.cl", "Clave#2026");
      expect(mocks.navigate).toHaveBeenCalledWith("/");
    });
  });

  it("muestra el error de cuenta sin confirmar con acceso directo a confirmación", () => {
    mocks.useAuth.mockReturnValue({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isReady: true,
      isLoading: false,
      error: MENSAJE_CUENTA_NO_CONFIRMADA,
      iniciarSesion: mocks.iniciarSesion,
      cerrarSesion: mocks.cerrarSesion,
    });
    render(<Login />);

    expect(screen.getByRole("alert")).toHaveTextContent(MENSAJE_CUENTA_NO_CONFIRMADA);
    expect(screen.getByRole("link", { name: /confirmar mi cuenta/i })).toHaveAttribute(
      "href",
      "/register?confirmar=1",
    );
  });

  it("muestra el estado de sesión iniciada y permite cerrarla", async () => {
    mocks.useAuth.mockReturnValue({
      token: "jwt",
      usuario: { id: "1", username: "ana", nombre: "Ana Muñoz", rol: "BENEFICIARIO" },
      isAuthenticated: true,
      isReady: true,
      isLoading: false,
      error: null,
      iniciarSesion: mocks.iniciarSesion,
      cerrarSesion: mocks.cerrarSesion,
    });
    const user = userEvent.setup();
    render(<Login />);

    expect(screen.getByRole("heading", { name: /ya iniciaste sesión/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    expect(mocks.cerrarSesion).toHaveBeenCalledTimes(1);
  });
});
