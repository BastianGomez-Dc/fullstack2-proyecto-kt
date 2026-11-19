import { Link } from "wouter";
import Logo from "../atoms/Logo";

const INICIO = import.meta.env.BASE_URL;

// Estilos con utilidades de Tailwind (sin CSS Module). Los colores salen de los tokens de index.css;
// los tonos claros sobre el fondo oscuro (#d5e2dc, #a9bdb4) son los mismos del diseño anterior.
const TITULO_COLUMNA = "mb-4 text-[0.8125rem] font-bold tracking-[0.08em] uppercase text-white";
const LISTA = "grid gap-1 m-0 p-0 list-none";
const ENLACE =
  "inline-flex items-center min-h-9 text-[#d5e2dc] no-underline underline-offset-3 rounded-[4px] hover:text-white hover:underline focus-visible:outline-[color:var(--color-acento)]";

const Footer = () => (
  <footer className="pt-14 pb-6 text-[#d5e2dc] bg-[var(--color-primario-fuerte)]">
    {/* En pantallas angostas: dos columnas y la marca ocupa toda la fila */}
    <div className="container grid grid-cols-[1fr_1fr] gap-10 md:grid-cols-[2fr_1fr_1fr]">
      <div className="max-md:col-span-full">
        <Logo claro />
        <p className="max-w-[22rem] mt-4 leading-[1.6]">
          Inscripciones, códigos QR y acreditación de cursos en un solo lugar.
        </p>
      </div>

      <nav aria-labelledby="pie-plataforma">
        <h2 id="pie-plataforma" className={TITULO_COLUMNA}>Plataforma</h2>
        <ul className={LISTA}>
          <li><Link className={ENLACE} href="/">Inicio</Link></li>
          <li><a className={ENLACE} href={`${INICIO}#cursos`}>Cursos</a></li>
          <li><a className={ENLACE} href={`${INICIO}#como-funciona`}>Cómo funciona</a></li>
          <li><a className={ENLACE} href={`${INICIO}#preguntas`}>Preguntas frecuentes</a></li>
        </ul>
      </nav>

      <nav aria-labelledby="pie-cuenta">
        <h2 id="pie-cuenta" className={TITULO_COLUMNA}>Tu cuenta</h2>
        <ul className={LISTA}>
          <li><Link className={ENLACE} href="/login">Iniciar sesión</Link></li>
          <li><Link className={ENLACE} href="/register">Crear cuenta</Link></li>
          <li><Link className={ENLACE} href="/register?confirmar=1">Confirmar cuenta</Link></li>
        </ul>
      </nav>
    </div>

    <div className="container">
      <p className="mt-10 pt-6 text-[0.875rem] text-[#a9bdb4] border-t border-[rgba(255,255,255,0.12)]">
        © {new Date().getFullYear()} SyncPass. Registro y acreditación de cursos.
      </p>
    </div>
  </footer>
);

export default Footer;
