import type { Curso, EstadoCurso } from "../../api/cursos.ts";

// Lógica pura del mantenedor de cursos (sin React), para poder probarla con node --test.

export const ETIQUETAS_ESTADO: Record<EstadoCurso, string> = {
  PLANIFICADO: "Planificado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

/** Límites de la tabla `proyecto` del backend. */
export const LIMITES = {
  titulo: 150,
  descripcion: 1000,
  areaTematica: 60,
  unidadVecinal: 100,
} as const;

export interface ValoresCurso {
  titulo: string;
  descripcion: string;
  areaTematica: string;
  unidadVecinal: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: EstadoCurso;
}

export type CampoCurso = keyof ValoresCurso;
export type ErroresCurso = Partial<Record<CampoCurso, string>>;

/** Orden visual de los campos: el resumen de errores y el foco lo siguen. */
export const ORDEN_CAMPOS: readonly CampoCurso[] = [
  "titulo",
  "descripcion",
  "areaTematica",
  "unidadVecinal",
  "estado",
  "fechaInicio",
  "fechaTermino",
];

export const ETIQUETAS_CAMPO: Record<CampoCurso, string> = {
  titulo: "Título",
  descripcion: "Descripción",
  areaTematica: "Área temática",
  unidadVecinal: "Unidad vecinal",
  estado: "Estado",
  fechaInicio: "Fecha de inicio",
  fechaTermino: "Fecha de término",
};

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_POR_DIA = 86_400_000;

/** `yyyy-MM-dd` → milisegundos UTC; null si no es una fecha válida. UTC evita corrimientos por zona horaria. */
function aUtc(fecha: string): number | null {
  const partes = FECHA_ISO.exec(fecha);
  if (!partes) return null;
  const [, anio, mes, dia] = partes;
  const tiempo = Date.UTC(Number(anio), Number(mes) - 1, Number(dia));
  const fechaReal = new Date(tiempo);
  // Descarta fechas imposibles como 2027-02-30
  return fechaReal.getUTCDate() === Number(dia) && fechaReal.getUTCMonth() === Number(mes) - 1 ? tiempo : null;
}

// Se crean una sola vez: construir Intl.DateTimeFormat en cada render es costoso
const FORMATO_CORTO = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const FORMATO_LARGO = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "15 mar 2027" (corto) o "15 de marzo de 2027" (largo). Devuelve el texto original si no es una fecha. */
export function formatearFecha(fecha: string, estilo: "corto" | "largo" = "corto"): string {
  const tiempo = aUtc(fecha);
  if (tiempo === null) return fecha;
  return (estilo === "largo" ? FORMATO_LARGO : FORMATO_CORTO).format(tiempo);
}

/** Días del periodo contando ambos extremos; null si falta una fecha o el término es anterior al inicio. */
export function duracionEnDias(inicio: string, termino: string): number | null {
  const desde = aUtc(inicio);
  const hasta = aUtc(termino);
  if (desde === null || hasta === null || hasta < desde) return null;
  return Math.round((hasta - desde) / MS_POR_DIA) + 1;
}

export function describirDuracion(dias: number): string {
  if (dias === 1) return "1 día";
  const semanas = Math.floor(dias / 7);
  return semanas >= 2 ? `${dias} días (≈ ${semanas} semanas)` : `${dias} días`;
}

/** Mensajes con causa y cómo corregirla. Las mismas reglas que valida el backend. */
export function validarCurso(valores: ValoresCurso): ErroresCurso {
  const errores: ErroresCurso = {};

  const titulo = valores.titulo.trim();
  if (!titulo) errores.titulo = "Escribe el título del curso.";
  else if (titulo.length > LIMITES.titulo) errores.titulo = `Acorta el título a ${LIMITES.titulo} caracteres o menos.`;

  if (valores.descripcion.trim().length > LIMITES.descripcion) {
    errores.descripcion = `Acorta la descripción a ${LIMITES.descripcion} caracteres o menos.`;
  }

  const area = valores.areaTematica.trim();
  if (!area) errores.areaTematica = "Indica el área temática, por ejemplo «Educación».";
  else if (area.length > LIMITES.areaTematica) {
    errores.areaTematica = `Acorta el área temática a ${LIMITES.areaTematica} caracteres o menos.`;
  }

  const unidad = valores.unidadVecinal.trim();
  if (!unidad) errores.unidadVecinal = "Indica la unidad vecinal donde se realiza el curso.";
  else if (unidad.length > LIMITES.unidadVecinal) {
    errores.unidadVecinal = `Acorta la unidad vecinal a ${LIMITES.unidadVecinal} caracteres o menos.`;
  }

  const inicioValido = aUtc(valores.fechaInicio) !== null;
  const terminoValido = aUtc(valores.fechaTermino) !== null;
  if (!inicioValido) errores.fechaInicio = "Elige una fecha de inicio válida.";
  if (!terminoValido) errores.fechaTermino = "Elige una fecha de término válida.";
  else if (inicioValido && valores.fechaTermino < valores.fechaInicio) {
    errores.fechaTermino =
      `La fecha de término no puede ser anterior al inicio (${formatearFecha(valores.fechaInicio, "largo")}).`;
  }

  return errores;
}

/** Mismo orden que devuelve el backend: por fecha de inicio y luego por id. */
export function ordenarCursos(cursos: Curso[]): Curso[] {
  return [...cursos].sort((a, b) =>
    a.fechaInicio === b.fechaInicio ? a.id - b.id : a.fechaInicio < b.fechaInicio ? -1 : 1,
  );
}

/** Valores únicos y ordenados (ignorando mayúsculas) para sugerir en los desplegables. */
export function valoresUnicos(textos: string[]): string[] {
  const porClave = new Map<string, string>();
  for (const texto of textos) {
    const limpio = texto.trim();
    if (limpio && !porClave.has(limpio.toLocaleLowerCase("es"))) porClave.set(limpio.toLocaleLowerCase("es"), limpio);
  }
  return [...porClave.values()].sort((a, b) => a.localeCompare(b, "es"));
}
