import type { ReactNode } from "react";
import Icon from "../atoms/Icon";

interface AlertaProps {
  tipo?: "error" | "exito";
  children: ReactNode;
}

// Estilos con utilidades de Tailwind; colores, radio y animación salen de los tokens de index.css
const TONOS: Record<NonNullable<AlertaProps["tipo"]>, string> = {
  error:
    "text-[var(--color-error)] bg-[var(--color-error-fondo)] border-[color:var(--color-error-borde)]",
  exito:
    "text-[var(--color-exito)] bg-[var(--color-exito-fondo)] border-[color:var(--color-exito-borde)]",
};

// Los errores se anuncian de inmediato (role="alert"); los avisos de éxito, sin interrumpir (role="status")
const Alerta = ({ tipo = "error", children }: AlertaProps) => (
  <div
    className={`flex items-start gap-2.5 mb-5 px-4 py-3.5 text-[0.875rem] leading-normal border rounded-[var(--radio-md)] animate-aparecer ${TONOS[tipo]}`}
    data-tipo={tipo}
    role={tipo === "error" ? "alert" : "status"}
  >
    <Icon nombre={tipo === "error" ? "alerta" : "checkCirculo"} tamano={18} className="mt-px" />
    <div className="grid gap-1.5 [&_a]:font-bold [&_a]:text-inherit">{children}</div>
  </div>
);

export default Alerta;
