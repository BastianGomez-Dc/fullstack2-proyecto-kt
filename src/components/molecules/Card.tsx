import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Ejemplo de la guía 03, con utilidades de Tailwind (sin CSS Module). Valores idénticos a los del CSS anterior.
const FUENTE = "font-['Roboto',sans-serif]";
const SOMBRA = "shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]";
const SOMBRA_HOVER = "hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]";

const Card = ({ title, subtitle, footer, children }: CardProps) => {
  const conEncabezado = Boolean(title || subtitle);
  return (
    <div
      className={`flex flex-col overflow-hidden w-[300px] mt-4 mx-auto bg-white border border-[#e5e7eb] rounded-[0.75rem] transition-[transform,box-shadow] duration-200 ease-[ease] ${SOMBRA} ${SOMBRA_HOVER}`}
    >
      {conEncabezado && (
        <div className="flex flex-col gap-1 pt-5 px-5 pb-3">
          {title && <h3 className={`m-0 ${FUENTE} text-[1.125rem] font-semibold text-[#1f2937]`}>{title}</h3>}
          {subtitle && <p className={`m-0 ${FUENTE} text-[0.875rem] text-[#6b7280]`}>{subtitle}</p>}
        </div>
      )}
      {/* Si el cuerpo va justo debajo del encabezado, se acerca a él */}
      <div className={`flex-1 p-5 ${conEncabezado ? "pt-1" : ""} ${FUENTE} text-[0.95rem] text-[#374151]`}>
        {children}
      </div>
      {footer && (
        <div className="flex flex-col justify-end items-stretch gap-3 pt-3 px-5 pb-5 bg-[#f9fafb] border-t border-[#f3f4f6]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
