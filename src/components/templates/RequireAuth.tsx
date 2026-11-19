import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";

// Estilos con utilidades de Tailwind: ocupa el alto disponible y centra el mensaje de estado
const PAGINA = "flex-1 grid place-items-center py-16 px-4";
const ESTADO = "text-[var(--color-texto-suave)]";

interface RequireAuthProps {
  children: ReactNode;
  /** Roles permitidos. Si se omite, basta con tener sesión y token válidos. */
  roles?: readonly string[];
}

// Guard de ruta reutilizable: espera a que la sesión se restaure, exige token y,
// si se indican roles, exige que el usuario pertenezca a uno de ellos.
// La navegación con ruta absoluta respeta el `base` del <Router> de Wouter.
const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { isReady, isAuthenticated, token, usuario } = useAuth();
  const [, navigate] = useLocation();

  const rol = usuario?.rol;
  const permitidoPorRol = !roles || roles.length === 0 || (rol !== undefined && roles.includes(rol));
  const autorizado = isReady && isAuthenticated && Boolean(token) && permitidoPorRol;
  const redirigir = isReady && !autorizado;

  useEffect(() => {
    if (redirigir) {
      navigate("/login", { replace: true });
    }
  }, [redirigir, navigate]);

  if (!isReady) {
    return (
      <main id="contenido" className={PAGINA}>
        <p className={ESTADO} role="status">Verificando la sesión…</p>
      </main>
    );
  }

  if (redirigir) {
    return (
      <main id="contenido" className={PAGINA}>
        <p className={ESTADO} role="status">Redirigiendo al inicio de sesión…</p>
      </main>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
