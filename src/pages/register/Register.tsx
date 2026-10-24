import { useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { Link, useSearch } from "wouter";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { confirmarRegistro, mensajeDeRegistro, reenviarCodigo, registrarUsuario } from "../../api/registro";
import AuthLayout from "../../components/auth-layout/AuthLayout";
import Alerta from "../../components/form/Alerta";
import BotonEnvio from "../../components/form/BotonEnvio";
import Icon, { type NombreIcono } from "../../components/icon/Icon";
import form from "../../components/form/Form.module.css";
import styles from "./Register.module.css";

type NombreCampo = "nombre" | "correo" | "password" | "confirmar";
type Valores = Record<NombreCampo, string>;
type Errores = Partial<Record<NombreCampo, string>>;

const ORDEN: NombreCampo[] = ["nombre", "correo", "password", "confirmar"];

const ICONOS: Record<NombreCampo, NombreIcono> = {
  nombre: "usuario",
  correo: "correo",
  password: "candado",
  confirmar: "escudo",
};

const REQUISITOS = [
  { id: "largo", texto: "8 caracteres", cumple: (p: string) => p.length >= 8 },
  { id: "mayus", texto: "Mayúscula y minúscula", cumple: (p: string) => /[A-ZÁÉÍÓÚÑ]/.test(p) && /[a-záéíóúñ]/.test(p) },
  { id: "numero", texto: "Un número", cumple: (p: string) => /\d/.test(p) },
  { id: "simbolo", texto: "Un símbolo (!#$)", cumple: (p: string) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(p) },
];

const NIVELES = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];

const validar = (campo: NombreCampo, valores: Valores): string | undefined => {
  const valor = valores[campo].trim();
  switch (campo) {
    case "nombre":
      if (!valor) return "Escribe tu nombre.";
      if (valor.length < 3) return "Usa al menos 3 letras.";
      return undefined;
    case "correo":
      if (!valor) return "Escribe tu correo.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return "Formato esperado: nombre@correo.cl";
      return undefined;
    case "password":
      if (!valores.password) return "Crea una contraseña.";
      if (!REQUISITOS.every((r) => r.cumple(valores.password))) return "Aún no cumple los requisitos.";
      return undefined;
    case "confirmar":
      if (!valores.confirmar) return "Repite la contraseña.";
      if (valores.confirmar !== valores.password) return "Las contraseñas no coinciden.";
      return undefined;
  }
};

// Los mensajes caben en una línea de media columna (los campos van de a dos)
// formulario → (el backend crea la cuenta en Cognito + BD) → confirmar el código del correo → listo
type Etapa = "formulario" | "confirmar" | "listo";

const PASOS: Array<{ etapa: Etapa; texto: string }> = [
  { etapa: "formulario", texto: "Tus datos" },
  { etapa: "confirmar", texto: "Verifica tu correo" },
  { etapa: "listo", texto: "Listo" },
];

