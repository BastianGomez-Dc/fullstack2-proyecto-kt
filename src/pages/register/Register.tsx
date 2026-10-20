import { useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import "../../App.css";
import styles from "../login/Login.module.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

type NombreCampo = "nombre" | "correo" | "password" | "confirmar";
type Valores = Record<NombreCampo, string>;
type Errores = Partial<Record<NombreCampo, string>>;

const ORDEN: NombreCampo[] = ["nombre", "correo", "password", "confirmar"];

const REQUISITOS = [
  { id: "largo", texto: "Al menos 8 caracteres", cumple: (p: string) => p.length >= 8 },
  { id: "mayus", texto: "Mayúscula y minúscula", cumple: (p: string) => /[A-ZÁÉÍÓÚÑ]/.test(p) && /[a-záéíóúñ]/.test(p) },
  { id: "numero", texto: "Un número", cumple: (p: string) => /\d/.test(p) },
  { id: "simbolo", texto: "Un símbolo (! # $ ?)", cumple: (p: string) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(p) },
];

const NIVELES = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];

const validar = (campo: NombreCampo, valores: Valores): string | undefined => {
  const valor = valores[campo].trim();
  switch (campo) {
    case "nombre":
      if (!valor) return "Escribe tu nombre para saber cómo llamarte.";
      if (valor.length < 3) return "El nombre debe tener al menos 3 letras.";
      return undefined;
    case "correo":
      if (!valor) return "Escribe tu correo; ahí te avisaremos de tus pedidos.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "Revisa el correo: debe tener el formato nombre@correo.cl.";
      return undefined;
    case "password":
      if (!valores.password) return "Crea una contraseña para proteger tu cuenta.";
      if (!REQUISITOS.every((r) => r.cumple(valores.password))) return "La contraseña aún no cumple todos los requisitos de abajo.";
      return undefined;
    case "confirmar":
      if (!valores.confirmar) return "Repite la contraseña para confirmarla.";
      if (valores.confirmar !== valores.password) return "Las contraseñas no coinciden. Revisa ambas e inténtalo de nuevo.";
      return undefined;
  }
};

