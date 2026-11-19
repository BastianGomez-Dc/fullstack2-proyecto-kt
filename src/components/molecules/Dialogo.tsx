import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "../atoms/Icon";
import styles from "./Dialogo.module.css";

interface DialogoProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  /** Botones del pie; el de cierre del encabezado siempre está. */
  acciones?: ReactNode;
  tono?: "normal" | "peligro";
  /** Mientras hay una operación en curso no se puede cerrar (Esc, fondo ni botón). */
  bloqueado?: boolean;
}

// <dialog> nativo: atrapa el foco, cierra con Esc, devuelve el foco al disparador y bloquea el fondo.
const Dialogo = ({
  abierto,
  titulo,
  onCerrar,
  children,
  acciones,
  tono = "normal",
  bloqueado = false,
}: DialogoProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    else if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      data-tono={tono}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onCancel={(evento) => {
        if (bloqueado) evento.preventDefault();
      }}
      // Clic en el fondo oscuro (fuera de la tarjeta) cierra
      onClick={(evento) => {
        if (evento.target === evento.currentTarget && !bloqueado) onCerrar();
      }}
    >
      {abierto && (
        <div className={styles.tarjeta}>
          <header className={styles.encabezado}>
            <h2 id={idTitulo}>{titulo}</h2>
            <button
              type="button"
              className={styles.cerrar}
              onClick={onCerrar}
              disabled={bloqueado}
              aria-label="Cerrar"
            >
              <Icon nombre="x" tamano={20} />
            </button>
          </header>
          <div className={styles.cuerpo}>{children}</div>
          {acciones && <footer className={styles.pie}>{acciones}</footer>}
        </div>
      )}
    </dialog>
  );
};

export default Dialogo;