const Pasos = ({ etapa }: { etapa: Etapa }) => {
  const indice = PASOS.findIndex((p) => p.etapa === etapa);
  return (
    <ol className={styles.pasos} aria-label="Progreso del registro">
      {PASOS.map((paso, i) => (
        <li
          key={paso.etapa}
          className={styles.paso}
          data-estado={i < indice ? "hecho" : i === indice ? "actual" : "pendiente"}
          aria-current={i === indice ? "step" : undefined}
        >
          <span className={styles.pasoMarca} aria-hidden="true">
            {i < indice ? <Icon nombre="check" tamano={14} grosor={3} /> : i + 1}
          </span>
          <span className={styles.pasoTexto}>
            {paso.texto}
            {i < indice && <span className="sr-only"> (completado)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
};

const MensajeError = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} className={form.error}>
    <Icon nombre="alerta" tamano={14} grosor={2.5} />
    {children}
  </p>
);

const Register = () => {
  useDocumentTitle("Crear cuenta");
  // /register?confirmar=1 abre directo el paso de verificación (desde el login o el pie de página)
  const vieneAConfirmar = new URLSearchParams(useSearch()).has("confirmar");

  const [valores, setValores] = useState<Valores>({ nombre: "", correo: "", password: "", confirmar: "" });
  const [errores, setErrores] = useState<Errores>({});
  const [tocados, setTocados] = useState<Partial<Record<NombreCampo, boolean>>>({});
  const [verPassword, setVerPassword] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>(vieneAConfirmar ? "confirmar" : "formulario");
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Correo de la cuenta por confirmar; si se llega desde "Confirmar cuenta" se escribe a mano
  const [correoPendiente, setCorreoPendiente] = useState("");
  const [correoDesdeRegistro, setCorreoDesdeRegistro] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [errorConfirmacion, setErrorConfirmacion] = useState<{ correo?: string; codigo?: string }>({});
  const refs = useRef<Partial<Record<NombreCampo, HTMLInputElement | null>>>({});
  const refCodigo = useRef<HTMLInputElement | null>(null);
  const refCorreoPendiente = useRef<HTMLInputElement | null>(null);
  const refTituloListo = useRef<HTMLHeadingElement | null>(null);

  // Al cambiar de paso, el foco va al primer campo útil (o al título final) para teclado y lector de pantalla
  useEffect(() => {
    if (etapa === "confirmar") {
      (correoDesdeRegistro ? refCodigo : refCorreoPendiente).current?.focus();
    } else if (etapa === "listo") {
      refTituloListo.current?.focus();
    }
  }, [etapa, correoDesdeRegistro]);

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

  const enviar = async (e: SubmitEvent<HTMLFormElement>) => {
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

    setEnviando(true);
    setErrorServidor(null);
    try {
      const correo = valores.correo.trim();
      await registrarUsuario({ nombre: valores.nombre.trim(), email: correo, password: valores.password });
      setCorreoPendiente(correo);
      setCorreoDesdeRegistro(true);
      setAviso(null);
      setEtapa("confirmar");
    } catch (error) {
      setErrorServidor(mensajeDeRegistro(error));
    } finally {
      setEnviando(false);
    }
  };

  const irAConfirmar = () => {
    setCorreoPendiente(valores.correo.trim());
    setCorreoDesdeRegistro(false);
    setErrorServidor(null);
    setAviso(null);
    setErrorConfirmacion({});
    setEtapa("confirmar");
  };

  const volverAlFormulario = () => {
    setErrorServidor(null);
    setAviso(null);
    setEtapa("formulario");
  };

  const validarCorreoPendiente = (): string | undefined => {
    const error = validar("correo", { ...valores, correo: correoPendiente });
    if (error) {
      setErrorConfirmacion({ correo: error });
      refCorreoPendiente.current?.focus();
    }
    return error;
  };

  const confirmar = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorServidor(null);
    setAviso(null);
    if (validarCorreoPendiente()) return;
    const codigoLimpio = codigo.trim();
    if (!/^\d{6}$/.test(codigoLimpio)) {
      setErrorConfirmacion({ codigo: "El código tiene 6 dígitos. Lo encuentras en el correo que te enviamos." });
      refCodigo.current?.focus();
      return;
    }
    setErrorConfirmacion({});

    setEnviando(true);
    try {
      await confirmarRegistro(correoPendiente.trim(), codigoLimpio);
      setEtapa("listo");
    } catch (error) {
      setErrorServidor(mensajeDeRegistro(error));
    } finally {
      setEnviando(false);
    }
  };

  const pedirOtroCodigo = async () => {
    setErrorServidor(null);
    setAviso(null);
    if (validarCorreoPendiente()) return;
    setErrorConfirmacion({});

    setEnviando(true);
    try {
      await reenviarCodigo(correoPendiente.trim());
      setAviso(`Te enviamos un nuevo código a ${correoPendiente.trim()}.`);
    } catch (error) {
      setErrorServidor(mensajeDeRegistro(error));
    } finally {
      setEnviando(false);
    }
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
      <div className={form.campo}>
        <label className={form.label} htmlFor={nombre}>{label}</label>
        <div className={form.control}>
          <span className={form.iconoCampo}><Icon nombre={ICONOS[nombre]} tamano={18} /></span>
          <input
            ref={(el) => { refs.current[nombre] = el; }}
            id={nombre}
            name={nombre}
            className={[form.input, extra?.conBoton ? form.inputConBoton : "", error ? form.inputInvalido : ""].join(" ")}
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
        {error && <MensajeError id={errorId}>{error}</MensajeError>}
      </div>
    );
  };

  const botonVer = (
    <button type="button" className={form.botonVer} onClick={() => setVerPassword((v) => !v)}
      aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={verPassword}>
      <Icon nombre={verPassword ? "ojoTachado" : "ojo"} />
    </button>
  );

  const primerNombre = valores.nombre.trim().split(" ")[0];

  return (
    <AuthLayout
      idTitulo="tituloRegistro"
      panelTitulo="Crea tu cuenta y empieza tu primer curso."
      panelTexto="Toma menos de un minuto. Guarda tus cursos y sigue el estado de cada inscripción."
      amplio
    >
      <Pasos etapa={etapa} />

      {etapa === "listo" ? (
        <div className={form.exito}>
          <span className={form.exitoIcono}>
            <Icon nombre="check" tamano={28} grosor={2.5} />
          </span>
          <h1 id="tituloRegistro" ref={refTituloListo} tabIndex={-1} className={form.titulo}>
            ¡Todo listo{primerNombre ? `, ${primerNombre}` : ""}!
          </h1>
          <p className={form.subtitulo}>Tu cuenta está confirmada. Ahora inicia sesión para empezar.</p>
          <Link className={form.botonPrimario} href="/login">
            Ir a iniciar sesión
            <Icon nombre="flechaDerecha" tamano={18} className={form.flecha} />
          </Link>
        </div>
      ) : etapa === "confirmar" ? (
        <>
          <div className={form.encabezado}>
            <h1 id="tituloRegistro" className={form.titulo}>Verifica tu correo</h1>
            <p className={form.subtitulo}>
              {correoDesdeRegistro ? (
                <>Enviamos un código de 6 dígitos a <strong>{correoPendiente}</strong>. Escríbelo para activar tu cuenta.</>
              ) : (
                "Escribe tu correo y el código de 6 dígitos que te enviamos al registrarte."
              )}
            </p>
          </div>

          {errorServidor && <Alerta>{errorServidor}</Alerta>}
          {aviso && <Alerta tipo="exito">{aviso}</Alerta>}

          <form noValidate onSubmit={confirmar}>
            {!correoDesdeRegistro && (
              <div className={form.campo}>
                <label className={form.label} htmlFor="correoPendiente">Correo electrónico</label>
                <div className={form.control}>
                  <span className={form.iconoCampo}><Icon nombre="correo" tamano={18} /></span>
                  <input
                    ref={refCorreoPendiente}
                    id="correoPendiente"
                    name="correoPendiente"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="nombre@correo.cl"
                    className={[form.input, errorConfirmacion.correo ? form.inputInvalido : ""].join(" ")}
                    value={correoPendiente}
                    onChange={(e) => setCorreoPendiente(e.target.value)}
                    aria-invalid={Boolean(errorConfirmacion.correo)}
                    aria-describedby={errorConfirmacion.correo ? "correoPendiente-error" : undefined}
                    required
                  />
                </div>
                {errorConfirmacion.correo && (
                  <MensajeError id="correoPendiente-error">{errorConfirmacion.correo}</MensajeError>
                )}
              </div>
            )}

            <div className={form.campo}>
              <label className={form.label} htmlFor="codigo">Código de verificación</label>
              <div className={form.control}>
                <span className={form.iconoCampo}><Icon nombre="escudo" tamano={18} /></span>
                <input
                  ref={refCodigo}
                  id="codigo"
                  name="codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  className={[form.input, form.inputCodigo, errorConfirmacion.codigo ? form.inputInvalido : ""].join(" ")}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={Boolean(errorConfirmacion.codigo)}
                  aria-describedby={errorConfirmacion.codigo ? "codigo-error codigo-ayuda" : "codigo-ayuda"}
                  required
                />
              </div>
              {errorConfirmacion.codigo && <MensajeError id="codigo-error">{errorConfirmacion.codigo}</MensajeError>}
              <p id="codigo-ayuda" className={form.ayuda}>Si no lo ves, revisa la carpeta de spam o correo no deseado.</p>
            </div>

            <BotonEnvio texto="Confirmar cuenta" textoCargando="Confirmando…" cargando={enviando} />
          </form>

          <div className={form.separador}>¿No te llegó el código?</div>
          <p className={form.pieFormulario}>
            <button type="button" className={form.botonEnlace} onClick={pedirOtroCodigo} disabled={enviando}>
              <Icon nombre="enviar" tamano={16} />
              Enviar otro código
            </button>
          </p>
          <p className={form.pieFormulario}>
            <button type="button" className={form.botonEnlace} onClick={volverAlFormulario}>
              <Icon nombre="flechaIzquierda" tamano={16} />
              Volver al registro
            </button>
          </p>
        </>
      ) : (
        <>
          <div className={form.encabezado}>
            <h1 id="tituloRegistro" className={form.titulo}>Crea tu cuenta</h1>
            <p className={`${form.subtitulo} ${styles.subtituloOpcional}`}>
              Todos los campos son obligatorios. Luego verificaremos tu correo con un código.
            </p>
          </div>

          {errorServidor && <Alerta>{errorServidor}</Alerta>}

          <form noValidate onSubmit={enviar}>
            <div className={styles.fila}>
              {campo("nombre", "Nombre completo", { type: "text", autoComplete: "name", placeholder: "Ana Muñoz Pérez" })}
              {campo("correo", "Correo electrónico", {
                type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", spellCheck: false,
                placeholder: "nombre@correo.cl",
              })}
            </div>
            <div className={`${styles.fila} ${styles.filaClaves}`}>
              {campo("password", "Contraseña", {
                type: verPassword ? "text" : "password", autoComplete: "new-password",
              }, { ayudaId: "password-requisitos", conBoton: botonVer })}
              {campo("confirmar", "Confirmar contraseña", {
                type: verPassword ? "text" : "password", autoComplete: "new-password",
              })}
            </div>

            <div className={styles.seguridad} id="password-requisitos">
              <div className={styles.seguridadCabecera}>
                <div className={styles.medidor} data-nivel={valores.password ? cumplidos : 0} aria-hidden="true">
                  {REQUISITOS.map((r) => <span key={r.id} />)}
                </div>
                <p className={styles.nivelTexto}>
                  Seguridad: <strong>{valores.password ? NIVELES[cumplidos] : "sin contraseña"}</strong>
                </p>
              </div>
              <ul className={styles.requisitos}>
                {REQUISITOS.map((r) => {
                  const ok = r.cumple(valores.password);
                  return (
                    <li key={r.id} className={ok ? styles.requisitoOk : undefined}>
                      <Icon nombre={ok ? "checkCirculo" : "circulo"} tamano={16} />
                      {r.texto}
                      <span className="sr-only">{ok ? " (cumplido)" : " (pendiente)"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <BotonEnvio texto="Crear cuenta" textoCargando="Creando tu cuenta…" cargando={enviando} />
          </form>

          <div className={form.enlacesSecundarios}>
            <p className={form.pieFormulario}>
              ¿Ya tienes cuenta?
              <Link className={form.botonEnlace} href="/login">Inicia sesión</Link>
            </p>
            <p className={form.pieFormulario}>
              ¿Tienes un código?
              <button type="button" className={form.botonEnlace} onClick={irAConfirmar}>Confirma tu cuenta</button>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default Register;
