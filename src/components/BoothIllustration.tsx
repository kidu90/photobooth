import styles from "./BoothIllustration.module.css";

/**
 * Minimal line drawing of a photobooth for the landing-page hero: a sign on
 * top, the red curtain, a checkered floor, and a side panel with the Pose mark
 * and a strip printing out of the slot. Every colour comes from a token.
 */
export default function BoothIllustration() {
  const scallops = " q-13.25 10 -26.5 0".repeat(4);

  return (
    <svg
      viewBox="0 0 360 500"
      className={styles.art}
      role="img"
      aria-label="Illustration of a photobooth with a red curtain and a photo strip printing out of the side"
    >
      <defs>
        <clipPath id="pose-booth-opening">
          <rect x="44" y="96" width="180" height="344" rx="18" />
        </clipPath>
        <clipPath id="pose-booth-tray">
          <rect x="250" y="356" width="64" height="100" />
        </clipPath>
      </defs>

      {/* Floor line */}
      <line x1="0" y1="479" x2="360" y2="479" className={styles.floorLine} />

      {/* Sign */}
      <line x1="150" y1="54" x2="150" y2="72" className={styles.stroke} />
      <line x1="210" y1="54" x2="210" y2="72" className={styles.stroke} />
      <rect x="115" y="10" width="130" height="44" rx="22" className={styles.sign} />
      <text x="180" y="40" textAnchor="middle" className={styles.signText}>
        Photos
      </text>

      {/* Feet */}
      <rect x="52" y="462" width="28" height="16" rx="4" className={styles.solid} />
      <rect x="280" y="462" width="28" height="16" rx="4" className={styles.solid} />

      {/* Body */}
      <rect x="20" y="72" width="320" height="392" rx="40" className={styles.body} />

      {/* Opening */}
      <rect x="44" y="96" width="180" height="344" rx="18" className={styles.opening} />
      <g clipPath="url(#pose-booth-opening)">
        {/* Camera on the back wall */}
        <rect x="160" y="150" width="44" height="34" rx="8" className={styles.panel} />
        <circle cx="182" cy="167" r="9" className={`${styles.lens}`} />

        {/* Bench */}
        <rect x="36" y="318" width="108" height="26" rx="6" className={styles.panel} />

        {/* Checkered floor */}
        <line x1="44" y1="388" x2="224" y2="388" className={styles.stroke} />
        {Array.from({ length: 16 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          return (col + row) % 2 === 0 ? (
            <rect key={i} x={44 + col * 22.5} y={388 + row * 26} width="22.5" height="26" className={styles.solid} />
          ) : null;
        })}

        {/* Curtain */}
        <path d={`M30 96 H150 V292${scallops} H30 Z`} className={styles.curtain} />
        {[70.5, 97, 123.5].map((x) => (
          <line key={x} x1={x} y1="108" x2={x} y2="286" className={styles.fold} />
        ))}
        <line x1="30" y1="104" x2="224" y2="104" className={styles.stroke} />
      </g>
      <rect x="44" y="96" width="180" height="344" rx="18" className={styles.outline} />

      {/* Side panel */}
      <image href="/brand/pose-mark.svg" x="258" y="118" width="48" height="48" />
      <line x1="224" y1="208" x2="340" y2="208" className={styles.stroke} />
      <rect x="256" y="234" width="52" height="28" rx="6" className={styles.outline} />
      <line x1="270" y1="248" x2="294" y2="248" className={styles.stroke} />
      <circle cx="282" cy="292" r="9" className={styles.button} />
      <line x1="224" y1="326" x2="340" y2="326" className={styles.stroke} />

      {/* Strip printing out of the slot */}
      <g clipPath="url(#pose-booth-tray)">
        <g className={styles.strip}>
          <rect x="266" y="356" width="32" height="88" rx="3" className={styles.stripPaper} />
          {[361, 381, 401, 421].map((y) => (
            <rect key={y} x="270" y={y} width="24" height="16" rx="2" className={styles.stripFrame} />
          ))}
        </g>
      </g>
      <rect x="256" y="350" width="52" height="8" rx="4" className={styles.solid} />
    </svg>
  );
}
