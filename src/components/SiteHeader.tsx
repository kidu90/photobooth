import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logoLink}>
          <img src="/brand/pose-logo.svg" alt="Pose home" className={styles.logo} />
        </Link>
        {showCta && (
          <nav aria-label="Main">
            <ul className={styles.nav}>
              <li className={styles.navLinkItem}>
                <Link href="/#how-it-works" className={`t-label ${styles.navLink}`}>
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/booth" className="btn btn-primary">
                  Start a booth
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
