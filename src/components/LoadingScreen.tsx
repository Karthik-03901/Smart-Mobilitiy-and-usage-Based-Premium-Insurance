'use client';

import React, { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  inline?: boolean;
}

const TELEMATICS_STEPS = [
  'Connecting to encrypted telematics pipeline...',
  'Syncing high-frequency GPS telemetry...',
  'Validating granular privacy consent tokens...',
  'Computing live driver safety metrics...',
  'Finalizing behavioral premium indices...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading DriveFair',
  subtext = 'Preparing behavioral insurance telematics engine...',
  inline = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % TELEMATICS_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${styles.loadingContainer} ${inline ? styles.loadingInline : ''}`}>
      <div className={styles.ambientGlow} />

      <div className={styles.loadingCard}>
        {/* Orbital Spinner with DriveFair Core */}
        <div className={styles.spinnerWrap}>
          <div className={styles.spinnerOuterRing} />
          <div className={styles.spinnerGradientRing} />
          <div className={styles.spinnerInnerRing} />
          <div className={styles.logoCenter}>D</div>
        </div>

        {/* Brand Label */}
        <div className={styles.brandRow}>
          <span className={styles.brandName}>DriveFair</span>
          <span className={styles.brandTag}>Telematics OS</span>
        </div>

        <h3 className={styles.loadingTitle}>{message}</h3>
        <p className={styles.loadingSubtext}>{subtext}</p>

        {/* Shimmer Progress Track */}
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
        </div>

        {/* Dynamic Telematics Ticker */}
        <div className={styles.stepTicker}>
          <span className={styles.stepDot} />
          <span>{TELEMATICS_STEPS[stepIndex]}</span>
        </div>
      </div>
    </div>
  );
};
