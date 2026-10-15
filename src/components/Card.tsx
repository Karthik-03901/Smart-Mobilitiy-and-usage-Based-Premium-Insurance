'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  compact?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  headerAction,
  variant = 'default',
  compact = false,
  interactive = false,
  onClick,
  className = '',
  style,
}) => {
  const classes = [
    styles.card,
    variant && styles[variant],
    compact && styles.compact,
    interactive && styles.interactive,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes} 
      onClick={onClick}
      style={style}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
      onKeyDown={interactive && onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {(title || subtitle || headerAction) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};
