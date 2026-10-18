'use client';

import React, { useEffect, useState } from 'react';
import styles from '../components/ErrorPages.module.css';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to telemetry reporting service
    console.error('[DriveFair Error Handler]', error);
  }, [error]);

  const handleCopyLogs = () => {
    const payload = `DriveFair Diagnostic Log:
Time: ${new Date().toISOString()}
Message: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack: ${error.stack || 'No stack trace'}
UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <main className={styles.errorContainer}>
      <div className={styles.errorCard}>
        {/* Pulsing Warning Beacon */}
        <div className={styles.radarWrap}>
          <div className={`${styles.radarRing} ${styles.radarRingError}`} />
          <div className={`${styles.radarRing} ${styles.radarRingError}`} />
          <div className={`${styles.radarRing} ${styles.radarRingError}`} />
          <div className={`${styles.radarIconBox} ${styles.radarIconBoxError}`}>
            <span>⚠️</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`${styles.statusBadge} ${styles.statusBadgeError}`}>
          <span className={styles.badgeDot} />
          Telemetry System Alert • 500
        </div>

        <div className={`${styles.errorCode} ${styles.errorCodeDanger}`}>500</div>
        <h1 className={styles.errorTitle}>Telematics Engine Interrupted</h1>
        <p className={styles.errorDesc}>
          An unexpected runtime condition occurred while processing trip telematics or rendering this view.
          DriveFair has safeguarded your state and data.
        </p>

        {/* Diagnostic Box */}
        <div className={styles.diagnosticBox}>
          <div className={styles.diagnosticHeader}>
            <span>Diagnostic Signature</span>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => setShowDetails(s => !s)}
            >
              {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
            </button>
          </div>

          <div className={styles.diagnosticCode}>
            {error.message || 'Unknown runtime error occurred.'}
            {error.digest && (
              <div style={{ marginTop: '4px', opacity: 0.8, fontSize: '0.6875rem' }}>
                Digest: {error.digest}
              </div>
            )}
            {showDetails && error.stack && (
              <pre
                style={{
                  marginTop: '8px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  fontSize: '0.6875rem',
                }}
              >
                {error.stack}
              </pre>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => reset()}
            id="btn-error-reset"
          >
            <span>🔄</span>
            <span>Reset Engine &amp; Try Again</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/';
            }}
            id="btn-error-home"
          >
            <span>🏠</span>
            <span>Return to Safe Route</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCopyLogs}
            id="btn-error-copy"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Diagnostic Logs'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
