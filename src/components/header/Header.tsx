import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../auth/AuthContext";
import Icon from "../icon/Icon";
import Logo from "../logo/Logo";
import styles from "./Header.module.css";

// Las secciones viven en el inicio; con BASE_URL funcionan también en GitHub Pages
const INICIO = import.meta.env.BASE_URL;
const SECCIONES = [
  { href: `${INICIO}#cursos`, texto: "Cursos" },
  { href: `${INICIO}#como-funciona`, texto: "Cómo funciona" },
  { href: `${INICIO}#preguntas`, texto: "Preguntas" },
];

const Header = () => {
  const [ubicacion] = useLocation();
  const { usuario, isAuthenticated, cerrarSesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const idMenu = useId();

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  const cerrarMenu = () => setAbierto(false);
  const actual = (ruta: string) => (ubicacion === ruta ? "page" : undefined);
  const nombreVisible = usuario?.nombre?.split(" ")[0] ?? usuario?.username ?? "Mi cuenta";

  return (
    <header className={styles.encabezado}>
      <div className={`container ${styles.barra}`}>
        <Link href="/" className={styles.marca} onClick={cerrarMenu} aria-label="SyncPass, ir al inicio">
          <Logo />
        </Link>

        <button
          type="button"
          className={styles.botonMenu}
          aria-expanded={abierto}
          aria-controls={idMenu}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((valor) => !valor)}
        >
          <Icon nombre={abierto ? "x" : "menu"} tamano={22} />
        </button>

        <div id={idMenu} className={styles.menu} data-abierto={abierto || undefined}>
          <nav aria-label="Principal">
            <ul className={styles.enlaces}>
              <li>
                <Link href="/" className={styles.enlace} aria-current={actual("/")} onClick={cerrarMenu}>
                  Inicio
                </Link>
              </li>
              {SECCIONES.map((seccion) => (
                <li key={seccion.href}>
                  <a href={seccion.href} className={styles.enlace} onClick={cerrarMenu}>
                    {seccion.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.acciones}>
            {isAuthenticated ? (
              <>
                <span className={styles.usuario}>
                  <span className={styles.avatar} aria-hidden="true">
                    {nombreVisible.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="sr-only">Sesión iniciada como </span>
                    {nombreVisible}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles.botonSecundario}
                  onClick={() => {
                    cerrarMenu();
                    cerrarSesion();
                  }}
                >
                  <Icon nombre="salir" tamano={18} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.botonSecundario} aria-current={actual("/login")} onClick={cerrarMenu}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className={styles.botonPrimario} aria-current={actual("/register")} onClick={cerrarMenu}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
