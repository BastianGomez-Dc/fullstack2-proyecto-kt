import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="pie">
      <div className="container">
        <div className="pie-grid">
          <div>
            <Link className="marca" href="/">Poleras <span>Express</span></Link>
            <p className="pie-descripcion">Poleras personalizadas con tu diseño, listas en 48 horas.</p>
          </div>
          <nav aria-labelledby="pie-tienda">
            <h2 id="pie-tienda">Tienda</h2>
            <ul>
              <li><Link href="/">Inicio</Link></li>
              <li><a href="#productos">Catálogo</a></li>
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
        <p className="pie-abajo">© {new Date().getFullYear()} Poleras Express. Despacho a todo Chile.</p>
      </div>
    </footer>
  );
};

export default Footer;
