import { useState, type SubmitEvent } from "react";
import {
  ESTADOS_CURSO,
  type Curso,
  type CursoCreateRequest,
  type EstadoCurso,
} from "../../api/cursos";
import styles from "./CursoForm.module.css";

interface CursoFormProps {
  curso: Curso | null;
  guardando: boolean;
  onGuardar: (datos: CursoCreateRequest) => Promise<void>;
  onCancelar: () => void;
}

interface ValoresFormulario {
  titulo: string;
  descripcion: string;
  areaTematica: string;
  unidadVecinal: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoCurso;
}

type ErroresFormulario = Partial<Record<keyof ValoresFormulario, string>>;

const CursoForm = ({ curso, guardando, onGuardar, onCancelar }: CursoFormProps) => {
  const [valores, setValores] = useState<ValoresFormulario>({
    titulo: curso?.titulo ?? "",
    descripcion: curso?.descripcion ?? "",
    areaTematica: curso?.areaTematica ?? "",
    unidadVecinal: curso?.unidadVecinal ?? "",
    fechaInicio: curso?.fechaInicio ?? "",
    fechaTermino: curso?.fechaTermino ?? "",
    estado: curso?.estado ?? "PLANIFICADO",
  });
  const [errores, setErrores] = useState<ErroresFormulario>({});

  const actualizar = <K extends keyof ValoresFormulario>(campo: K, valor: ValoresFormulario[K]) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
  };

  const guardar = async (evento: SubmitEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevosErrores: ErroresFormulario = {};

    if (!valores.titulo.trim()) nuevosErrores.titulo = "El título es obligatorio.";
    if (valores.titulo.trim().length > 150) nuevosErrores.titulo = "El título admite hasta 150 caracteres.";
    if (!valores.areaTematica.trim()) nuevosErrores.areaTematica = "El área temática es obligatoria.";
    if (valores.areaTematica.trim().length > 60) nuevosErrores.areaTematica = "El área temática admite hasta 60 caracteres.";
    if (!valores.unidadVecinal.trim()) nuevosErrores.unidadVecinal = "La unidad vecinal es obligatoria.";
    if (valores.unidadVecinal.trim().length > 100) nuevosErrores.unidadVecinal = "La unidad vecinal admite hasta 100 caracteres.";
    if (!valores.fechaInicio) nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria.";
    if (!valores.fechaTermino) nuevosErrores.fechaTermino = "La fecha de término es obligatoria.";
    if (valores.descripcion.length > 1000) nuevosErrores.descripcion = "La descripción admite hasta 1000 caracteres.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    await onGuardar({
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim() || undefined,
      areaTematica: valores.areaTematica.trim(),
      unidadVecinal: valores.unidadVecinal.trim(),
      fechaInicio: valores.fechaInicio,
      fechaTermino: valores.fechaTermino,
      estado: valores.estado,
    });
  };

  return (
    <form className={styles.formulario} onSubmit={guardar} noValidate>
      <div className={styles.encabezado}>
        <h2>{curso ? "Editar curso" : "Nuevo curso"}</h2>
        <p>Completa la información del curso.</p>
      </div>

      <div className={styles.grilla}>
        <div className={styles.campo}>
          <label htmlFor="curso-titulo">Título <span aria-hidden="true">*</span></label>
          <input
            id="curso-titulo"
            value={valores.titulo}
            onChange={(evento) => actualizar("titulo", evento.target.value)}
            maxLength={150}
            required
            disabled={guardando}
            aria-invalid={Boolean(errores.titulo)}
            aria-describedby={errores.titulo ? "curso-titulo-error" : undefined}
          />
          {errores.titulo && <p className={styles.error} id="curso-titulo-error">{errores.titulo}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="curso-area">Área temática <span aria-hidden="true">*</span></label>
          <input
            id="curso-area"
            value={valores.areaTematica}
            onChange={(evento) => actualizar("areaTematica", evento.target.value)}
            maxLength={60}
            required
            disabled={guardando}
            aria-invalid={Boolean(errores.areaTematica)}
            aria-describedby={errores.areaTematica ? "curso-area-error" : undefined}
          />
          {errores.areaTematica && <p className={styles.error} id="curso-area-error">{errores.areaTematica}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="curso-unidad">Unidad vecinal <span aria-hidden="true">*</span></label>
          <input
            id="curso-unidad"
            value={valores.unidadVecinal}
            onChange={(evento) => actualizar("unidadVecinal", evento.target.value)}
            maxLength={100}
            required
            disabled={guardando}
            aria-invalid={Boolean(errores.unidadVecinal)}
            aria-describedby={errores.unidadVecinal ? "curso-unidad-error" : undefined}
          />
          {errores.unidadVecinal && <p className={styles.error} id="curso-unidad-error">{errores.unidadVecinal}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="curso-estado">Estado <span aria-hidden="true">*</span></label>
          <select
            id="curso-estado"
            value={valores.estado}
            onChange={(evento) => {
              const estado = ESTADOS_CURSO.find((opcion) => opcion === evento.target.value);
              if (estado) actualizar("estado", estado);
            }}
            disabled={guardando}
            required
          >
            {ESTADOS_CURSO.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="curso-inicio">Fecha de inicio <span aria-hidden="true">*</span></label>
          <input
            id="curso-inicio"
            type="date"
            value={valores.fechaInicio}
            onChange={(evento) => actualizar("fechaInicio", evento.target.value)}
            required
            disabled={guardando}
            aria-invalid={Boolean(errores.fechaInicio)}
            aria-describedby={errores.fechaInicio ? "curso-inicio-error" : undefined}
          />
          {errores.fechaInicio && <p className={styles.error} id="curso-inicio-error">{errores.fechaInicio}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="curso-termino">Fecha de término <span aria-hidden="true">*</span></label>
          <input
            id="curso-termino"
            type="date"
            value={valores.fechaTermino}
            onChange={(evento) => actualizar("fechaTermino", evento.target.value)}
            required
            disabled={guardando}
            aria-invalid={Boolean(errores.fechaTermino)}
            aria-describedby={errores.fechaTermino ? "curso-termino-error" : undefined}
          />
          {errores.fechaTermino && <p className={styles.error} id="curso-termino-error">{errores.fechaTermino}</p>}
        </div>

        <div className={`${styles.campo} ${styles.descripcion}`}>
          <label htmlFor="curso-descripcion">Descripción</label>
          <textarea
            id="curso-descripcion"
            value={valores.descripcion}
            onChange={(evento) => actualizar("descripcion", evento.target.value)}
            maxLength={1000}
            rows={4}
            disabled={guardando}
            aria-invalid={Boolean(errores.descripcion)}
            aria-describedby={errores.descripcion ? "curso-descripcion-error" : undefined}
          />
          {errores.descripcion && <p className={styles.error} id="curso-descripcion-error">{errores.descripcion}</p>}
        </div>
      </div>

      <div className={styles.acciones}>
        <button type="button" className={styles.botonSecundario} onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className={styles.botonPrimario} disabled={guardando} aria-busy={guardando}>
          {guardando ? "Guardando…" : curso ? "Guardar cambios" : "Crear curso"}
        </button>
      </div>
    </form>
  );
};

export default CursoForm;
