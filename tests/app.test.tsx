import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock("../src/auth/AuthContext", () => ({ useAuth: mocks.useAuth }));

import App from "../src/App";

const visitante = {
  token: null,
  usuario: null,
  isAuthenticated: false,
  isReady: true,
  isLoading: false,
  error: null,
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
};

describe("App (render básico)", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    mocks.useAuth.mockReturnValue(visitante);
  });

  it("renderiza la portada pública en la ruta raíz", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("De tu curso a la acreditación");
    expect(document.title).toBe("SyncPass");
  });

  it("renderiza la vista 404 para una ruta desconocida", async () => {
    window.history.pushState({}, "", "/ruta-inexistente");
    render(<App />);

    // Las páginas fuera de la portada se cargan de forma diferida (React.lazy)
    expect(await screen.findByRole("heading", { name: /no encontramos esta página/i })).toBeInTheDocument();
    expect(document.title).toBe("Página no encontrada");
  });
});
