import type { NombreIcono } from "../components/icon/Icon";

// Catálogo de ejemplo (los mismos datos que tenía la portada). Reemplazar por el catálogo real o por la API.
export interface Curso {
  nombre: string;
  descripcion: string;
  precio: string;
  unidad?: string;
  etiqueta: string;
  /** Portada ilustrada mientras no haya imágenes reales. */
  icono: NombreIcono;
  tono: "verde" | "ambar" | "menta";
}

export const CURSOS: Curso[] = [
  {
    nombre: "Curso 1",
    descripcion: "Descripcion curso 1.",
    precio: "$16.990",
    etiqueta: "Cursos",
    icono: "libro",
    tono: "verde",
  },
  {
    nombre: "Curso 2",
    descripcion: "Descripcion curso 2.",
    precio: "$14.990",
    etiqueta: "Cursos",
    icono: "calendario",
    tono: "ambar",
  },
  {
    nombre: "Pack curso",
    descripcion: "Descripcion oferta cursos.",
    precio: "$9.990",
    unidad: "c/u",
    etiqueta: "Cursos",
    icono: "capas",
    tono: "menta",
  },
];
