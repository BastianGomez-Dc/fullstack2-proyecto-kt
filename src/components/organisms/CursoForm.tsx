import { useEffect, useId, useRef, useState, type ReactNode, type SubmitEvent } from "react";
import {
  ESTADOS_CURSO,
  type Curso,
  type CursoCreateRequest,
  type EstadoCurso,
} from "../../api/cursos";
import Dialogo from "../molecules/Dialogo";
import Icon from "../atoms/Icon";
import botones from "./Botones.module.css";
import {
  ETIQUETAS_CAMPO,
  ETIQUETAS_ESTADO,
  LIMITES,
  ORDEN_CAMPOS,
  describirDuracion,
  duracionEnDias,
  formatearFecha,
  validarCurso,
  type CampoCurso,
  type ValoresCurso,
} from "./curso";
import styles from "./CursoForm.module.css";

export interface SugerenciasCurso {
  areas: string[];
  unidades: string[];
}

interface CursoFormProps {
  curso: Curso | null;
  guardando: boolean;
  /** Error devuelto por el backend al guardar; se muestra junto a los botones. */
  errorServidor: string | null;
  /** Valores ya usados en otros cursos, para los desplegables de área y unidad. */
  sugerencias: SugerenciasCurso;
  onGuardar: (datos: CursoCreateRequest) => Promise<void>;
  onCancelar: () => void;
}

const valoresDe = (curso: Curso | null): ValoresCurso => ({
  titulo: curso?.titulo ?? "",
  descripcion: curso?.descripcion ?? "",
  areaTematica: curso?.areaTematica ?? "",
  unidadVecinal: curso?.unidadVecinal ?? "",
  fechaInicio: curso?.fechaInicio ?? "",
  fechaTermino: curso?.fechaTermino ?? "",
  estado: curso?.estado ?? "PLANIFICADO",
});

const esEstado = (valor: string): valor is EstadoCurso =>
  (ESTADOS_CURSO as readonly string[]).includes(valor);

