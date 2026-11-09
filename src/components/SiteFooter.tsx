import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <img src="/brand/pose-logo.svg" alt="Pose" className={styles.logo} />
          <p className="muted">Your photos stay on your device. Nothing gets uploaded.</p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            <li>
              <Link href="/booth" className="t-label">Start a booth</Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="t-label">How it works</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
