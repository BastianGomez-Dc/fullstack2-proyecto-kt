import { Link } from "wouter";
import { useAuth } from "../../auth/AuthContext";
import Footer from "../../components/footer/Footer";
import Icon, { type NombreIcono } from "../../components/icon/Icon";
import PassCard from "../../components/pass/PassCard";
import { CURSOS } from "../../data/cursos";
import useDocumentTitle from "../hooks/useDocumentTitle";
import styles from "./Home.module.css";

const PUBLICOS: Array<{ titulo: string; texto: string; icono: NombreIcono; puntos: string[] }> = [
  {
    titulo: "Para participantes",
    texto: "Todo lo que necesitas para llegar a tu curso, en tu teléfono.",
    icono: "usuario",
    puntos: [
      "Inscríbete en línea desde el catálogo de cursos",
      "Recibe tu propio código QR para acreditar la entrada",
      "Muestra el código al llegar y entra sin filas ni papeles",
    ],
  },
  {
    titulo: "Para organizadores",
    texto: "Controla la asistencia de cada curso sin planillas.",
    icono: "usuarios",
    puntos: [
      "Registra el curso y prepara la lista de participantes",
      "Escanea los códigos y acredita la asistencia en el acto",
      "Guarda los registros sin conexión y sincroniza cuando hay red",
    ],
  },
];

const PASOS: Array<{ titulo: string; texto: string; icono: NombreIcono }> = [
  { titulo: "Registra tu curso", texto: "Deja constancia del programa y prepara la lista de participantes.", icono: "lista" },
  { titulo: "Genera el código QR", texto: "Cada inscrito recibe su código para acreditar la asistencia.", icono: "qr" },
  { titulo: "Escanea y acredita", texto: "Registra la entrada en el acto y sincroniza los datos.", icono: "escanear" },
];

const PREGUNTAS = [
  {
    pregunta: "¿Cómo creo mi cuenta?",
    respuesta:
      "Entra a «Crear cuenta» y escribe tu nombre, tu correo y una contraseña. Te enviaremos un código de 6 dígitos al correo para confirmar que es tuyo.",
  },
  {
    pregunta: "No me llegó el código de verificación, ¿qué hago?",
    respuesta:
      "Revisa la carpeta de spam o correo no deseado. En la pantalla de verificación puedes pedir un código nuevo con «Enviar otro código».",
  },
  {
    pregunta: "¿Cómo se acredita mi asistencia?",
    respuesta:
      "Cada inscrito tiene su código QR. Al llegar al curso, el equipo lo escanea y la asistencia queda registrada en el momento.",
  },
];