const CursoForm = ({ curso, guardando, errorServidor, sugerencias, onGuardar, onCancelar }: CursoFormProps) => {
  const prefijo = useId();
  const idDe = (campo: CampoCurso) => `${prefijo}-${campo}`;
  const [iniciales] = useState(() => valoresDe(curso));
  const [valores, setValores] = useState(iniciales);
  const [tocados, setTocados] = useState<Partial<Record<CampoCurso, true>>>({});
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resumenRef = useRef<HTMLDivElement>(null);

  const esEdicion = curso !== null;
  // Derivados en cada render (son baratos): sin estado duplicado ni efectos que sincronizar
  const errores = validarCurso(valores);
  const camposConError = ORDEN_CAMPOS.filter((campo) => errores[campo]);
  const duracion = duracionEnDias(valores.fechaInicio, valores.fechaTermino);
  const hayCambios = ORDEN_CAMPOS.some((campo) => valores[campo] !== iniciales[campo]);
  // Un curso nuevo no nace finalizado: se desactiva desde el listado
  const estados = esEdicion ? ESTADOS_CURSO : ESTADOS_CURSO.filter((estado) => estado !== "FINALIZADO");

  // Al abrir: llevar el formulario a la vista y dejar el foco en el primer campo
  useEffect(() => {
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({ behavior: movimientoReducido ? "auto" : "smooth", block: "start" });
    document.getElementById(`${prefijo}-titulo`)?.focus({ preventScroll: true });
  }, [prefijo]);

  // Tras un envío con errores, el foco va al resumen, que enlaza cada campo inválido
  useEffect(() => {
    if (intentosFallidos > 0) resumenRef.current?.focus();
  }, [intentosFallidos]);

  /** Se valida al salir del campo, no mientras se escribe; tras un envío fallido se muestran todos. */
  const errorVisible = (campo: CampoCurso): string | undefined => {
    const error = errores[campo];
    if (!error) return undefined;
    if (intentosFallidos > 0 || tocados[campo]) return error;
    // Fechas invertidas: se avisa apenas ambas están elegidas
    if (campo === "fechaTermino" && valores.fechaInicio && valores.fechaTermino) return error;
    return undefined;
  };

  const actualizar = <K extends CampoCurso>(campo: K, valor: ValoresCurso[K]) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
  };

  const marcarTocado = (campo: CampoCurso) => {
    setTocados((actuales) => (actuales[campo] ? actuales : { ...actuales, [campo]: true }));
  };

  const propsCampo = (campo: CampoCurso, conAyuda = false) => {
    const error = errorVisible(campo);
    return {
      id: idDe(campo),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${idDe(campo)}-error` : conAyuda ? `${idDe(campo)}-ayuda` : undefined,
      onBlur: () => marcarTocado(campo),
    };
  };

  // Espacio fijo bajo cada campo: el error reemplaza a la ayuda sin empujar el resto del formulario
  const mensaje = (campo: CampoCurso, ayuda?: ReactNode) => {
    const error = errorVisible(campo);
    return error ? (
      <p className={styles.mensaje} data-tipo="error" id={`${idDe(campo)}-error`} aria-live="polite">
        <Icon nombre="alerta" tamano={16} />
        {error}
      </p>
    ) : (
      <p className={styles.mensaje} id={ayuda ? `${idDe(campo)}-ayuda` : undefined} aria-live="polite">
        {ayuda}
      </p>
    );
  };

  const contador = (campo: "titulo" | "descripcion") => {
    const largo = valores[campo].length;
    const limite = LIMITES[campo];
    return (
      <span className={styles.contador} data-cerca={largo >= limite * 0.9 || undefined} aria-hidden="true">
        {largo}/{limite}
      </span>
    );
  };

  const obligatorio = <span className={styles.obligatorio} aria-hidden="true">*</span>;

  const guardar = async (evento: SubmitEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (guardando) return;
    if (camposConError.length > 0) {
      setIntentosFallidos((intentos) => intentos + 1);
      return;
    }

    const descripcion = valores.descripcion.trim();
    await onGuardar({
      titulo: valores.titulo.trim(),
      // Al editar se envía aunque esté vacía, para poder borrarla; al crear se omite
      descripcion: esEdicion ? descripcion : descripcion || undefined,
      areaTematica: valores.areaTematica.trim(),
      unidadVecinal: valores.unidadVecinal.trim(),
      fechaInicio: valores.fechaInicio,
      fechaTermino: valores.fechaTermino,
      estado: valores.estado,
    });
  };

  const cancelar = () => {
    if (hayCambios) setConfirmarDescarte(true);
    else onCancelar();
  };

  const textoDuracion =
    duracion !== null ? (
      <>Duración: <strong>{describirDuracion(duracion)}</strong></>
    ) : valores.fechaInicio && valores.fechaTermino ? (
      "Corrige las fechas para calcular la duración."
    ) : (
      "Elige ambas fechas para ver la duración del curso."
    );

  const ayudaEstado =
    valores.estado === "FINALIZADO"
      ? "Al guardarlo como Finalizado saldrá del listado de cursos activos."
      : esEdicion
        ? "Planificado: aún no comienza. En curso: ya está en marcha."
        : "Para finalizarlo más adelante, usa «Desactivar» en el listado.";

  return (
    <>
      <form
        ref={formRef}
        className={styles.formulario}
        onSubmit={guardar}
        noValidate
        aria-busy={guardando}
        aria-labelledby={`${prefijo}-encabezado`}
      >
        <header className={styles.encabezado}>
          <span className={styles.encabezadoIcono} aria-hidden="true">
            <Icon nombre={esEdicion ? "lapiz" : "libro"} tamano={22} />
          </span>
          <div>
            <h2 id={`${prefijo}-encabezado`}>{esEdicion ? "Editar curso" : "Nuevo curso"}</h2>
            <p>
              {esEdicion ? (
                <>Estás editando <strong>{curso.titulo}</strong>.</>
              ) : (
                "Completa los datos del curso; podrás editarlos después."
              )}
            </p>
          </div>
        </header>

        {intentosFallidos > 0 && camposConError.length > 0 && (
          <div ref={resumenRef} className={styles.resumen} role="alert" tabIndex={-1}>
            <p className={styles.resumenTitulo}>
              <Icon nombre="alerta" tamano={18} />
              Revisa {camposConError.length === 1 ? "1 campo" : `${camposConError.length} campos`} antes de guardar
            </p>
            <ul>
              {camposConError.map((campo) => (
                <li key={campo}>
                  <button type="button" onClick={() => document.getElementById(idDe(campo))?.focus()}>
                    {ETIQUETAS_CAMPO[campo]}: {errores[campo]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Un solo fieldset deshabilita todo mientras se guarda */}
        <fieldset className={styles.cuerpo} disabled={guardando}>
          <fieldset className={styles.grupo}>
            <legend className={styles.leyenda}>Información general</legend>
            <div className={styles.grilla}>
              <div className={`${styles.campo} ${styles.completo}`}>
                <div className={styles.etiquetaFila}>
                  <label htmlFor={idDe("titulo")}>Título {obligatorio}</label>
                  {contador("titulo")}
                </div>
                <input
                  {...propsCampo("titulo")}
                  value={valores.titulo}
                  onChange={(evento) => actualizar("titulo", evento.target.value)}
                  maxLength={LIMITES.titulo}
                  required
                  autoComplete="off"
                  placeholder="Ej.: Alfabetización digital"
                />
                {mensaje("titulo")}
              </div>

              <div className={`${styles.campo} ${styles.completo}`}>
                <div className={styles.etiquetaFila}>
                  <label htmlFor={idDe("descripcion")}>Descripción</label>
                  {contador("descripcion")}
                </div>
                <textarea
                  {...propsCampo("descripcion", true)}
                  value={valores.descripcion}
                  onChange={(evento) => actualizar("descripcion", evento.target.value)}
                  maxLength={LIMITES.descripcion}
                  rows={4}
                />
                {mensaje("descripcion", "Opcional. Cuenta de qué trata, a quién está dirigido y qué se aprende.")}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend className={styles.leyenda}>Clasificación</legend>
            <div className={styles.grilla}>
              <div className={styles.campo}>
                <label htmlFor={idDe("areaTematica")}>Área temática {obligatorio}</label>
                <input
                  {...propsCampo("areaTematica", true)}
                  list={`${prefijo}-areas`}
                  value={valores.areaTematica}
                  onChange={(evento) => actualizar("areaTematica", evento.target.value)}
                  maxLength={LIMITES.areaTematica}
                  required
                  autoComplete="off"
                  placeholder="Ej.: Educación"
                />
                <datalist id={`${prefijo}-areas`}>
                  {sugerencias.areas.map((area) => <option key={area} value={area} />)}
                </datalist>
                {mensaje(
                  "areaTematica",
                  sugerencias.areas.length > 0
                    ? "Elige una de la lista o escribe una nueva."
                    : "Por ejemplo: Educación, Salud o Medio ambiente.",
                )}
              </div>

              <div className={styles.campo}>
                <label htmlFor={idDe("unidadVecinal")}>Unidad vecinal {obligatorio}</label>
                <input
                  {...propsCampo("unidadVecinal", true)}
                  list={`${prefijo}-unidades`}
                  value={valores.unidadVecinal}
                  onChange={(evento) => actualizar("unidadVecinal", evento.target.value)}
                  maxLength={LIMITES.unidadVecinal}
                  required
                  autoComplete="off"
                  placeholder="Ej.: UV 01"
                />
                <datalist id={`${prefijo}-unidades`}>
                  {sugerencias.unidades.map((unidad) => <option key={unidad} value={unidad} />)}
                </datalist>
                {mensaje(
                  "unidadVecinal",
                  sugerencias.unidades.length > 0 ? "Elige una de la lista o escribe una nueva." : undefined,
                )}
              </div>

              <div className={styles.campo}>
                <label htmlFor={idDe("estado")}>Estado {obligatorio}</label>
                <div className={styles.select} data-estado={valores.estado}>
                  <select
                    {...propsCampo("estado", true)}
                    value={valores.estado}
                    onChange={(evento) => {
                      if (esEstado(evento.target.value)) actualizar("estado", evento.target.value);
                    }}
                    required
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>{ETIQUETAS_ESTADO[estado]}</option>
                    ))}
                  </select>
                  <Icon nombre="chevronAbajo" tamano={18} className={styles.selectIcono} />
                </div>
                {mensaje("estado", ayudaEstado)}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend className={styles.leyenda}>Periodo</legend>
            <div className={styles.grilla}>
              <div className={styles.campo}>
                <label htmlFor={idDe("fechaInicio")}>Fecha de inicio {obligatorio}</label>
                <input
                  {...propsCampo("fechaInicio")}
                  type="date"
                  value={valores.fechaInicio}
                  onChange={(evento) => actualizar("fechaInicio", evento.target.value)}
                  required
                />
                {mensaje("fechaInicio")}
              </div>

              <div className={styles.campo}>
                <label htmlFor={idDe("fechaTermino")}>Fecha de término {obligatorio}</label>
                <input
                  {...propsCampo("fechaTermino", Boolean(valores.fechaInicio))}
                  type="date"
                  // El calendario no deja elegir días anteriores al inicio
                  min={valores.fechaInicio || undefined}
                  value={valores.fechaTermino}
                  onChange={(evento) => actualizar("fechaTermino", evento.target.value)}
                  required
                />
                {mensaje(
                  "fechaTermino",
                  valores.fechaInicio
                    ? `Igual o posterior al ${formatearFecha(valores.fechaInicio, "largo")}.`
                    : undefined,
                )}
              </div>

              <p
                className={`${styles.duracion} ${styles.completo}`}
                data-vacia={duracion === null || undefined}
                aria-live="polite"
              >
                <Icon nombre="calendario" tamano={18} />
                <span>{textoDuracion}</span>
              </p>
            </div>
          </fieldset>
        </fieldset>

        {errorServidor && (
          <p className={styles.errorServidor} role="alert">
            <Icon nombre="alerta" tamano={18} />
            {errorServidor}
          </p>
        )}

        <footer className={styles.acciones}>
          <p className={styles.nota}>
            <span className={styles.obligatorio} aria-hidden="true">*</span> Campos obligatorios
          </p>
          <div className={styles.botones}>
            <button
              type="button"
              className={`${botones.boton} ${botones.secundario}`}
              onClick={cancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${botones.boton} ${botones.primario}`}
              disabled={guardando}
              aria-busy={guardando}
            >
              {guardando ? (
                <>
                  <span className={botones.spinner} aria-hidden="true" />
                  Guardando…
                </>
              ) : (
                <>
                  <Icon nombre="check" tamano={18} />
                  {esEdicion ? "Guardar cambios" : "Crear curso"}
                </>
              )}
            </button>
          </div>
        </footer>
      </form>

      <Dialogo
        abierto={confirmarDescarte}
        titulo="¿Descartar los cambios?"
        onCerrar={() => setConfirmarDescarte(false)}
        acciones={
          <>
            <button
              type="button"
              className={`${botones.boton} ${botones.secundario}`}
              onClick={() => setConfirmarDescarte(false)}
            >
              Seguir editando
            </button>
            <button
              type="button"
              className={`${botones.boton} ${botones.peligro}`}
              onClick={() => {
                setConfirmarDescarte(false);
                onCancelar();
              }}
            >
              Descartar
            </button>
          </>
        }
      >
        <p>Lo que escribiste en el formulario se perderá.</p>
      </Dialogo>
    </>
  );
};

export default CursoForm;
