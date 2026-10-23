import type { ReactNode } from "react";
import { Link } from "wouter";
import "../../App.css";
import styles from "./Home.module.css";
import Footer from "../../components/footer/footer";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Cursos = [
  {
    nombre: "Curso 1",
    descripcion: "Descripcion curso 1.",
    precio: "$16.990",
    imagen: "",
    alt: "Imagen de referencia a un curso",
    etiqueta: "Cursos",
  },
  {
    nombre: "Curso 2",
    descripcion: "Descripcion curso 2.",
    precio: "$14.990",
    imagen: "",
    alt: "Imagen de referencia a un pack de cursos",
    etiqueta: "Cursos",
  },
  {
    nombre: "Pack curso",
    descripcion: "Descripcion oferta cursos.",
    precio: "$9.990",
    imagen: "",
    alt: "Imagen de referencia a un pack de cursos",
    etiqueta: "Cursos",
    unidad: "c/u",
  },
];

const BENEFICIOS = [
  {
    titulo: "Inscripción online",
    texto: "Registra a los participantes directamente desde el catálogo de cursos.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 3V1h8v2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M6 12h.01M10 12h.01M14 12h.01" />
      </svg>
    ),
  },
  {
    titulo: "Código QR",
    texto: "Cada asistente recibe su propio código para acreditar la entrada.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <path d="M21 3h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7" />
        <path d="M21 21h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7" />
        <path d="M3 14v7a2 2 0 0 0 2 2h7" />
      </svg>
    ),
  },
  {
    titulo: "Escaneo instantáneo",
    texto: "Registra la asistencia en el momento con el lector de QR.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    titulo: "Sincronización sin conexión",
    texto: "Guarda los eventos y sincroniza con el registro cuando hay red.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
        <path d="M17 2v5h5" />
        <path d="M7 22v-5H2v-5" />
        <path d="M7 13v4a2 2 0 0 0 2 2h4" />
      </svg>
    ),
  },
];

const PASOS = [
  { titulo: "Registra tu curso", texto: "Deja constancia del programa y prepara la lista de participantes." },
  { titulo: "Genera el código QR", texto: "Cada inscrito recibe su código para acreditar la asistencia." },
  { titulo: "Escanea y acredita", texto: "Registra la entrada en el acto y sincroniza los datos." },
];

const Icono = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const Flecha = () => (
  <svg className={styles.flecha} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Home = () => {
  useDocumentTitle("SyncPass");
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
          <div className="container">
            <Link className="marca" href="/">SyncPass</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Abrir menú">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="menu">
              <ul className="navbar-nav">
                <li className="nav-item"><Link className="nav-link activo" href="/" aria-current="page">Inicio</Link></li>
                <li className="nav-item"><a className="nav-link" href="#cursos">Cursos</a></li>
                <li className="nav-item"><Link className="nav-link" href="/login">Iniciar sesión</Link></li>
                <li className="nav-item"><Link className="nav-link " href="/register">Crear cuenta</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main className={styles.pagina}>
        {/* ---------- Portada ---------- */}
        <section className={styles.portada}>
          <div className={`container ${styles.portadaGrid}`}>
            <div className={styles.portadaTexto}>
              <span className={styles.etiqueta}>
                <Icono size={16}>{BENEFICIOS[0].icono}</Icono>
                Inscripción y acreditación con QR
              </span>
              <h1 className={styles.titulo}>De tu curso a la acreditación <span>en minutos.</span></h1>
              <p className={styles.bajada}>
                Registra la participación de tu curso, genera el código QR de cada asistente y acredita la entrada en el acto. Sin papeleo, sin filas, sin complicaciones.
              </p>
              <div className={styles.acciones}>
                <a className={styles.botonPrimario} href="#cursos">
                  Ver los cursos
                  <Flecha />
                </a>
                <Link className={styles.botonSecundario} href="/register">Crear cuenta</Link>
              </div>
              <ul className={styles.confianza}>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Inscripción online
                </li>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Código QR
                </li>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Escaneo en el acto
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Beneficios ---------- */}
        <section className={styles.beneficios} aria-label="Por qué SyncPass">
          <ul className={`container ${styles.beneficiosGrid}`}>
            {BENEFICIOS.map((b) => (
              <li key={b.titulo} className={styles.beneficio}>
                <span className={styles.beneficioIcono}><Icono>{b.icono}</Icono></span>
                <div>
                  <p className={styles.beneficioTitulo}>{b.titulo}</p>
                  <p className={styles.beneficioTexto}>{b.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Catálogo ---------- */}
        <section className={styles.seccion} id="cursos" aria-labelledby="tituloCatalogo">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Nuestros cursos</p>
              <h2 id="tituloCatalogo" className={styles.seccionTitulo}>Elige tu práctica</h2>
              <p className={styles.seccionTexto}>Cada práctica se prepara sobre una base personalizada y se acredita con código QR.</p>
            </div>

            <ul className={styles.productos}>
              {Cursos.map((p) => (
                <li key={p.nombre}>
                  <article className={styles.producto}>
                    <div className={styles.productoImagen}>
                      <img src={p.imagen} alt={p.alt} width="993" height="994" loading="lazy" decoding="async" />
                    </div>
                    <div className={styles.productoCuerpo}>
                      <span className={styles.productoEtiqueta}>{p.etiqueta}</span>
                      <h3 className={styles.productoNombre}>{p.nombre}</h3>
                      <p className={styles.productoTexto}>{p.descripcion}</p>
                      <div className={styles.productoPie}>
                        <p className={styles.precio}>
                          {p.precio}
                          {p.unidad && <span> {p.unidad}</span>}
                        </p>
                        <Link className={styles.botonComprar} href="/register">
                          Inscribirme<span className={styles.srOnly}> {p.nombre}</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Cómo funciona ---------- */}
        <section className={`${styles.seccion} ${styles.seccionSuave}`} aria-labelledby="tituloPasos">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Cómo funciona</p>
              <h2 id="tituloPasos" className={styles.seccionTitulo}>De la inscripción al QR en tres pasos</h2>
            </div>

            <ol className={styles.pasos}>
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className={styles.paso}>
                  <span className={styles.pasoNumero} aria-hidden="true">{i + 1}</span>
                  <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
                  <p className={styles.pasoTexto}>{paso.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Llamado final ---------- */}
        <section className={styles.seccion} aria-labelledby="tituloCurso">
          <div className="container">
            <div className={styles.banda}>
              <div>
                <h2 id="tituloCurso" className={styles.bandaTitulo}>¿Tu curso necesita acreditación QR?</h2>
                <p className={styles.bandaTexto}>Registra participantes, genera sus códigos y acredita la asistencia en el acto.</p>
              </div>
              <Link className={styles.botonBlanco} href="/register">
                Regístrate gratis
                <Flecha />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
