import Link from 'next/link';
import styles from '../components/ErrorPages.module.css';

export const metadata = {
  title: '404 - Route Not Found | DriveFair',
  description: 'The requested route or telematics endpoint could not be found.',
};

export default function NotFound() {
  return (
    <main className={styles.errorContainer}>
      <div className={styles.errorCard}>
        {/* Radar Pulse Animation */}
        <div className={styles.radarWrap}>
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarIconBox}>
            <span>🧭</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={styles.statusBadge}>
          <span className={styles.badgeDot} />
          GPS Signal Lost • 404
        </div>

        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>Route Not Found</h1>
        <p className={styles.errorDesc}>
          The destination or telematics resource you are looking for is not mapped on the DriveFair network.
          It might have been relocated, unlinked, or never existed.
        </p>

        {/* Primary Actions */}
        <div className={styles.actionGroup}>
          <Link href="/" className={styles.btnPrimary} id="btn-404-home">
            <span>🏠</span>
            <span>Return to Safe Route (Home)</span>
          </Link>
          <Link href="/?view=dashboard" className={styles.btnSecondary} id="btn-404-dashboard">
            <span>📊</span>
            <span>Driver Dashboard</span>
          </Link>
        </div>

        {/* Quick Navigation Destination Pills */}
        <div className={styles.quickLinks}>
          <div className={styles.quickLinksTitle}>Quick Telematics Links</div>
          <div className={styles.quickPills}>
            <Link href="/?view=simulator" className={styles.quickPill}>
              <span>⚡</span> Trip Simulator
            </Link>
            <Link href="/?view=consent" className={styles.quickPill}>
              <span>🔐</span> Consent Centre
            </Link>
            <Link href="/?view=about" className={styles.quickPill}>
              <span>ℹ️</span> About DriveFair
            </Link>
            <Link href="/?view=help" className={styles.quickPill}>
              <span>❓</span> Help &amp; Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
