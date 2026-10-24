import type { ReactNode } from "react";
import Icon, { type NombreIcono } from "../icon/Icon";
import PassCard from "../pass/PassCard";
import styles from "./AuthLayout.module.css";

const BENEFICIOS: Array<{ icono: NombreIcono; texto: string }> = [
  { icono: "ticket", texto: "Inscríbete a tus cursos en línea" },
  { icono: "qr", texto: "Recibe tu código QR personal" },
  { icono: "escanear", texto: "Acredita tu asistencia en el acto" },
];

interface AuthLayoutProps {
  /** id del título del formulario, para nombrar la sección. */
  idTitulo: string;
  panelTitulo: string;
  panelTexto: string;
  /** Formulario más ancho (campos de a dos), para formularios largos como el registro. */
  amplio?: boolean;
  children: ReactNode;
}

// Pantallas de cuenta: panel de marca a la izquierda (se oculta en móvil) y formulario a la derecha
const AuthLayout = ({ idTitulo, panelTitulo, panelTexto, amplio = false, children }: AuthLayoutProps) => (
  <main id="contenido" className={styles.pagina}>
    <div className={styles.tarjeta} data-amplio={amplio || undefined}>
      <aside className={styles.panel}>
        <div>
          <p className={styles.panelTitulo}>{panelTitulo}</p>
          <p className={styles.panelTexto}>{panelTexto}</p>
        </div>

        <PassCard className={styles.pase} />

        <ul className={styles.beneficios}>
          {BENEFICIOS.map((b) => (
            <li key={b.texto}>
              <span className={styles.beneficioIcono}>
                <Icon nombre={b.icono} tamano={18} />
              </span>
              {b.texto}
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.formulario} aria-labelledby={idTitulo}>
        <div className={styles.formularioInterior}>{children}</div>
      </section>
    </div>
  </main>
);

export default AuthLayout;
