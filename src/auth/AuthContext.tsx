import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cerrarSesionCognito,
  CognitoError,
  iniciarSesionCognito,
  obtenerSesion,
  type Usuario,
} from "./cognito";

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
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Amplify guarda la sesión de Cognito en localStorage y renueva los tokens solo
  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const sesion = await obtenerSesion();
        if (activo && sesion) {
          setToken(sesion.token);
          setUsuario(sesion.usuario);
        }
      } catch {
        // Sin sesión válida: se queda como visitante
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
        const sesion = await iniciarSesionCognito(username, password);
        setToken(sesion.token);
        setUsuario(sesion.usuario);
        return true;
      } catch (e) {
        setError(
          e instanceof CognitoError
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
    void cerrarSesionCognito();
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