const IconoError = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const IconoOjo = ({ visible }: { visible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {visible ? (
      <>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
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

const ICONOS: Record<NombreCampo, ReactNode> = {
  nombre: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  correo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  password: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  confirmar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

const Register = () => {

  const [, setPersonajes] = useState([]);
  const [llamarApi] = useState(false);
  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character").then(async (e) => {
      const res = await e.json();
      console.log(res);
      setPersonajes(res.results);
    });
  }, [llamarApi]);

  useDocumentTitle("Crear cuenta");

  const [valores, setValores] = useState<Valores>({ nombre: "", correo: "", password: "", confirmar: "" });
  const [errores, setErrores] = useState<Errores>({});
  const [tocados, setTocados] = useState<Partial<Record<NombreCampo, boolean>>>({});
  const [verPassword, setVerPassword] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const refs = useRef<Partial<Record<NombreCampo, HTMLInputElement | null>>>({});

  const cumplidos = REQUISITOS.filter((r) => r.cumple(valores.password)).length;

  const cambiar = (campo: NombreCampo, valor: string) => {
    const nuevos = { ...valores, [campo]: valor };
    setValores(nuevos);
    // Solo se revalida mientras se escribe si el campo ya mostró un error (validación al salir del campo)
    if (tocados[campo]) {
      setErrores((prev) => ({
        ...prev,
        [campo]: validar(campo, nuevos),
        ...(campo === "password" && tocados.confirmar ? { confirmar: validar("confirmar", nuevos) } : {}),
      }));
    }
  };

  const salir = (campo: NombreCampo) => {
    if (!valores[campo]) return; // no regañar a quien solo está recorriendo el formulario
    setTocados((prev) => ({ ...prev, [campo]: true }));
    setErrores((prev) => ({ ...prev, [campo]: validar(campo, valores) }));
  };

  const enviar = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const nuevos: Errores = {};
    for (const campo of ORDEN) nuevos[campo] = validar(campo, valores);
    setErrores(nuevos);
    setTocados({ nombre: true, correo: true, password: true, confirmar: true });

    const primero = ORDEN.find((campo) => nuevos[campo]);
    if (primero) {
      refs.current[primero]?.focus();
      return;
    }
    // TODO: conectar con el registro real (Cognito SignUp). Por ahora solo se valida en el navegador.
    setRegistrado(true);
  };

  const campo = (
    nombre: NombreCampo,
    label: string,
    props: InputHTMLAttributes<HTMLInputElement>,
    extra?: { ayudaId?: string; conBoton?: ReactNode },
  ) => {
    const error = errores[nombre];
    const errorId = `${nombre}-error`;
    const describedBy = [error ? errorId : null, extra?.ayudaId ?? null].filter(Boolean).join(" ") || undefined;
    return (
      <div className={styles.campo}>
        <label className={styles.label} htmlFor={nombre}>{label}</label>
        <div className={styles.controlEnvoltura}>
          <span className={styles.iconoCampo}>{ICONOS[nombre]}</span>
          <input
            ref={(el) => { refs.current[nombre] = el; }}
            id={nombre}
            name={nombre}
            className={[styles.input, extra?.conBoton ? styles.inputConBoton : "", error ? styles.inputInvalido : ""].join(" ")}
            value={valores[nombre]}
            onChange={(e) => cambiar(nombre, e.target.value)}
            onBlur={() => salir(nombre)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            required
            {...props}
          />
          {extra?.conBoton}
        </div>
        {error && (
          <p id={errorId} className={styles.error}>
            <IconoError />
            {error}
          </p>
        )}
      </div>
    );
  };

  const botonVer = (
    <button type="button" className={styles.botonVer} onClick={() => setVerPassword((v) => !v)}
      aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={verPassword}>
      <IconoOjo visible={verPassword} />
    </button>
  );

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
                <li className="nav-item"><Link className="nav-link" href="/login">Iniciar sesión</Link></li>
                <li className="nav-item"><Link className="nav-link activo" href="/register" aria-current="page">Crear cuenta</Link></li>
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
              <p className={styles.marcaTitulo}>Crea tu cuenta y estampa tu primera polera.</p>
              <p className={styles.marcaTexto}>Toma menos de un minuto. Guarda tus diseños y sigue tus pedidos.</p>
            </div>

            <ul className={styles.beneficios}>
              <li>
                <span className={styles.beneficioIcono}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                  </svg>
                </span>
                Guarda tus diseños para volver a pedirlos
              </li>
              <li>
                <span className={styles.beneficioIcono}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                    <path d="M12 22V12" />
                    <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                  </svg>
                </span>
                Sigue el estado de cada pedido
              </li>
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
            </ul>
          </section>

          <section className={styles.formulario} aria-labelledby="tituloRegistro">
            {registrado ? (
              <div className={styles.exito} role="status">
                <span className={styles.exitoIcono}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h1 id="tituloRegistro" className={styles.titulo}>¡Todo listo, {valores.nombre.trim().split(" ")[0]}!</h1>
                <p className={styles.subtitulo}>Tus datos están correctos. Ahora inicia sesión para empezar a diseñar.</p>
                <Link className={styles.botonEnviar} href="/login">
                  Ir a iniciar sesión
                  <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <>
                <h1 id="tituloRegistro" className={styles.titulo}>Crea tu cuenta</h1>
                <p className={styles.subtitulo}>Todos los campos son obligatorios.</p>

                <form noValidate onSubmit={enviar}>
                  {campo("nombre", "Nombre completo", { type: "text", autoComplete: "name", placeholder: "Ana Muñoz Pérez" })}
                  {campo("correo", "Correo electrónico", {
                    type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", spellCheck: false,
                    placeholder: "nombre@correo.cl",
                  })}
                  {campo("password", "Contraseña", {
                    type: verPassword ? "text" : "password", autoComplete: "new-password",
                  }, { ayudaId: "password-requisitos", conBoton: botonVer })}

                  <div className={styles.seguridad} id="password-requisitos">
                    <div className={styles.medidor} data-nivel={valores.password ? cumplidos : 0} aria-hidden="true">
                      {REQUISITOS.map((r) => <span key={r.id} />)}
                    </div>
                    <p className={styles.nivelTexto}>
                      Seguridad: <strong>{valores.password ? NIVELES[cumplidos] : "sin contraseña"}</strong>
                    </p>
                    <ul className={styles.requisitos}>
                      {REQUISITOS.map((r) => {
                        const ok = r.cumple(valores.password);
                        return (
                          <li key={r.id} className={ok ? styles.requisitoOk : undefined}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              {ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="9" />}
                            </svg>
                            {r.texto}
                            <span className={styles.srOnly}>{ok ? " (cumplido)" : " (pendiente)"}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {campo("confirmar", "Confirmar contraseña", {
                    type: verPassword ? "text" : "password", autoComplete: "new-password",
                  })}

                  <button type="submit" className={styles.botonEnviar}>
                    Crear cuenta
                    <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </form>

                <div className={styles.separador}>¿Ya tienes cuenta?</div>
                <p className={styles.registro}><Link href="/login">Inicia sesión</Link></p>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Register;
