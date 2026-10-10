import { useState } from "react";
import { Link } from "wouter";
import "../../App.css";

const Register = () => {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
          <div className="container">
            <Link className="marca" href="/">Poleras <span>Express</span></Link>
            <button className="navbar-toggler" type="button" aria-controls="menu" aria-expanded={menuAbierto}
              aria-label="Abrir menú" onClick={() => setMenuAbierto(!menuAbierto)}>
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse justify-content-end${menuAbierto ? " abierto" : ""}`} id="menu">
              <ul className="navbar-nav">
                <li className="nav-item"><Link className="nav-link" href="/">Inicio</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/login">Iniciar sesión</Link></li>
                <li className="nav-item"><Link className="nav-link activo" href="/register">Crear cuenta</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main className="pagina-login">
        <form id="formRegister" action={import.meta.env.BASE_URL} method="get">
          <img src="img/login2.png" alt="Logo de Poleras Express" />

          <label htmlFor="nombre">Nombre completo</label>
          <input type="text" id="nombre" name="nombre" placeholder="Ana Muñoz Pérez" required />

          <label htmlFor="correo">Correo electrónico</label>
          <input type="email" id="correo" name="correo" placeholder="nombre@correo.cl" required />

          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="password" placeholder="Mínimo 8 caracteres" required />

          <label htmlFor="confirmar">Confirmar contraseña</label>
          <input type="password" id="confirmar" name="confirmar" placeholder="Repite la contraseña" required />

          <button type="submit">Crear cuenta</button>
          <p>¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link></p>
        </form>
      </main>
    </>
  );
};

export default Register;
