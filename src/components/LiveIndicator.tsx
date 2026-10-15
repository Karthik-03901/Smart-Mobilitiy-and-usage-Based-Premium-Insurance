'use client';

import React from 'react';
import styles from './LiveIndicator.module.css';

export interface LiveIndicatorProps {
  label?: string;
  variant?: 'live' | 'active' | 'updating' | 'offline';
  size?: 'sm' | 'md' | 'lg';
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  label = 'Live',
  variant = 'live',
  size = 'md',
}) => {
  return (
    <div className={`${styles.indicator} ${styles[variant]} ${styles[size]}`}>
      <span className={styles.dot}></span>
      <span className={styles.label}>{label}</span>
    </div>
  );
};
