import { useEffect, useState, type SubmitEvent } from "react";
import { Link } from "wouter";
import { useAuth } from "../../auth/AuthContext";
import {
  enviarNotificacionManual,
  getHistorial,
  ROLES,
  type Rol,
} from "../../api/notifications";
import BotonEnvio from "../../components/molecules/BotonEnvio";
import useDocumentTitle from "../hooks/useDocumentTitle";
import styles from "./Notifications.module.css";

const Notifications = () => {
  const { token, usuario, isAuthenticated, isReady } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [rolesSeleccionados, setRolesSeleccionados] = useState<Rol[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<unknown[] | null>(null);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  useDocumentTitle("Notificaciones");

  useEffect(() => {
    if (!isReady || !isAuthenticated || usuario?.rol !== "ADMINISTRADOR" || !token) return;

    let activo = true;
    void getHistorial(token)
      .then((resultado) => {
        if (activo) setHistorial(resultado);
      })
      .catch((e: unknown) => {
        if (activo) {
          setErrorHistorial(
            e instanceof Error ? e.message : "No pudimos cargar el historial de notificaciones.",
          );
        }
      });

    return () => {
      activo = false;
    };
  }, [isReady, isAuthenticated, usuario?.rol, token]);

  const enviar = async (evento: SubmitEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setMensaje(null);
    setError(null);
    setErrorValidacion(null);

    if (!titulo.trim() || !cuerpo.trim()) {
      setErrorValidacion("Escribe un título y un cuerpo para la notificación.");
      return;
    }

    if (!token) {
      setError("Tu sesión no está disponible. Inicia sesión nuevamente.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await enviarNotificacionManual(
        { titulo: titulo.trim(), cuerpo: cuerpo.trim(), roles: rolesSeleccionados },
        token,
      );
      setMensaje(respuesta.mensaje);
      setTitulo("");
      setCuerpo("");
      setRolesSeleccionados([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar la notificación.");
    } finally {
      setEnviando(false);
    }
  };

  if (!isReady) {
    return (
      <main id="contenido" className={styles.pagina}>
        <p className={styles.estado} role="status">Verificando la sesión…</p>
      </main>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <main id="contenido" className={styles.pagina}>
        <section className={styles.acceso} aria-labelledby="tituloAcceso">
          <h1 id="tituloAcceso">Inicia sesión para continuar</h1>
          <p>El panel de notificaciones está disponible solo para administradores.</p>
          <Link className={styles.enlace} href="/login">Ir a iniciar sesión</Link>
        </section>
      </main>
    );
  }

  if (usuario?.rol !== "ADMINISTRADOR") {
    return (
      <main id="contenido" className={styles.pagina}>
        <section className={styles.acceso} aria-labelledby="tituloAcceso">
          <h1 id="tituloAcceso">Acceso denegado</h1>
          <p>No tienes permisos para administrar las notificaciones.</p>
          <Link className={styles.enlace} href="/">Volver al inicio</Link>
        </section>
      </main>
    );
  }

  return (
    <main id="contenido" className={styles.pagina}>
      <div className={`container ${styles.contenido}`}>
        <header className={styles.encabezado}>
          <p className={styles.antetitulo}>Administración</p>
          <h1>Notificaciones push</h1>
          <p>Envía avisos a todos los usuarios activos o a roles específicos.</p>
        </header>

        <div className={styles.grilla}>
          <section className={styles.tarjeta} aria-labelledby="tituloFormulario">
            <h2 id="tituloFormulario">Enviar notificación</h2>
            <form onSubmit={enviar}>
              <div className={styles.campo}>
                <label htmlFor="titulo">Título</label>
                <input
                  id="titulo"
                  name="titulo"
                  value={titulo}
                  onChange={(evento) => setTitulo(evento.target.value)}
                  placeholder="Ej.: Recordatorio de evento"
                  required
                  disabled={enviando}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="cuerpo">Cuerpo del mensaje</label>
                <textarea
                  id="cuerpo"
                  name="cuerpo"
                  value={cuerpo}
                  onChange={(evento) => setCuerpo(evento.target.value)}
                  placeholder="Escribe el mensaje para los usuarios"
                  rows={5}
                  required
                  disabled={enviando}
                />
              </div>

              <fieldset className={styles.roles} disabled={enviando}>
                <legend>Roles destino</legend>
                <p>Deja todos los roles sin marcar para enviar a todos.</p>
                {ROLES.map((rol) => (
                  <label key={rol}>
                    <input
                      type="checkbox"
                      checked={rolesSeleccionados.includes(rol)}
                      onChange={() =>
                        setRolesSeleccionados((actuales) =>
                          actuales.includes(rol)
                            ? actuales.filter((seleccionado) => seleccionado !== rol)
                            : [...actuales, rol],
                        )
                      }
                    />
                    {rol}
                  </label>
                ))}
              </fieldset>

              {errorValidacion && <p className={styles.error} role="alert">{errorValidacion}</p>}
              {error && <p className={styles.error} role="alert">{error}</p>}
              {mensaje && <p className={styles.exito} role="status">{mensaje}</p>}

              <BotonEnvio
                texto="Enviar notificación"
                textoCargando="Enviando…"
                cargando={enviando}
              />
            </form>
          </section>

          <section className={styles.tarjeta} aria-labelledby="tituloHistorial">
            <h2 id="tituloHistorial">Historial</h2>
            <p className={styles.textoHistorial}>
              Las notificaciones enviadas aparecerán aquí cuando el backend implemente el historial.
            </p>
            {errorHistorial ? (
              <p className={styles.error} role="alert">{errorHistorial}</p>
            ) : historial === null ? (
              <p className={styles.estado} role="status">Cargando historial…</p>
            ) : historial.length === 0 ? (
              <p className={styles.estado}>Aún no hay notificaciones en el historial.</p>
            ) : (
              <p className={styles.estado}>
                Hay {historial.length} registros. La presentación del historial está pendiente de definir.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Notifications;
