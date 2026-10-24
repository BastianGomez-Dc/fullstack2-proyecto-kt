import { Link } from "wouter";
import Logo from "../logo/Logo";
import styles from "./Footer.module.css";

const INICIO = import.meta.env.BASE_URL;

const Footer = () => (
  <footer className={styles.pie}>
    <div className={`container ${styles.grilla}`}>
      <div className={styles.marca}>
        <Logo claro />
        <p className={styles.descripcion}>Inscripciones, códigos QR y acreditación de cursos en un solo lugar.</p>
      </div>

      <nav aria-labelledby="pie-plataforma">
        <h2 id="pie-plataforma" className={styles.tituloColumna}>Plataforma</h2>
        <ul className={styles.lista}>
          <li><Link href="/">Inicio</Link></li>
          <li><a href={`${INICIO}#cursos`}>Cursos</a></li>
          <li><a href={`${INICIO}#como-funciona`}>Cómo funciona</a></li>
          <li><a href={`${INICIO}#preguntas`}>Preguntas frecuentes</a></li>
        </ul>
      </nav>

      <nav aria-labelledby="pie-cuenta">
        <h2 id="pie-cuenta" className={styles.tituloColumna}>Tu cuenta</h2>
        <ul className={styles.lista}>
          <li><Link href="/login">Iniciar sesión</Link></li>
          <li><Link href="/register">Crear cuenta</Link></li>
          <li><Link href="/register?confirmar=1">Confirmar cuenta</Link></li>
        </ul>
      </nav>
    </div>

    <div className="container">
      <p className={styles.abajo}>© {new Date().getFullYear()} SyncPass. Registro y acreditación de cursos.</p>
    </div>
  </footer>
);

export default Footer;
