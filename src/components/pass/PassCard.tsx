import Icon from "../icon/Icon";
import Logo from "../logo/Logo";
import styles from "./PassCard.module.css";

// Ilustración del pase digital. Es decorativa (aria-hidden): el QR no codifica datos reales.
const LADO = 21;

const enMarcador = (x: number, y: number) =>
  (x < 8 && y < 8) || (x >= LADO - 8 && y < 8) || (x < 8 && y >= LADO - 8);

const celdaDeMarcador = (x: number, y: number) => {
  const cx = x >= LADO - 8 ? x - (LADO - 7) : x;
  const cy = y >= LADO - 8 ? y - (LADO - 7) : y;
  if (cx < 0 || cy < 0 || cx > 6 || cy > 6) return false;
  const borde = cx === 0 || cy === 0 || cx === 6 || cy === 6;
  const centro = cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4;
  return borde || centro;
};

// Patrón pseudoaleatorio fijo (misma imagen en cada render)
const CELDAS: Array<[number, number]> = (() => {
  const celdas: Array<[number, number]> = [];
  let semilla = 20261024;
  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO; x++) {
      semilla = (semilla * 1103515245 + 12345) & 0x7fffffff;
      const encendida = enMarcador(x, y) ? celdaDeMarcador(x, y) : ((semilla >> 16) & 3) !== 0 && ((semilla >> 18) & 1) === 1;
      if (encendida) celdas.push([x, y]);
    }
  }
  return celdas;
})();

interface PassCardProps {
  className?: string;
}

const PassCard = ({ className }: PassCardProps) => (
  <div className={[styles.pase, className].filter(Boolean).join(" ")} aria-hidden="true">
    <div className={styles.cabecera}>
      <Logo claro tamano={26} />
      <span className={styles.chip}>Pase digital</span>
    </div>

    <div className={styles.cuerpo}>
      <dl className={styles.datos}>
        <div>
          <dt>Participante</dt>
          <dd>Tu nombre</dd>
        </div>
        <div>
          <dt>Curso</dt>
          <dd>Tu curso inscrito</dd>
        </div>
      </dl>
      <div className={styles.qr}>
        <svg viewBox={`0 0 ${LADO} ${LADO}`} shapeRendering="crispEdges">
          {CELDAS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
          ))}
        </svg>
        <span className={styles.lineaEscaneo} />
      </div>
    </div>

    <div className={styles.corte} />

    <div className={styles.pie}>
      <span className={styles.estado}>
        <Icon nombre="checkCirculo" tamano={16} />
        Asistencia acreditada
      </span>
      <span className={styles.pieTexto}>Escaneado en el acceso</span>
    </div>
  </div>
);

export default PassCard;
