import { Frame, tokenVar } from "@/lib/frames";
import styles from "./PlaceholderStrip.module.css";

/**
 * A strip of four labelled placeholder frames, for showing the layout before
 * there are real photos. Decorative unless given a label.
 */
export default function PlaceholderStrip({
  frame,
  label,
  size = "md",
}: {
  frame: Frame;
  label?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={`${styles.strip} ${size === "lg" ? styles.lg : ""}`}
      style={{ background: tokenVar(frame.bg), color: tokenVar(frame.fg) }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={styles.photo}>
          <span className={`t-label ${styles.photoLabel}`}>Photo placeholder</span>
        </div>
      ))}
      <div className={styles.footer}>
        <img src={frame.logo} alt="" className={styles.logo} />
      </div>
    </div>
  );
}
