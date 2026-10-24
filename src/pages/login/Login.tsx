import { useRef, useState, type SubmitEvent } from "react";
import { Link, useLocation } from "wouter";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../../auth/AuthContext";
import { MENSAJE_CUENTA_NO_CONFIRMADA } from "../../auth/cognito";
import AuthLayout from "../../components/auth-layout/AuthLayout";
import Alerta from "../../components/form/Alerta";
import BotonEnvio from "../../components/form/BotonEnvio";
import Icon from "../../components/icon/Icon";
import form from "../../components/form/Form.module.css";

type Errores = { correo?: string; password?: string };

const Login = () => {
  const auth = useAuth();
  const [, navigate] = useLocation();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const refCorreo = useRef<HTMLInputElement | null>(null);
  const refPassword = useRef<HTMLInputElement | null>(null);

  useDocumentTitle("Iniciar sesión");

  const iniciarSesion = async (evento: SubmitEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const correoLimpio = correo.trim();
    const nuevos: Errores = {};
    if (!correoLimpio) nuevos.correo = "Escribe tu correo para continuar.";
    if (!password) nuevos.password = "Escribe tu contraseña para continuar.";
    setErrores(nuevos);
    // El foco va al primer campo con error, para que el teclado y el lector de pantalla lleguen ahí
    if (nuevos.correo) return refCorreo.current?.focus();
    if (nuevos.password) return refPassword.current?.focus();

    if (await auth.iniciarSesion(correoLimpio, password)) {
      navigate("/");
    }
  };

  const nombre = auth.usuario?.nombre ?? auth.usuario?.username;

  return (
    <AuthLayout
      idTitulo="tituloLogin"
      panelTitulo="Tu curso, verificado en un solo lugar."
      panelTexto="Inicia sesión para revisar tus cursos, tus inscripciones y tu código de acceso."
    >
      {auth.isAuthenticated ? (
        <div className={form.exito} role="status">
          <span className={form.exitoIcono}>
            <Icon nombre="check" tamano={28} grosor={2.5} />
          </span>
          <h1 id="tituloLogin" className={form.titulo}>Ya iniciaste sesión</h1>
          <p className={form.subtitulo}>
            {nombre ? <>Estás conectado como <strong>{nombre}</strong>.</> : "Tu sesión está activa."}
          </p>
          <div className={form.acciones}>
            <Link className={form.botonPrimario} href="/">
              Ir al inicio
              <Icon nombre="flechaDerecha" tamano={18} className={form.flecha} />
            </Link>
            <button type="button" className={form.botonSecundario} onClick={auth.cerrarSesion}>
              <Icon nombre="salir" tamano={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={form.encabezado}>
            <h1 id="tituloLogin" className={form.titulo}>Hola de nuevo</h1>
            <p className={form.subtitulo}>Ingresa con tu correo y contraseña.</p>
          </div>

          {auth.error && (
            <Alerta>
              <span>{auth.error}</span>
              {auth.error === MENSAJE_CUENTA_NO_CONFIRMADA && (
                <Link href="/register?confirmar=1">Confirmar mi cuenta</Link>
              )}
            </Alerta>
          )}

          <form noValidate onSubmit={iniciarSesion}>
            <div className={form.campo}>
              <label className={form.label} htmlFor="correo">Correo electrónico</label>
              <div className={form.control}>
                <span className={form.iconoCampo}><Icon nombre="correo" tamano={18} /></span>
                <input
                  ref={refCorreo}
                  id="correo"
                  name="correo"
                  className={[form.input, errores.correo ? form.inputInvalido : ""].join(" ")}
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="nombre@correo.cl"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                  aria-invalid={Boolean(errores.correo)}
                  aria-describedby={errores.correo ? "correo-error" : undefined}
                  required
                />
              </div>
              {errores.correo && (
                <p id="correo-error" className={form.error}>
                  <Icon nombre="alerta" tamano={14} grosor={2.5} />
                  {errores.correo}
                </p>
              )}
            </div>

            <div className={form.campo}>
              <label className={form.label} htmlFor="password">Contraseña</label>
              <div className={form.control}>
                <span className={form.iconoCampo}><Icon nombre="candado" tamano={18} /></span>
                <input
                  ref={refPassword}
                  id="password"
                  name="password"
                  className={[form.input, form.inputConBoton, errores.password ? form.inputInvalido : ""].join(" ")}
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  aria-invalid={Boolean(errores.password)}
                  aria-describedby={errores.password ? "password-error" : undefined}
                  required
                />
                <button
                  type="button"
                  className={form.botonVer}
                  onClick={() => setVerPassword((visible) => !visible)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={verPassword}
                >
                  <Icon nombre={verPassword ? "ojoTachado" : "ojo"} />
                </button>
              </div>
              {errores.password && (
                <p id="password-error" className={form.error}>
                  <Icon nombre="alerta" tamano={14} grosor={2.5} />
                  {errores.password}
                </p>
              )}
            </div>

            <BotonEnvio texto="Iniciar sesión" textoCargando="Verificando…" cargando={auth.isLoading} />
          </form>

          <div className={form.enlacesSecundarios}>
            <p className={form.pieFormulario}>
              ¿Primera vez en SyncPass?
              <Link className={form.botonEnlace} href="/register">Crea tu cuenta</Link>
            </p>
            <p className={form.pieFormulario}>
              ¿No confirmaste tu correo?
              <Link className={form.botonEnlace} href="/register?confirmar=1">Confirmar cuenta</Link>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default Login;
