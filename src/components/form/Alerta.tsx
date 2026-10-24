import type { ReactNode } from "react";
import Icon from "../icon/Icon";
import styles from "./Form.module.css";

interface AlertaProps {
  tipo?: "error" | "exito";
  children: ReactNode;
}

// Los errores se anuncian de inmediato (role="alert"); los avisos de éxito, sin interrumpir (role="status")
const Alerta = ({ tipo = "error", children }: AlertaProps) => (
  <div className={styles.alerta} data-tipo={tipo} role={tipo === "error" ? "alert" : "status"}>
    <Icon nombre={tipo === "error" ? "alerta" : "checkCirculo"} tamano={18} />
    <div className={styles.alertaCuerpo}>{children}</div>
  </div>
);

export default Alerta;
