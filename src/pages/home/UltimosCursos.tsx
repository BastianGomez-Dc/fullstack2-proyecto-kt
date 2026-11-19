import { useEffect, useState } from "react";
import { Link } from "wouter";
import { listarCursosRecientes, type Curso } from "../../api/cursos";
import { ETIQUETAS_ESTADO, describirDuracion, duracionEnDias, formatearFecha } from "../../components/organisms/curso";
import Icon, { type NombreIcono } from "../../components/atoms/Icon";
import styles from "./Home.module.css";

const CANTIDAD = 3;

// Portadas ilustradas que se alternan mientras los cursos no tengan imagen propia
const PORTADAS: Array<{ icono: NombreIcono; tono: "verde" | "ambar" | "menta" }> = [
  { icono: "libro", tono: "verde" },
  { icono: "calendario", tono: "ambar" },
  { icono: "capas", tono: "menta" },
];

type Carga = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; cursos: Curso[] };

interface UltimosCursosProps {
  autenticado: boolean;
}

/** Los últimos cursos creados, desde el endpoint público del backend. */
const UltimosCursos = ({ autenticado }: UltimosCursosProps) => {
  const [carga, setCarga] = useState<Carga>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si el usuario sale de la portada antes de que responda, la petición se cancela
    const controlador = new AbortController();
    listarCursosRecientes(CANTIDAD, controlador.signal)
      .then((cursos) => setCarga({ tipo: "listo", cursos }))
      .catch(() => {
        if (!controlador.signal.aborted) setCarga({ tipo: "error" });
      });
    return () => controlador.abort();
  }, [intento]);

  const reintentar = () => {
    setCarga({ tipo: "cargando" });
    setIntento((actual) => actual + 1);
  };

  if (carga.tipo === "cargando") {
    // Tarjetas de relleno con el mismo tamaño: la página no salta cuando llegan los datos
    return (
      <>
        <p className="sr-only" role="status">Cargando los últimos cursos…</p>
        <ul className={styles.cursos} aria-hidden="true">
          {PORTADAS.map((portada) => (
            <li key={portada.tono}>
              <div className={`${styles.curso} ${styles.cursoEsqueleto}`}>
                <div className={styles.cursoPortada} />
                <div className={styles.cursoCuerpo}>
                  <span className={styles.esqueleto} data-ancho="corto" />
                  <span className={styles.esqueleto} data-ancho="titulo" />
                  <span className={styles.esqueleto} />
                  <span className={styles.esqueleto} data-ancho="medio" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (carga.tipo === "error") {
    return (
      <div className={styles.catalogoMensaje} role="alert">
        <Icon nombre="sinConexion" tamano={28} />
        <p>No pudimos cargar los cursos en este momento.</p>
        <button type="button" className={styles.botonSecundario} onClick={reintentar}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (carga.cursos.length === 0) {
    return (
      <div className={styles.catalogoMensaje}>
        <Icon nombre="libro" tamano={28} />
        <p>Aún no hay cursos publicados. ¡Vuelve pronto!</p>
      </div>
    );
  }

  return (
    <>
      <ul className={styles.cursos}>
        {carga.cursos.map((curso, indice) => {
          const portada = PORTADAS[indice % PORTADAS.length];
          const dias = duracionEnDias(curso.fechaInicio, curso.fechaTermino);
          return (
            <li key={curso.id}>
              <article className={styles.curso}>
                <div className={styles.cursoPortada} data-tono={portada.tono} aria-hidden="true">
                  <Icon nombre={portada.icono} tamano={40} grosor={1.6} />
                </div>
                <div className={styles.cursoCuerpo}>
                  <div className={styles.cursoEtiquetas}>
                    <span className={styles.cursoEtiqueta}>{curso.areaTematica}</span>
                    <span className={styles.cursoEstado} data-estado={curso.estado}>
                      {ETIQUETAS_ESTADO[curso.estado]}
                    </span>
                  </div>
                  <h3 className={styles.cursoNombre}>{curso.titulo}</h3>
                  <p className={styles.cursoTexto}>{curso.descripcion}</p>
                  <ul className={styles.cursoDatos}>
                    <li>
                      <Icon nombre="calendario" tamano={16} />
                      <span>
                        {formatearFecha(curso.fechaInicio)} – {formatearFecha(curso.fechaTermino)}
                        {dias !== null && <span className={styles.cursoDuracion}>{describirDuracion(dias)}</span>}
                      </span>
                    </li>
                    <li>
                      <Icon nombre="ubicacion" tamano={16} />
                      <span>{curso.unidadVecinal}</span>
                    </li>
                  </ul>
                  <div className={styles.cursoPie}>
                    {autenticado ? (
                      <Link className={styles.botonInscribir} href="/cursos">
                        Ver detalles<span className="sr-only"> de {curso.titulo}</span>
                      </Link>
                    ) : (
                      <Link className={styles.botonInscribir} href="/register">
                        Inscribirme<span className="sr-only"> en {curso.titulo}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className={styles.verTodos}>
        <Link className={styles.enlaceVerTodos} href="/cursos">
          Ver todos los cursos
          <Icon nombre="flechaDerecha" tamano={18} className={styles.flecha} />
        </Link>
      </div>
    </>
  );
};

export default UltimosCursos;
