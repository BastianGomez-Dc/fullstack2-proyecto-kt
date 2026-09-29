import { useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "wouter";
import "../../App.css";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");

  const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setEmail(event.target.value);
  };

  const handleChangeContrasena = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setContrasena(event.target.value);
  };
  return (
    <>
          <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
            <div className="container">
                <Link className="marca" href="/">Poleras <span>Express</span></Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
                    aria-label="Abrir menú">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="menu">
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link className="nav-link" href="/">Inicio</Link></li>
                        <li className="nav-item"><Link className="nav-link activo" href="/login">Iniciar sesión</Link></li>
                        <li className="nav-item"><Link className="nav-link " href="/register">Crear cuenta</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <main className="pagina-login">
        <form id="formLogin" action={import.meta.env.BASE_URL} method="get">
            <img src="img/login2.png" alt="Logo de Poleras Express"/>

            <label htmlFor="correo">Correo electrónico</label>
            <input type="email" id="correo" name="correo" placeholder="nombre@correo.cl" autoComplete="email" required
                value={email} onChange={handleChangeEmail} />

            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="Tu contraseña"
                autoComplete="current-password" required value={contrasena} onChange={handleChangeContrasena} />

            <div className="box_visible">
                <button type="submit">Iniciar sesión</button>
            </div>

            <div className="box_visible">
                <p>¿No tienes cuenta? <Link href="/register">Crear cuenta</Link></p>
            </div>
        </form>
    </main>
    </>
  );
};

export default Login;
