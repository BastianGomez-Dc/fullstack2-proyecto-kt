import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "wouter";
import "../../App.css";
import styles from "./Login.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Login = () => {
  const auth = useAuth();
  const [errorAcceso, setErrorAcceso] = useState(false);
  const ocupado = auth.isLoading || Boolean(auth.activeNavigator);

  const iniciarSesion = async () => {
    setErrorAcceso(false);
    try {
      await auth.signinRedirect();
    } catch {
      setErrorAcceso(true);
    }
  };

  useDocumentTitle("Iniciar sesión");
  return (
    <div className={styles.layout}>
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
                        <li className="nav-item"><Link className="nav-link activo" href="/login" aria-current="page">Iniciar sesión</Link></li>
                        <li className="nav-item"><Link className="nav-link " href="/register">Crear cuenta</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <main className={styles.pagina}>
      <div className={styles.tarjeta}>
        <section className={styles.marca} aria-label="Poleras Express">
          <div>
            <span className={styles.etiqueta}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
              Poleras Express
            </span>
            <p className={styles.marcaTitulo}>Tu diseño, estampado y en tus manos.</p>
            <p className={styles.marcaTexto}>Inicia sesión para revisar tus pedidos y seguir creando.</p>
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
              Despacho en 48 horas a todo Chile
            </li>
            <li>
              <span className={styles.beneficioIcono}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z" />
                </svg>
              </span>
              Personaliza por delante y por detrás
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
              Desde una polera hasta el pedido del curso
            </li>
          </ul>
        </section>

        <section className={styles.formulario} aria-labelledby="tituloLogin">
          <img className={styles.logo} src="img/login2.png" alt="" width="56" height="56" />
          <h1 id="tituloLogin" className={styles.titulo}>Hola de nuevo</h1>
          {auth.isAuthenticated ? (
            <>
              <p className={styles.subtitulo}>Sesión iniciada como {auth.user?.profile.email ?? auth.user?.profile.sub}.</p>
              <Link className={styles.botonEnviar} href="/">Ir al inicio</Link>
            </>
          ) : (
            <>
              <p className={styles.subtitulo}>Accede a tu cuenta para continuar. Te llevaremos a la página segura de inicio de sesión.</p>
              {(auth.error || errorAcceso) && (
                <p className={styles.alerta} role="alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  <span>No pudimos conectar con la página de inicio de sesión. Revisa tu conexión a internet y vuelve a intentarlo.</span>
                </p>
              )}
              <button type="button" className={styles.botonEnviar} disabled={ocupado}
                  aria-busy={ocupado} onClick={() => void iniciarSesion()}>
                {ocupado ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Conectando…
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              <p className={styles.seguro}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Inicio de sesión protegido con conexión cifrada.
              </p>
            </>
          )}
          <div className={styles.separador}>¿Primera vez aquí?</div>
          <p className={styles.registro}><Link href="/register">Crea tu cuenta gratis</Link></p>
        </section>
      </div>
    </main>
    </div>
  );
};

export default Login;
