import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ApiError } from "../../api/client";
import {
  crearCurso,
  desactivarCurso,
  editarCurso,
  listarCursos,
  obtenerCurso,
  type Curso,
  type CursoCreateRequest,
} from "../../api/cursos";
import { useAuth } from "../../auth/AuthContext";
import CursoForm from "../../components/organisms/CursoForm";
import useDocumentTitle from "../hooks/useDocumentTitle";
import styles from "./Cursos.module.css";

function mensajeDeError(error: unknown, predeterminado: string): string {
  return error instanceof ApiError || error instanceof Error ? error.message : predeterminado;
}

function formatearFecha(fecha: string): string {
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

const Cursos = () => {
  const { token, usuario, isAuthenticated, isReady } = useAuth();
  const esAdministrador = usuario?.rol === "ADMINISTRADOR";
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cursoFormulario, setCursoFormulario] = useState<Curso | null | undefined>(undefined);
  const [cursoDetalle, setCursoDetalle] = useState<Curso | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState<number | null>(null);

  useDocumentTitle("Gestión de cursos");

  const cargarCursos = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setErrorCarga(null);
    try {
      setCursos(await listarCursos(token));
    } catch (error) {
      setErrorCarga(mensajeDeError(error, "No pudimos cargar los cursos."));
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (isReady && isAuthenticated) void cargarCursos();
  }, [isReady, isAuthenticated, cargarCursos]);

  const verDetalle = async (id: number) => {
    if (!token) return;
    setCursoDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);
    try {
      setCursoDetalle(await obtenerCurso(id, token));
    } catch (error) {
      setErrorDetalle(mensajeDeError(error, "No pudimos cargar el detalle del curso."));
    } finally {
      setCargandoDetalle(false);
    }
  };

  const guardarCurso = async (datos: CursoCreateRequest) => {
    if (!token) return;
    setGuardando(true);
    setErrorCarga(null);
    setMensaje(null);
    try {
      if (cursoFormulario) {
        const actualizado = await editarCurso(cursoFormulario.id, datos, token);
        setCursoDetalle((actual) => actual?.id === actualizado.id ? actualizado : actual);
        setMensaje("El curso se actualizó correctamente.");
      } else {
        await crearCurso(datos, token);
        setMensaje("El curso se creó correctamente.");
      }
      setCursoFormulario(undefined);
      await cargarCursos();
    } catch (error) {
      setErrorCarga(mensajeDeError(error, "No pudimos guardar el curso."));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarDesactivacion = async (curso: Curso) => {
    if (!token || !window.confirm(`¿Desactivar "${curso.titulo}"? Dejará de aparecer en el catálogo de la app móvil.`)) {
      return;
    }

    setDesactivandoId(curso.id);
    setErrorCarga(null);
    setMensaje(null);
    try {
      await desactivarCurso(curso.id, token);
      setCursoDetalle((actual) => actual?.id === curso.id ? null : actual);
      setMensaje("El curso se desactivó correctamente.");
      await cargarCursos();
    } catch (error) {
      setErrorCarga(mensajeDeError(error, "No pudimos desactivar el curso."));
    } finally {
      setDesactivandoId(null);
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
          <h1 id="tituloAcceso">Inicia sesión para ver los cursos</h1>
          <p>El catálogo está disponible para usuarios autenticados.</p>
          <Link className={styles.boton} href="/login">Ir a iniciar sesión</Link>
        </section>
      </main>
    );
  }

  return (
    <main id="contenido" className={styles.pagina}>
      <div className={`container ${styles.contenido}`}>
        <header className={styles.encabezado}>
          <div>
            <p className={styles.antetitulo}>SyncPass · Administración</p>
            <h1>Gestión de cursos</h1>
            <p>Consulta los cursos activos y revisa sus detalles.</p>
          </div>
          {esAdministrador && (
            <button
              type="button"
              className={styles.boton}
              onClick={() => {
                setMensaje(null);
                setErrorCarga(null);
                setCursoFormulario(null);
              }}
            >
              Nuevo curso
            </button>
          )}
        </header>

        {errorCarga && <p className={styles.error} role="alert">{errorCarga}</p>}
        {mensaje && <p className={styles.exito} role="status">{mensaje}</p>}

        {cursoFormulario !== undefined && esAdministrador && (
          <CursoForm
            key={cursoFormulario?.id ?? "nuevo"}
            curso={cursoFormulario}
            guardando={guardando}
            onGuardar={guardarCurso}
            onCancelar={() => setCursoFormulario(undefined)}
          />
        )}

        <section className={styles.seccion} aria-labelledby="tituloLista">
          <div className={styles.seccionEncabezado}>
            <h2 id="tituloLista">Cursos activos</h2>
            <button type="button" className={styles.botonTexto} onClick={() => void cargarCursos()} disabled={cargando}>
              {cargando ? "Actualizando…" : "Actualizar lista"}
            </button>
          </div>

          {cargando && cursos.length === 0 ? (
            <p className={styles.estado} role="status">Cargando cursos…</p>
          ) : cursos.length === 0 ? (
            <p className={styles.estado}>No hay cursos activos para mostrar.</p>
          ) : (
            <div className={styles.tablaContenedor}>
              <table className={styles.tabla}>
                <caption className="sr-only">Listado de cursos activos</caption>
                <thead>
                  <tr>
                    <th scope="col">Título</th>
                    <th scope="col">Área temática</th>
                    <th scope="col">Unidad vecinal</th>
                    <th scope="col">Fechas</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Detalle</th>
                    {esAdministrador && <th scope="col">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((curso) => (
                    <tr key={curso.id}>
                      <td data-label="Título">{curso.titulo}</td>
                      <td data-label="Área temática">{curso.areaTematica}</td>
                      <td data-label="Unidad vecinal">{curso.unidadVecinal}</td>
                      <td data-label="Fechas">
                        {formatearFecha(curso.fechaInicio)} – {formatearFecha(curso.fechaTermino)}
                      </td>
                      <td data-label="Estado">
                        <span className={styles.estadoBadge} data-estado={curso.estado}>{curso.estado}</span>
                      </td>
                      <td data-label="Detalle">
                        <button type="button" className={styles.botonTexto} onClick={() => void verDetalle(curso.id)}>
                          Ver detalle
                        </button>
                      </td>
                      {esAdministrador && (
                        <td data-label="Acciones" className={styles.accionesTabla}>
                          <button
                            type="button"
                            className={styles.botonTexto}
                            onClick={() => {
                              setMensaje(null);
                              setErrorCarga(null);
                              setCursoFormulario(curso);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.botonPeligro}
                            onClick={() => void confirmarDesactivacion(curso)}
                            disabled={desactivandoId === curso.id}
                          >
                            {desactivandoId === curso.id ? "Desactivando…" : "Desactivar"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {(cargandoDetalle || errorDetalle || cursoDetalle) && (
          <section className={styles.detalle} aria-labelledby="tituloDetalle">
            <div className={styles.seccionEncabezado}>
              <h2 id="tituloDetalle">Detalle del curso</h2>
              <button type="button" className={styles.botonTexto} onClick={() => setCursoDetalle(null)}>
                Cerrar
              </button>
            </div>
            {cargandoDetalle && <p className={styles.estado} role="status">Cargando detalle…</p>}
            {errorDetalle && <p className={styles.error} role="alert">{errorDetalle}</p>}
            {cursoDetalle && (
              <dl className={styles.listaDetalle}>
                <div><dt>Título</dt><dd>{cursoDetalle.titulo}</dd></div>
                <div><dt>Descripción</dt><dd>{cursoDetalle.descripcion || "Sin descripción"}</dd></div>
                <div><dt>Área temática</dt><dd>{cursoDetalle.areaTematica}</dd></div>
                <div><dt>Unidad vecinal</dt><dd>{cursoDetalle.unidadVecinal}</dd></div>
                <div><dt>Fecha de inicio</dt><dd>{formatearFecha(cursoDetalle.fechaInicio)}</dd></div>
                <div><dt>Fecha de término</dt><dd>{formatearFecha(cursoDetalle.fechaTermino)}</dd></div>
                <div><dt>Estado</dt><dd>{cursoDetalle.estado}</dd></div>
              </dl>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default Cursos;
