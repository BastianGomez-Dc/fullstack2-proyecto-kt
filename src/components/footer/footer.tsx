import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="pie">
      <div className="container">
        <div className="pie-grid">
          <div>
            <Link className="marca" href="/">SyncPass</Link>
            <p className="pie-descripcion">Inscripciones, códigos QR y acreditación de cursos en un solo lugar.</p>
          </div>
          <nav aria-labelledby="pie-plataforma">
            <h2 id="pie-plataforma">Plataforma</h2>
            <ul>
              <li><Link href="/">Inicio</Link></li>
              <li><a href="#cursos">Cursos</a></li>
            </ul>
          </nav>
          <nav aria-labelledby="pie-cuenta">
            <h2 id="pie-cuenta">Tu cuenta</h2>
            <ul>
              <li><Link href="/login">Iniciar sesión</Link></li>
              <li><Link href="/register">Crear cuenta</Link></li>
            </ul>
          </nav>
        </div>
        <p className="pie-abajo">© {new Date().getFullYear()} SyncPass. Registro y acreditación de cursos.</p>
      </div>
    </footer>
  );
};

export default Footer;
