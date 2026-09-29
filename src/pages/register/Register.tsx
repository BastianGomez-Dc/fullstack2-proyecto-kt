const Register = () => {
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
          <div className="container">
            <a className="marca" href="index.html">Poleras <span>Express</span></a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
              aria-label="Abrir menú">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="menu">
              <ul className="navbar-nav">
                <li className="nav-item"><a className="nav-link" href="index.html">Inicio</a></li>
                <li className="nav-item"><a className="nav-link" href="login.html">Iniciar sesión</a></li>
                <li className="nav-item"><a className="nav-link activo" href="registro.html">Crear cuenta</a></li>
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
                  <p>¿Ya tienes cuenta? <a href="login.html">Iniciar sesión</a></p>
                </form>
        </main>
            </>
            );
};

            export default Register;