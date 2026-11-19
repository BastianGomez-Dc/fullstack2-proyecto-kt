import { Link } from "wouter";
import Icon from "../../components/atoms/Icon";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Primera vista migrada a Tailwind (integración incremental; luego se sumaron Logo, Alerta,
// Card, Footer, RequireAuth y el historial de notificaciones). Los colores y radios se toman de
// los tokens de index.css; el resto de la app sigue con CSS Modules.
const NotFound = () => {
  useDocumentTitle("Página no encontrada");
  return (
    <main
      id="contenido"
      className="flex-1 grid place-items-center py-16 px-4"
    >
      <div className="flex flex-col items-center max-w-[28rem] text-center">
        <span className="grid place-items-center w-[72px] h-[72px] text-[var(--color-primario)] bg-[var(--color-primario-suave)] rounded-[var(--radio-xl)]">
          <Icon nombre="ticket" tamano={32} />
        </span>
        <p className="mt-6 text-[0.8125rem] font-bold tracking-[0.1em] uppercase text-[var(--color-primario)]">
          Error 404
        </p>
        <h1 className="mt-2 font-extrabold text-[clamp(1.75rem,1.4rem+1.5vw,2.25rem)]">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-[var(--color-texto-suave)]">
          Puede que el enlace esté incompleto o que la página ya no exista.
        </p>
        <Link
          className="inline-flex items-center gap-2 min-h-12 mt-8 px-[1.375rem] font-bold text-white no-underline bg-[var(--color-primario)] rounded-[var(--radio-pildora)] hover:bg-[var(--color-primario-fuerte)]"
          href="/"
        >
          <Icon nombre="flechaIzquierda" tamano={18} />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