const Home = () => {
  useDocumentTitle("SyncPass");
  const { isAuthenticated } = useAuth();

  return (
    <>
      <main id="contenido" className={styles.pagina}>
        {/* ---------- Portada ---------- */}
        <section className={styles.portada} aria-labelledby="tituloPortada">
          <div className={`container ${styles.portadaGrilla}`}>
            <div className={styles.portadaTexto}>
              <span className={styles.etiqueta}>
                <Icon nombre="qr" tamano={16} />
                Inscripción y acreditación con QR
              </span>
              <h1 id="tituloPortada" className={styles.titulo}>
                De tu curso a la acreditación <span>en minutos.</span>
              </h1>
              <p className={styles.bajada}>
                Registra la participación de tu curso, genera el código QR de cada asistente y acredita la entrada en el acto.
                Sin papeleo, sin filas, sin complicaciones.
              </p>
              <div className={styles.acciones}>
                <a className={styles.botonPrimario} href="#cursos">
                  Ver los cursos
                  <Icon nombre="flechaDerecha" tamano={18} className={styles.flecha} />
                </a>
                {!isAuthenticated && (
                  <Link className={styles.botonSecundario} href="/register">Crear cuenta gratis</Link>
                )}
              </div>
              <ul className={styles.confianza}>
                {["Inscripción online", "Código QR personal", "Funciona sin conexión"].map((texto) => (
                  <li key={texto}>
                    <Icon nombre="checkCirculo" tamano={18} />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.portadaVisual}>
              <PassCard className={styles.pase} />
              <span className={`${styles.flotante} ${styles.flotanteArriba}`} aria-hidden="true">
                <span className={styles.flotanteIcono}><Icon nombre="check" tamano={16} grosor={3} /></span>
                Inscripción confirmada
              </span>
              <span className={`${styles.flotante} ${styles.flotanteAbajo}`} aria-hidden="true">
                <span className={styles.flotanteIcono} data-tono="ambar"><Icon nombre="escanear" tamano={16} /></span>
                Listo para escanear
              </span>
            </div>
          </div>
        </section>

        {/* ---------- Para quién ---------- */}
        <section className={styles.seccion} aria-labelledby="tituloPublicos">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Una plataforma, dos lados</p>
              <h2 id="tituloPublicos" className={styles.seccionTitulo}>Pensado para quien asiste y para quien organiza</h2>
            </div>
            <div className={styles.publicos}>
              {PUBLICOS.map((p) => (
                <article key={p.titulo} className={styles.publico}>
                  <span className={styles.publicoIcono}><Icon nombre={p.icono} tamano={22} /></span>
                  <h3 className={styles.publicoTitulo}>{p.titulo}</h3>
                  <p className={styles.publicoTexto}>{p.texto}</p>
                  <ul className={styles.puntos}>
                    {p.puntos.map((punto) => (
                      <li key={punto}>
                        <Icon nombre="check" tamano={16} grosor={2.5} />
                        {punto}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Catálogo ---------- */}
        <section className={`${styles.seccion} ${styles.seccionSuave}`} id="cursos" aria-labelledby="tituloCatalogo">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Nuestros cursos</p>
              <h2 id="tituloCatalogo" className={styles.seccionTitulo}>Elige tu próximo curso</h2>
              <p className={styles.seccionTexto}>Cada curso se acredita con código QR al momento de llegar.</p>
            </div>

            <ul className={styles.cursos}>
              {CURSOS.map((curso) => (
                <li key={curso.nombre}>
                  <article className={styles.curso}>
                    <div className={styles.cursoPortada} data-tono={curso.tono} aria-hidden="true">
                      <Icon nombre={curso.icono} tamano={40} grosor={1.6} />
                    </div>
                    <div className={styles.cursoCuerpo}>
                      <span className={styles.cursoEtiqueta}>{curso.etiqueta}</span>
                      <h3 className={styles.cursoNombre}>{curso.nombre}</h3>
                      <p className={styles.cursoTexto}>{curso.descripcion}</p>
                      <div className={styles.cursoPie}>
                        <p className={styles.precio}>
                          {curso.precio}
                          {curso.unidad && <span> {curso.unidad}</span>}
                        </p>
                        <Link className={styles.botonInscribir} href="/register">
                          Inscribirme<span className="sr-only"> en {curso.nombre}</span>
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
        <section className={styles.seccion} id="como-funciona" aria-labelledby="tituloPasos">
          <div className="container">
            <div className={styles.encabezado}>
              <p className={styles.antetitulo}>Cómo funciona</p>
              <h2 id="tituloPasos" className={styles.seccionTitulo}>De la inscripción al QR en tres pasos</h2>
            </div>

            <ol className={styles.pasos}>
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className={styles.paso}>
                  <div className={styles.pasoCabecera}>
                    <span className={styles.pasoIcono}><Icon nombre={paso.icono} tamano={22} /></span>
                    <span className={styles.pasoNumero}>Paso {i + 1}</span>
                  </div>
                  <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
                  <p className={styles.pasoTexto}>{paso.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Preguntas frecuentes ---------- */}
        <section className={`${styles.seccion} ${styles.seccionSuave}`} id="preguntas" aria-labelledby="tituloPreguntas">
          <div className={`container ${styles.preguntasGrilla}`}>
            <div className={styles.encabezadoIzquierda}>
              <p className={styles.antetitulo}>Preguntas frecuentes</p>
              <h2 id="tituloPreguntas" className={styles.seccionTitulo}>¿Tienes dudas?</h2>
              <p className={styles.seccionTexto}>Lo esencial para crear tu cuenta y acreditar tu asistencia.</p>
            </div>
            <div className={styles.preguntas}>
              {PREGUNTAS.map((p) => (
                <details key={p.pregunta} className={styles.pregunta}>
                  <summary>
                    {p.pregunta}
                    <Icon nombre="chevronAbajo" tamano={20} className={styles.preguntaIcono} />
                  </summary>
                  <p>{p.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Llamado final ---------- */}
        <section className={styles.seccion} aria-labelledby="tituloLlamado">
          <div className="container">
            <div className={styles.banda}>
              <div>
                <h2 id="tituloLlamado" className={styles.bandaTitulo}>¿Tu curso necesita acreditación QR?</h2>
                <p className={styles.bandaTexto}>Registra participantes, genera sus códigos y acredita la asistencia en el acto.</p>
              </div>
              {isAuthenticated ? (
                <a className={styles.botonAcento} href="#cursos">
                  Ver los cursos
                  <Icon nombre="flechaDerecha" tamano={18} className={styles.flecha} />
                </a>
              ) : (
                <Link className={styles.botonAcento} href="/register">
                  Regístrate gratis
                  <Icon nombre="flechaDerecha" tamano={18} className={styles.flecha} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
