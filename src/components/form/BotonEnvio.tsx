import Icon from "../icon/Icon";
import styles from "./Form.module.css";

interface BotonEnvioProps {
  texto: string;
  textoCargando: string;
  cargando: boolean;
}

// Botón principal del formulario: se deshabilita y muestra progreso mientras espera al servidor
const BotonEnvio = ({ texto, textoCargando, cargando }: BotonEnvioProps) => (
  <button type="submit" className={styles.botonPrimario} disabled={cargando} aria-busy={cargando}>
    {cargando ? (
      <>
        <span className={styles.spinner} aria-hidden="true" />
        {textoCargando}
      </>
    ) : (
      <>
        {texto}
        <Icon nombre="flechaDerecha" tamano={18} className={styles.flecha} />
      </>
    )}
  </button>
);

export default BotonEnvio;
