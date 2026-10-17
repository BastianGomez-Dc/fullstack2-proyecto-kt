import type { ReactNode } from "react";
import { Link } from "wouter";
import "../../App.css";
import styles from "./Home.module.css";
import Footer from "../../components/footer/footer";
import useDocumentTitle from "../hooks/useDocumentTitle";

const PRODUCTOS = [
  {
    nombre: "Polera de Jujutsu Kaisen!!!",
    descripcion: "Algodón peinado 180 g. La base que mejor levanta los colores fuertes.",
    precio: "$16.990",
    imagen: "img/poleraHombre.png",
    alt: "Polera negra de hombre cuello redondo",
    etiqueta: "Cuello redondo",
  },
  {
    nombre: "Negra premium",
    descripcion: "Tela más densa y tinta plastisol, pensada para diseños de una sola figura.",
    precio: "$14.990",
    imagen: "img/poleraAcidNew.png",
    alt: "Polera acid wash desgastada",
    etiqueta: "Acid wash",
  },
  {
    nombre: "Pack curso",
    descripcion: "Desde 10 unidades con el mismo diseño y nombre impreso en la espalda.",
    precio: "$9.990",
    imagen: "img/poleraOversize.png",
    alt: "Polera oversize con estampado",
    etiqueta: "Oversize",
    unidad: "c/u",
  },
];

const BENEFICIOS = [
  {
    titulo: "Despacho en 48 horas",
    texto: "A todo Chile, directo a tu puerta.",
    icono: (
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </>
    ),
  },
  {
    titulo: "Delante y detrás",
    texto: "Personaliza ambos lados de la polera.",
    icono: (
      <>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z" />
      </>
    ),
  },
  {
    titulo: "Algodón peinado",
    texto: "Telas suaves que mantienen el color.",
    icono: (
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    ),
  },
  {
    titulo: "Pedidos de curso",
    texto: "Desde una polera hasta el curso completo.",
    icono: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

const PASOS = [
  { titulo: "Sube tu diseño", texto: "Una imagen, un logo o el nombre de tu curso. Nosotros lo preparamos para estampar." },
  { titulo: "Elige la base", texto: "Cuello redondo, acid wash u oversize. Revisas cómo queda antes de confirmar." },
  { titulo: "Recíbela en 48 horas", texto: "Elegimos la tinta, estampamos y despachamos a cualquier parte de Chile." },
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
  useDocumentTitle("Poleras Express");
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg navbar-tienda">
          <div className="container">
            <Link className="marca" href="/">Poleras <span>Express</span></Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Abrir menú">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="menu">
              <ul className="navbar-nav">
                <li className="nav-item"><Link className="nav-link activo" href="/" aria-current="page">Inicio</Link></li>
                <li className="nav-item"><a className="nav-link" href="#productos">Productos</a></li>
                <li className="nav-item"><Link className="nav-link" href="/login">Iniciar sesión</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/register">Crear cuenta</Link></li>
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
                Despacho en 48 horas a todo Chile
              </span>
              <h1 className={styles.titulo}>Tu diseño, estampado y en tus manos <span>esta semana.</span></h1>
              <p className={styles.bajada}>
                Subes tu imagen, elegimos la tinta y estampamos sobre algodón peinado. Desde una polera hasta el pedido completo del curso.
              </p>
              <div className={styles.acciones}>
                <a className={styles.botonPrimario} href="#productos">
                  Ver el catálogo
                  <Flecha />
                </a>
                <Link className={styles.botonSecundario} href="/register">Crear cuenta</Link>
              </div>
              <ul className={styles.confianza}>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Desde 1 unidad
                </li>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Delante y detrás
                </li>
                <li>
                  <Icono size={18}><path d="M20 6 9 17l-5-5" /></Icono>
                  Precios desde $9.990
                </li>
              </ul>
            </div>

            <div className={styles.portadaVisual} aria-hidden="true">
              <img className={styles.visualAtras1} src="img/poleraAcidNew.png" alt="" width="993" height="994" />
              <img className={styles.visualAtras2} src="img/poleraHombre.png" alt="" width="993" height="994" />
              <img className={styles.visualPrincipal} src="img/poleraOversize.png" alt="" width="993" height="994" fetchPriority="high" />
            </div>
          </div>
        </section>

        {/* ---------- Beneficios ---------- */}
        <section className={styles.beneficios} aria-label="Por qué Poleras Express">
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
        <section className={styles.seccion} id="productos" aria-labelledby="tituloCatalogo">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Catálogo</p>
              <h2 id="tituloCatalogo" className={styles.seccionTitulo}>Elige tu base</h2>
              <p className={styles.seccionTexto}>Tres bases de algodón, todas personalizables por delante y por detrás.</p>
            </div>

            <ul className={styles.productos}>
              {PRODUCTOS.map((p) => (
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
                          Comprar<span className={styles.srOnly}> {p.nombre}</span>
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
              <h2 id="tituloPasos" className={styles.seccionTitulo}>De tu idea a tu polera en tres pasos</h2>
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
                <h2 id="tituloCurso" className={styles.bandaTitulo}>¿Pedido para tu curso o tu equipo?</h2>
                <p className={styles.bandaTexto}>Desde 10 unidades con el mismo diseño y el nombre de cada persona en la espalda, a $9.990 cada una.</p>
              </div>
              <Link className={styles.botonBlanco} href="/register">
                Crear cuenta gratis
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
