import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("wouter", () => ({ useLocation: () => ["/cursos", mocks.navigate] }));
vi.mock("../src/auth/AuthContext", () => ({ useAuth: mocks.useAuth }));

import RequireAuth from "../src/components/templates/RequireAuth";

const sesion = {
  token: "jwt-de-prueba",
  usuario: { id: "1", username: "ana", rol: "ADMINISTRADOR" },
  isAuthenticated: true,
  isReady: true,
  isLoading: false,
  error: null,
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
};

const contenido = <p>Contenido protegido</p>;

describe("RequireAuth", () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue(sesion);
  });

  it("espera a que la sesión esté lista antes de decidir", () => {
    mocks.useAuth.mockReturnValue({ ...sesion, isReady: false });
    render(<RequireAuth>{contenido}</RequireAuth>);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando la sesión…");
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("redirige a /login cuando no hay sesión", () => {
    mocks.useAuth.mockReturnValue({ ...sesion, isAuthenticated: false, token: null, usuario: null });
    render(<RequireAuth>{contenido}</RequireAuth>);

    expect(screen.getByRole("status")).toHaveTextContent("Redirigiendo al inicio de sesión…");
    expect(mocks.navigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("redirige cuando la sesión no tiene token", () => {
    mocks.useAuth.mockReturnValue({ ...sesion, token: null });
    render(<RequireAuth>{contenido}</RequireAuth>);

    expect(mocks.navigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("renderiza los hijos para un usuario autenticado", () => {
    render(<RequireAuth>{contenido}</RequireAuth>);

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("redirige cuando el rol no está entre los permitidos", () => {
    mocks.useAuth.mockReturnValue({ ...sesion, usuario: { ...sesion.usuario, rol: "VOLUNTARIO" } });
    render(<RequireAuth roles={["ADMINISTRADOR"]}>{contenido}</RequireAuth>);

    expect(mocks.navigate).toHaveBeenCalledWith("/login", { replace: true });
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("acepta cualquiera de los roles indicados", () => {
    mocks.useAuth.mockReturnValue({ ...sesion, usuario: { ...sesion.usuario, rol: "COORDINADOR" } });
    render(<RequireAuth roles={["ADMINISTRADOR", "COORDINADOR"]}>{contenido}</RequireAuth>);

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
