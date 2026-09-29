import { Link } from "wouter";
import "../../App.css";
import "../components/footer/Footer.css";
const Home = () => {
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
                <li className="nav-item"><Link className="nav-link activo" href="/">Inicio</Link></li>
                <li className="nav-item"><a className="nav-link" href="#productos">Productos</a></li>
                <li className="nav-item"><Link className="nav-link" href="/login">Iniciar sesión</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/register">Crear cuenta</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="portada">
          <div className="container">
            <div className="col-lg-7">
              <p className="dato-entrega">Despacho en 48 horas a todo Chile</p>
              <h1>Tu diseño, estampado y en tus manos esta semana.</h1>
              <p className="bajada">Subes tu imagen, elegimos la tinta y estampamos sobre algodón peinado. Desde una polera hasta el pedido completo del curso.</p>
              <a className="btn btn-tinta" href="#productos">Ver el catálogo</a>
              <Link className="btn btn-contorno" href="/register">Crear cuenta</Link>
            </div>
          </div>
        </section>

        <section className="seccion" id="productos">
          <div className="container">
            <h2>Catálogo</h2>
            <p className="intro">Tres bases de algodón, todas personalizables por delante y por detrás.</p>

            <div className="row g-4">
              <div className="col-md-4">
                <article className="tarjeta-producto">
                  <img src="img/poleraHombre.png" alt="Polera negra de hombre cuello redondo" />
                  <div className="cuerpo">
                    <h3>Polera de Jujutsu Kaisen!!!</h3>
                    <p>Algodón peinado 180 g. La base que mejor levanta los colores fuertes.</p>
                    <span className="precio">$16.990</span>
                    <Link className="btn btn-contorno" href="/register">Comprar</Link>
                  </div>
                </article>
              </div>

              <div className="col-md-4">
                <article className="tarjeta-producto">
                  <img src="img/poleraAcidNew.png" alt="Polera acid wash desgastada" />
                  <div className="cuerpo">
                    <h3>Negra premium</h3>
                    <p>Tela más densa y tinta plastisol, pensada para diseños de una sola figura.</p>
                    <span className="precio">$14.990</span>
                    <Link className="btn btn-contorno" href="/register">Comprar</Link>
                  </div>
                </article>
              </div>

              <div className="col-md-4">
                <article className="tarjeta-producto">
                  <img src="img/poleraOversize.png" alt="Polera oversize con estampado" />
                  <div className="cuerpo">
                    <h3>Pack curso</h3>
                    <p>Desde 10 unidades con el mismo diseño y nombre impreso en la espalda.</p>
                    <span className="precio">$9.990</span>
                    <Link className="btn btn-contorno" href="/register">Comprar</Link>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
