import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import "../../App.css";
import styles from "./Login.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../../auth/AuthContext";

const IconoOjo = ({ visible }: { visible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {visible ? (
      <>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
        <path d="m2 2 20 20" />
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const IconoUsuario = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconoLlave = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Login = () => {
  const auth = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState<{ username?: string; password?: string } | null>(null);

  useDocumentTitle("Iniciar sesión");

  const iniciarSesion = async (evento: FormEvent) => {
    evento.preventDefault();
    const usernameLimpio = username.trim();
    const errores: { username?: string; password?: string } = {};
    if (!usernameLimpio) {
      errores.username = "Escribe tu usuario o correo para continuar.";
    }
    if (!password) {
      errores.password = "Escribe tu contraseña para continuar.";
    }
    setErrorLocal(Object.keys(errores).length > 0 ? errores : null);
    if (Object.keys(errores).length > 0) {
      return;
    }

    const exito = await auth.iniciarSesion(usernameLimpio, password);
    if (exito) {
      navigate("/");
    }
  };

  const contenidoFormulario = (
    <>
      <h1 id="tituloLogin" className={styles.titulo}>Hola de nuevo</h1>
      <p className={styles.subtitulo}>Accede a tu cuenta para continuar. Ingresa tus datos para gestionar tus cursos.</p>

      {auth.error && (
        <div className={styles.alerta} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>{auth.error}</span>
        </div>
      )}

      <form noValidate onSubmit={iniciarSesion}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="username">Usuario o correo</label>
          <div className={styles.controlEnvoltura}>
            <span className={styles.iconoCampo}>{IconoUsuario()}</span>
            <input
              id="username"
              name="username"
              className={styles.input}
              type="text"
              autoComplete="username"
              placeholder="juan_perez"
              value={username}
              onChange={(evento) => setUsername(evento.target.value)}
              aria-invalid={Boolean(errorLocal?.username)}
              required
            />
          </div>
          {errorLocal?.username && (
            <p id="username-error" className={styles.error}>{errorLocal.username}</p>
          )}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="password">Contraseña</label>
          <div className={styles.controlEnvoltura}>
            <span className={styles.iconoCampo}>{IconoLlave()}</span>
            <input
              id="password"
              name="password"
              className={`${styles.input} ${styles.inputConBoton}`}
              type={verPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              aria-invalid={Boolean(errorLocal?.password)}
              required
            />
            <button type="button" className={styles.botonVer} onClick={() => setVerPassword((visible) => !visible)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={verPassword}>
              <IconoOjo visible={verPassword} />
            </button>
          </div>
          {errorLocal?.password && (
            <p id="password-error" className={styles.error}>{errorLocal.password}</p>
          )}
        </div>

        <button type="submit" className={styles.botonEnviar} disabled={auth.isLoading}>
          {auth.isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Conectando…
            </>
          ) : (
            <>
              Iniciar sesión
              <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className={styles.seguro}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Inicio de sesión protegido con conexión cifrada.
      </p>
    </>
  );

  const bienvenida = (
    <div className={styles.exito} role="status">
      <span className={styles.exitoIcono}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <h1 id="tituloLogin" className={styles.titulo}>Sesión iniciada</h1>
      <p className={styles.subtitulo}>Sesión iniciada como {auth.usuario?.username ?? "usuario"}. Ya puedes gestionar tus cursos.</p>
      <Link className={styles.botonEnviar} href="/">Ir al inicio</Link>
    </div>
  );

  return (
    <div className={styles.layout}>
      <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
          <div className="container">
            <Link className="marca" href="/">SyncPass</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
                aria-label="Abrir menú">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="menu">
                <ul className="navbar-nav">
                    <li className="nav-item"><Link className="nav-link" href="/">Inicio</Link></li>
                    <li className="nav-item"><Link className="nav-link activo" href="/login" aria-current="page">Iniciar sesión</Link></li>
                    <li className="nav-item"><Link className="nav-link " href="/register">Crear cuenta</Link></li>
                </ul>
            </div>
          </div>
        </nav>
      </header>

      <main className={styles.pagina}>
        <div className={styles.tarjeta}>
          <section className={styles.marca} aria-label="SyncPass">
            <div>
              <span className={styles.etiqueta}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
                SyncPass
              </span>
              <p className={styles.marcaTitulo}>Tu curso, verificado en un solo lugar.</p>
              <p className={styles.marcaTexto}>Inicia sesión para revisar tus cursos e inscripciones.</p>
            </div>

            <ul className={styles.beneficios}>
              <li>
                <span className={styles.beneficioIcono}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </span>
                Inscripción online
              </li>
              <li>
                <span className={styles.beneficioIcono}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13.5 6.5a1 1 0 0 1 1 1.414l-8.485 8.485a4 4 0 0 1-5.656-5.656l8.485-8.485a1 1 0 0 1 1.414-1.414z" />
                  </svg>
                </span>
                Acreditación con QR
              </li>
              <li>
                <span className={styles.beneficioIcono}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                Práctica guiada
              </li>
            </ul>
          </section>

          <section className={styles.formulario} aria-labelledby="tituloLogin">
            {auth.isAuthenticated ? bienvenida : contenidoFormulario}

            <div className={styles.separador}>¿Primera vez aquí?</div>
            <p className={styles.registro}><Link href="/register">Crea tu cuenta gratis</Link></p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
