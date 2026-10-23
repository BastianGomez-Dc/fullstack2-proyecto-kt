import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login, perfil, type Usuario } from "../api/auth";
import { ApiError } from "../api/client";

const TOKEN_KEY = "syncpass_token";

export interface AuthContextValue {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  iniciarSesion: (username: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenGuardado = sessionStorage.getItem(TOKEN_KEY);
    if (!tokenGuardado) {
      setToken(null);
      return;
    }

    let activo = true;
    void (async () => {
      try {
        const usuarioPerfil = await perfil(tokenGuardado);
        if (activo) {
          setUsuario(usuarioPerfil);
        }
      } catch {
        if (activo) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const respuesta = await login(username, password);
        setToken(respuesta.token);
        setUsuario(respuesta.usuario);
        sessionStorage.setItem(TOKEN_KEY, respuesta.token);
        return true;
      } catch (e) {
        setError(
          e instanceof ApiError
            ? e.message
            : "No pudimos conectar con el servidor de autenticación. Revisa tu conexión e intenta de nuevo.",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const cerrarSesion = useCallback(() => {
    setToken(null);
    setUsuario(null);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  const isAuthenticated = token !== null;

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      usuario,
      isAuthenticated,
      isLoading,
      error,
      iniciarSesion,
      cerrarSesion,
    }),
    [token, usuario, isAuthenticated, isLoading, error, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
