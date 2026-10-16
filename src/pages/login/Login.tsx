import { useState } from "react";
import { useEffect } from "react";
import type { ChangeEvent, FocusEvent, SubmitEvent } from "react";
import { Link } from "wouter";
import "../../App.css";
import styles from "./Login.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

type Campo = "email" | "contrasena";
type Errores = Partial<Record<Campo, string>>;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el mensaje de error de un campo, o undefined si es válido
const validarCampo = (campo: Campo, valor: string): string | undefined => {
  if (campo === "email") {
    if (!valor.trim()) return "Ingresa tu correo electrónico.";
    if (!REGEX_CORREO.test(valor)) return "Revisa el formato, por ejemplo nombre@correo.cl.";
  }
  if (campo === "contrasena" && !valor) return "Ingresa tu contraseña.";
  return undefined;
};

const Login = () => {
    //useState es un hook de react que le da memoria al componente
  const [email, setEmail] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [personajes, setPersonajes] = useState([]);
  const [llamarApi, setLlamarApi] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  //useEffect es un hook de react que se ejectua al cargar el componente
  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character").then(async (e) => {
      // const res = await e.json(); sirve para esperar a que la promesa se resuelva y obtener el resultado
      const res = await e.json();
      console.log(res);
      setPersonajes(res.results);
    });
  }, [llamarApi]);

  // Si el campo ya tiene un error, se vuelve a validar mientras el usuario escribe
  const revalidar = (campo: Campo, valor: string) => {
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, valor) }));
    }
  };

  const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setEmail(event.target.value);
    revalidar("email", event.target.value);
  };
  //ChangeEvent es un tipo de evento de react que se ejecuta al cambiar el valor de un input
  const handleChangeContrasena = (event: ChangeEvent<HTMLInputElement>) => {
    //event.target.value es el valor del input
    console.log(event.target.value);
    //setContrasena es la funcion que cambia el valor
    setContrasena(event.target.value);
    revalidar("contrasena", event.target.value);
  };

  // Valida el campo cuando el usuario sale de él (onBlur)
  const handleBlur = (campo: Campo) => (event: FocusEvent<HTMLInputElement>) => {
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, event.target.value) }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const nuevosErrores: Errores = {
      email: validarCampo("email", email),
      contrasena: validarCampo("contrasena", contrasena),
    };
    setErrores(nuevosErrores);

    if (nuevosErrores.email || nuevosErrores.contrasena) {
      event.preventDefault();
      // Lleva el foco al primer campo con error
      document.getElementById(nuevosErrores.email ? "correo" : "password")?.focus();
      return;
    }
    setEnviando(true);
  };

  //useDocumentTitle es un hook personalizado que cambia el titulo de la pagina
  useDocumentTitle("Iniciar sesión");
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
            <h2 className={styles.marcaTitulo}>Tu diseño, estampado y en tus manos.</h2>
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

        <form id="formLogin" className={styles.formulario} action={import.meta.env.BASE_URL} method="get"
            noValidate onSubmit={handleSubmit} aria-labelledby="tituloLogin">
            <img className={styles.logo} src="img/login2.png" alt="" width="56" height="56" />
            <h1 id="tituloLogin" className={styles.titulo}>Bienvenido de nuevo</h1>
            <p className={styles.subtitulo}>Ingresa tus datos para acceder a tu cuenta.</p>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="correo">Correo electrónico</label>
              <div className={styles.controlEnvoltura}>
                <svg className={styles.iconoCampo} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input type="email" id="correo" name="correo" placeholder="nombre@correo.cl" autoComplete="email" required
                    className={`${styles.input} ${errores.email ? styles.inputInvalido : ""}`}
                    aria-invalid={errores.email ? true : undefined}
                    aria-describedby={errores.email ? "correo-error" : undefined}
                    value={email} onChange={handleChangeEmail} onBlur={handleBlur("email")} />
              </div>
              {errores.email && (
                <p id="correo-error" className={styles.error} role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
                  </svg>
                  {errores.email}
                </p>
              )}
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <div className={styles.controlEnvoltura}>
                <svg className={styles.iconoCampo} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type={mostrarContrasena ? "text" : "password"} id="password" name="password" placeholder="Tu contraseña"
                    autoComplete="current-password" required
                    className={`${styles.input} ${styles.inputConBoton} ${errores.contrasena ? styles.inputInvalido : ""}`}
                    aria-invalid={errores.contrasena ? true : undefined}
                    aria-describedby={errores.contrasena ? "password-error" : undefined}
                    value={contrasena} onChange={handleChangeContrasena} onBlur={handleBlur("contrasena")} />
                <button type="button" className={styles.botonVer}
                    aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={mostrarContrasena}
                    onClick={() => setMostrarContrasena((visible) => !visible)}>
                  {mostrarContrasena ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                      <path d="m2 2 20 20" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errores.contrasena && (
                <p id="password-error" className={styles.error} role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
                  </svg>
                  {errores.contrasena}
                </p>
              )}
            </div>

            <button type="submit" className={styles.botonEnviar} disabled={enviando} aria-busy={enviando}>
              {enviando ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <div className={styles.separador}>¿Primera vez aquí?</div>
            <p className={styles.registro}>¿No tienes cuenta? <Link href="/register">Crear cuenta</Link></p>
        </form>
      </div>
    </main>
    </>
  );
};

export default Login;
