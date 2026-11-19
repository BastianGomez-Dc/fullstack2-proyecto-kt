interface LogoProps {
  /** Versión para fondos oscuros (texto blanco). */
  claro?: boolean;
  tamano?: number;
}

// Isotipo: tres marcadores de QR y un check de acreditación.
// Estilos con utilidades de Tailwind; el color de marca sale de los tokens de index.css.
const Logo = ({ claro = false, tamano = 32 }: LogoProps) => (
  <span
    className={`inline-flex items-center gap-2.5 text-[1.1875rem] font-extrabold tracking-[-0.02em] ${
      claro ? "text-white" : "text-[var(--color-primario-fuerte)]"
    }`}
  >
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect
        width="32"
        height="32"
        rx="9"
        className={claro ? "fill-[rgba(255,255,255,0.14)]" : "fill-[var(--color-primario)]"}
      />
      <g fill="none" stroke="#fff" strokeWidth="1.8">
        <rect x="6.9" y="6.9" width="7.2" height="7.2" rx="1.6" />
        <rect x="17.9" y="6.9" width="7.2" height="7.2" rx="1.6" />
        <rect x="6.9" y="17.9" width="7.2" height="7.2" rx="1.6" />
      </g>
      <g fill="#fff">
        <rect x="9.25" y="9.25" width="2.5" height="2.5" rx=".5" />
        <rect x="20.25" y="9.25" width="2.5" height="2.5" rx=".5" />
        <rect x="9.25" y="20.25" width="2.5" height="2.5" rx=".5" />
      </g>
      <path d="m18.6 21.6 2.3 2.3 4.4-4.8" fill="none" stroke="#f2c500" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="leading-none">SyncPass</span>
  </span>
);

export default Logo;
