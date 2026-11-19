import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ApiError } from "../../api/client";
import {
  crearCurso,
  desactivarCurso,
  editarCurso,
  listarCursos,
  type Curso,
  type CursoCreateRequest,
  type EstadoCurso,
} from "../../api/cursos";
import { useAuth } from "../../contexts/AuthContext";
import botones from "../../components/organisms/Botones.module.css";
import {
  ETIQUETAS_ESTADO,
  describirDuracion,
  duracionEnDias,
  formatearFecha,
  ordenarCursos,
  valoresUnicos,
} from "../../utils/curso";
import Dialogo from "../../components/molecules/Dialogo";
import Icon from "../../components/atoms/Icon";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import styles from "./Cursos.module.css";

// Solo los administradores usan el formulario: se descarga aparte, y se precarga al pasar el
// puntero o el foco por "Nuevo curso" / "Editar" para que abra sin espera.
const cargarFormulario = () => import("../../components/organisms/CursoForm");
const CursoForm = lazy(cargarFormulario);
const precargarFormulario = () => {
  void cargarFormulario();
};

const DURACION_AVISO_MS = 4000;
const FILAS_ESQUELETO = [1, 2, 3];
const COLUMNAS_ESQUELETO = [1, 2, 3, 4, 5];

function mensajeDeError(error: unknown, predeterminado: string): string {
  return error instanceof ApiError || error instanceof Error ? error.message : predeterminado;
}

const EstadoBadge = ({ estado }: { estado: EstadoCurso }) => (
  <span className={styles.estadoBadge} data-estado={estado}>{ETIQUETAS_ESTADO[estado]}</span>
);

