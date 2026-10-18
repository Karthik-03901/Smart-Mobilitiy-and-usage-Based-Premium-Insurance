'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'sm',
  showLabel = false,
  className = '',
  id = 'theme-toggle-btn',
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  const buttonElement = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`${styles.toggleButton} ${size === 'md' ? styles.sizeMd : styles.sizeSm} ${
        isDark ? styles.toggleDark : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className={styles.track}>
        {/* Left icon (Sun) */}
        <span className={`${styles.icon} ${styles.iconSun}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        </span>

        {/* Right icon (Moon) */}
        <span className={`${styles.icon} ${styles.iconMoon}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </span>

        {/* Animated Thumb */}
        <span className={styles.thumb} aria-hidden="true">
          <span className={styles.thumbIcon}>
            {isDark ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            )}
          </span>
        </span>
      </div>
    </button>
  );

  if (showLabel) {
    return (
      <div className={styles.labelWrapper}>
        {buttonElement}
        <span className={styles.labelText}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>
    );
  }

  return buttonElement;
};
