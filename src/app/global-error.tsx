'use client';

import React from 'react';
import '../styles/globals.css';
import styles from '../components/ErrorPages.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <div className={styles.radarWrap}>
              <div className={`${styles.radarRing} ${styles.radarRingError}`} />
              <div className={`${styles.radarRing} ${styles.radarRingError}`} />
              <div className={styles.radarIconBox} style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
                <span>🛑</span>
              </div>
            </div>

            <div className={`${styles.statusBadge} ${styles.statusBadgeError}`}>
              <span className={styles.badgeDot} />
              Critical Framework Failure
            </div>

            <div className={`${styles.errorCode} ${styles.errorCodeDanger}`}>Critical</div>
            <h1 className={styles.errorTitle}>Application Root Interrupted</h1>
            <p className={styles.errorDesc}>
              A critical issue affected the primary framework layout. You can reboot the session or return to the main dashboard.
            </p>

            <div className={styles.diagnosticBox}>
              <div className={styles.diagnosticCode}>
                {error.message || 'Fatal framework exception occurred.'}
              </div>
            </div>

            <div className={styles.actionGroup}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => reset()}
              >
                <span>🔄</span>
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = '/';
                }}
              >
                <span>🏠</span>
                <span>Home Page</span>
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
