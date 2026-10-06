import { Link } from "wouter";

const Footer = () => {
  return (

    <>
    <footer className="pie">
    <div className="container">
      <h2>Poleras Express</h2>
      <p>Poleras personalizadas con tu diseño, listas en 48 horas.</p>
      <nav>
        <Link href="/">Inicio</Link>
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/register">Crear cuenta</Link>
      </nav>
    </div>
  </footer>
    
    </>
  );
}

export default Footer;