const Cursos = () => {
  const { token, usuario, isAuthenticated, isReady } = useAuth();
  const esAdministrador = usuario?.rol === "ADMINISTRADOR";
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);
  // undefined: formulario cerrado · null: curso nuevo · Curso: edición
  const [cursoFormulario, setCursoFormulario] = useState<Curso | null | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [cursoDetalle, setCursoDetalle] = useState<Curso | null>(null);
  const [cursoADesactivar, setCursoADesactivar] = useState<Curso | null>(null);
  const [desactivando, setDesactivando] = useState(false);
  const [errorDesactivar, setErrorDesactivar] = useState<string | null>(null);
  const tituloListaRef = useRef<HTMLHeadingElement>(null);

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

  // El aviso de éxito y el resaltado de la fila desaparecen solos
  useEffect(() => {
    if (!aviso) return;
    const temporizador = window.setTimeout(() => {
      setAviso(null);
      setResaltadoId(null);
    }, DURACION_AVISO_MS);
    return () => window.clearTimeout(temporizador);
  }, [aviso]);

  // Sugerencias para los desplegables del formulario, a partir de los cursos ya cargados
  const sugerencias = useMemo(
    () => ({
      areas: valoresUnicos(cursos.map((curso) => curso.areaTematica)),
      unidades: valoresUnicos(cursos.map((curso) => curso.unidadVecinal)),
    }),
    [cursos],
  );

  /** Al cerrar el formulario el foco vuelve al listado, en vez de perderse. */
  const enfocarListado = () => {
    requestAnimationFrame(() => tituloListaRef.current?.focus());
  };

  const abrirFormulario = (curso: Curso | null) => {
    setAviso(null);
    setErrorGuardar(null);
    setCursoDetalle(null);
    setCursoFormulario(curso);
  };

  const cerrarFormulario = () => {
    setCursoFormulario(undefined);
    setErrorGuardar(null);
    enfocarListado();
  };

  const guardarCurso = async (datos: CursoCreateRequest) => {
    if (!token) return;
    setGuardando(true);
    setErrorGuardar(null);
    try {
      // El backend devuelve el curso guardado: se actualiza la lista local sin volver a pedirla
      if (cursoFormulario) {
        const actualizado = await editarCurso(cursoFormulario.id, datos, token);
        const finalizado = actualizado.estado === "FINALIZADO";
        setCursos((actuales) =>
          ordenarCursos(
            finalizado
              ? actuales.filter((curso) => curso.id !== actualizado.id)
              : actuales.map((curso) => (curso.id === actualizado.id ? actualizado : curso)),
          ),
        );
        setResaltadoId(finalizado ? null : actualizado.id);
        setAviso(
          finalizado
            ? `«${actualizado.titulo}» quedó finalizado y salió del listado.`
            : `Se guardaron los cambios de «${actualizado.titulo}».`,
        );
      } else {
        const creado = await crearCurso(datos, token);
        setCursos((actuales) => ordenarCursos([...actuales, creado]));
        setResaltadoId(creado.id);
        setAviso(`Se creó el curso «${creado.titulo}».`);
      }
      setCursoFormulario(undefined);
      enfocarListado();
    } catch (error) {
      setErrorGuardar(mensajeDeError(error, "No pudimos guardar el curso. Inténtalo de nuevo."));
    } finally {
      setGuardando(false);
    }
  };

  const pedirDesactivacion = (curso: Curso) => {
    setErrorDesactivar(null);
    setCursoADesactivar(curso);
  };

  const confirmarDesactivacion = async () => {
    if (!token || !cursoADesactivar) return;
    const curso = cursoADesactivar;
    setDesactivando(true);
    setErrorDesactivar(null);
    try {
      await desactivarCurso(curso.id, token);
      setCursos((actuales) => actuales.filter((actual) => actual.id !== curso.id));
      setCursoFormulario((actual) => (actual?.id === curso.id ? undefined : actual));
      setCursoADesactivar(null);
      setAviso(`Se desactivó «${curso.titulo}».`);
    } catch (error) {
      setErrorDesactivar(mensajeDeError(error, "No pudimos desactivar el curso. Inténtalo de nuevo."));
    } finally {
      setDesactivando(false);
    }
  };

  if (!isReady) {
    return (
      <main id="contenido" className={styles.pagina}>
        <p className={styles.verificando} role="status">
          <span className={botones.spinner} aria-hidden="true" />
          Verificando la sesión…
        </p>
      </main>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <main id="contenido" className={styles.pagina}>
        <section className={styles.acceso} aria-labelledby="tituloAcceso">
          <span className={styles.accesoIcono} aria-hidden="true">
            <Icon nombre="candado" tamano={26} />
          </span>
          <h1 id="tituloAcceso">Inicia sesión para ver los cursos</h1>
          <p>El catálogo de cursos está disponible para usuarios autenticados.</p>
          <Link className={`${botones.boton} ${botones.primario}`} href="/login">Ir a iniciar sesión</Link>
        </section>
      </main>
    );
  }

  const columnas = (
    <tr>
      <th scope="col">Curso</th>
      <th scope="col">Área temática</th>
      <th scope="col">Unidad vecinal</th>
      <th scope="col">Periodo</th>
      <th scope="col">Estado</th>
      <th scope="col"><span className="sr-only">Acciones</span></th>
    </tr>
  );

  return (
    <main id="contenido" className={styles.pagina}>
      <div className={`container ${styles.contenido}`}>
        <header className={styles.encabezado}>
          <div>
            <p className={styles.antetitulo}>SyncPass · Administración</p>
            <h1>Gestión de cursos</h1>
            <p>
              {esAdministrador
                ? "Crea, edita y desactiva los cursos de la comunidad."
                : "Consulta los cursos activos y sus detalles."}
            </p>
          </div>
          {esAdministrador && (
            <button
              type="button"
              className={`${botones.boton} ${botones.primario}`}
              onPointerEnter={precargarFormulario}
              onFocus={precargarFormulario}
              onClick={() => abrirFormulario(null)}
              disabled={cursoFormulario === null}
            >
              <Icon nombre="mas" tamano={18} />
              Nuevo curso
            </button>
          )}
        </header>

        {/* Región viva siempre presente: así el lector de pantalla anuncia cada aviso */}
        <div role="status" aria-live="polite" className={styles.avisoRegion}>
          {aviso && (
            <div className={styles.aviso}>
              <Icon nombre="checkCirculo" tamano={20} />
              <p>{aviso}</p>
              <button
                type="button"
                className={styles.avisoCerrar}
                onClick={() => setAviso(null)}
                aria-label="Cerrar aviso"
              >
                <Icon nombre="x" tamano={16} />
              </button>
            </div>
          )}
        </div>

        {cursoFormulario !== undefined && esAdministrador && (
          <Suspense
            fallback={
              <p className={styles.formularioCargando} role="status">
                <span className={botones.spinner} aria-hidden="true" />
                Cargando formulario…
              </p>
            }
          >
            <CursoForm
              key={cursoFormulario?.id ?? "nuevo"}
              curso={cursoFormulario}
              guardando={guardando}
              errorServidor={errorGuardar}
              sugerencias={sugerencias}
              onGuardar={guardarCurso}
              onCancelar={cerrarFormulario}
            />
          </Suspense>
        )}

        <section className={styles.seccion} aria-labelledby="tituloLista" aria-busy={cargando}>
          <div className={styles.seccionEncabezado}>
            <div className={styles.tituloLista}>
              <h2 id="tituloLista" ref={tituloListaRef} tabIndex={-1}>Cursos activos</h2>
              {cursos.length > 0 && (
                <span className={styles.cuenta}>
                  {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
                </span>
              )}
            </div>
            <button
              type="button"
              className={`${botones.boton} ${botones.texto} ${botones.compacto}`}
              onClick={() => void cargarCursos()}
              disabled={cargando}
            >
              <Icon nombre="refrescar" tamano={16} className={cargando ? styles.girando : undefined} />
              {cargando ? "Actualizando…" : "Actualizar"}
            </button>
          </div>

          {errorCarga && (
            <div className={styles.error} role="alert">
              <Icon nombre="alerta" tamano={20} />
              <p>{errorCarga}</p>
              <button
                type="button"
                className={`${botones.boton} ${botones.secundario} ${botones.compacto}`}
                onClick={() => void cargarCursos()}
                disabled={cargando}
              >
                Reintentar
              </button>
            </div>
          )}

          {cargando && cursos.length === 0 ? (
            <>
              <p className="sr-only" role="status">Cargando cursos…</p>
              <div className={styles.tablaContenedor} aria-hidden="true">
                <table className={styles.tabla}>
                  <thead>{columnas}</thead>
                  <tbody>
                    {FILAS_ESQUELETO.map((fila) => (
                      <tr key={fila}>
                        {COLUMNAS_ESQUELETO.map((columna) => (
                          <td key={columna}><span className={styles.esqueleto} /></td>
                        ))}
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : cursos.length === 0 ? (
            !errorCarga && (
              <div className={styles.vacio}>
                <span className={styles.vacioIcono} aria-hidden="true">
                  <Icon nombre="libro" tamano={28} />
                </span>
                <h3>Aún no hay cursos activos</h3>
                <p>
                  {esAdministrador
                    ? "Crea el primero y aparecerá en este listado."
                    : "Cuando se publiquen cursos aparecerán aquí."}
                </p>
                {esAdministrador && cursoFormulario === undefined && (
                  <button
                    type="button"
                    className={`${botones.boton} ${botones.primario}`}
                    onPointerEnter={precargarFormulario}
                    onFocus={precargarFormulario}
                    onClick={() => abrirFormulario(null)}
                  >
                    <Icon nombre="mas" tamano={18} />
                    Crear el primer curso
                  </button>
                )}
              </div>
            )
          ) : (
            <div className={styles.tablaContenedor}>
              <table className={styles.tabla}>
                <caption className="sr-only">Cursos activos ordenados por fecha de inicio</caption>
                <thead>{columnas}</thead>
                <tbody>
                  {cursos.map((curso) => {
                    const dias = duracionEnDias(curso.fechaInicio, curso.fechaTermino);
                    return (
                      <tr key={curso.id} data-resaltada={curso.id === resaltadoId || undefined}>
                        <td data-label="Curso" className={styles.celdaCurso}>
                          <button
                            type="button"
                            className={styles.tituloCurso}
                            onClick={() => setCursoDetalle(curso)}
                          >
                            {curso.titulo}
                          </button>
                          {curso.descripcion && (
                            <span className={styles.descripcionCorta}>{curso.descripcion}</span>
                          )}
                        </td>
                        <td data-label="Área temática">{curso.areaTematica}</td>
                        <td data-label="Unidad vecinal">{curso.unidadVecinal}</td>
                        <td data-label="Periodo">
                          <div>
                            <span className={styles.periodo}>
                              {formatearFecha(curso.fechaInicio)} – {formatearFecha(curso.fechaTermino)}
                            </span>
                            {dias !== null && <span className={styles.duracion}>{describirDuracion(dias)}</span>}
                          </div>
                        </td>
                        <td data-label="Estado"><EstadoBadge estado={curso.estado} /></td>
                        <td data-label="Acciones" className={styles.celdaAcciones}>
                          <div className={styles.acciones}>
                            <button
                              type="button"
                              className={`${botones.boton} ${botones.texto} ${botones.compacto}`}
                              onClick={() => setCursoDetalle(curso)}
                              aria-label={`Ver detalle de ${curso.titulo}`}
                            >
                              <Icon nombre="ojo" tamano={16} />
                              Ver
                            </button>
                            {esAdministrador && (
                              <>
                                <button
                                  type="button"
                                  className={`${botones.boton} ${botones.texto} ${botones.compacto}`}
                                  onPointerEnter={precargarFormulario}
                                  onFocus={precargarFormulario}
                                  onClick={() => abrirFormulario(curso)}
                                  aria-label={`Editar ${curso.titulo}`}
                                >
                                  <Icon nombre="lapiz" tamano={16} />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className={`${botones.boton} ${botones.textoPeligro} ${botones.compacto}`}
                                  onClick={() => pedirDesactivacion(curso)}
                                  aria-label={`Desactivar ${curso.titulo}`}
                                >
                                  <Icon nombre="archivar" tamano={16} />
                                  Desactivar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialogo
        abierto={cursoDetalle !== null}
        titulo={cursoDetalle?.titulo ?? "Detalle del curso"}
        onCerrar={() => setCursoDetalle(null)}
        acciones={
          <>
            <button
              type="button"
              className={`${botones.boton} ${botones.secundario}`}
              onClick={() => setCursoDetalle(null)}
            >
              Cerrar
            </button>
            {esAdministrador && cursoDetalle && (
              <button
                type="button"
                className={`${botones.boton} ${botones.primario}`}
                onPointerEnter={precargarFormulario}
                onFocus={precargarFormulario}
                onClick={() => abrirFormulario(cursoDetalle)}
              >
                <Icon nombre="lapiz" tamano={18} />
                Editar curso
              </button>
            )}
          </>
        }
      >
        {cursoDetalle && (
          <dl className={styles.listaDetalle}>
            <div className={styles.detalleCompleto}>
              <dt>Descripción</dt>
              <dd>{cursoDetalle.descripcion || <span className={styles.sinDato}>Sin descripción</span>}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd><EstadoBadge estado={cursoDetalle.estado} /></dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>
                {(() => {
                  const dias = duracionEnDias(cursoDetalle.fechaInicio, cursoDetalle.fechaTermino);
                  return dias !== null ? describirDuracion(dias) : "—";
                })()}
              </dd>
            </div>
            <div>
              <dt>Área temática</dt>
              <dd>{cursoDetalle.areaTematica}</dd>
            </div>
            <div>
              <dt>Unidad vecinal</dt>
              <dd>{cursoDetalle.unidadVecinal}</dd>
            </div>
            <div>
              <dt>Inicio</dt>
              <dd>{formatearFecha(cursoDetalle.fechaInicio, "largo")}</dd>
            </div>
            <div>
              <dt>Término</dt>
              <dd>{formatearFecha(cursoDetalle.fechaTermino, "largo")}</dd>
            </div>
          </dl>
        )}
      </Dialogo>

      <Dialogo
        abierto={cursoADesactivar !== null}
        titulo="¿Desactivar este curso?"
        tono="peligro"
        bloqueado={desactivando}
        onCerrar={() => setCursoADesactivar(null)}
        acciones={
          <>
            <button
              type="button"
              className={`${botones.boton} ${botones.secundario}`}
              onClick={() => setCursoADesactivar(null)}
              disabled={desactivando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${botones.boton} ${botones.peligro}`}
              onClick={() => void confirmarDesactivacion()}
              disabled={desactivando}
              aria-busy={desactivando}
            >
              {desactivando ? (
                <>
                  <span className={botones.spinner} aria-hidden="true" />
                  Desactivando…
                </>
              ) : (
                <>
                  <Icon nombre="archivar" tamano={18} />
                  Desactivar
                </>
              )}
            </button>
          </>
        }
      >
        {cursoADesactivar && (
          <>
            <p>
              <strong className={styles.textoFuerte}>«{cursoADesactivar.titulo}»</strong> pasará a Finalizado y
              dejará de aparecer en el listado de cursos activos.
            </p>
            <p>Sus eventos, inscripciones y asistencias se conservan.</p>
            {errorDesactivar && (
              <p className={styles.error} role="alert">
                <Icon nombre="alerta" tamano={20} />
                {errorDesactivar}
              </p>
            )}
          </>
        )}
      </Dialogo>
    </main>
  );
};

export default Cursos;
