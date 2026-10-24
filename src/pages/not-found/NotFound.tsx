import { Link } from "wouter";
import Icon from "../../components/icon/Icon";
import useDocumentTitle from "../hooks/useDocumentTitle";
import styles from "./NotFound.module.css";

const NotFound = () => {
  useDocumentTitle("Página no encontrada");
  return (
    <main id="contenido" className={styles.pagina}>
      <div className={styles.contenido}>
        <span className={styles.icono}><Icon nombre="ticket" tamano={32} /></span>
        <p className={styles.codigo}>Error 404</p>
        <h1 className={styles.titulo}>No encontramos esta página</h1>
        <p className={styles.texto}>Puede que el enlace esté incompleto o que la página ya no exista.</p>
        <Link className={styles.boton} href="/">
          <Icon nombre="flechaIzquierda" tamano={18} />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
