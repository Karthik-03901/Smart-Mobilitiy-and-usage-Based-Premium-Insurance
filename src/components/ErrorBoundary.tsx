'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorPages.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary caught in ${this.props.componentName || 'Component'}]`, error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.componentFallback}>
          <div style={{ fontSize: '28px' }}>⚠️</div>
          <h4 className={styles.componentFallbackTitle}>
            {this.props.componentName
              ? `${this.props.componentName} Failed to Render`
              : 'Component Interrupted'}
          </h4>
          <p className={styles.componentFallbackDesc}>
            {this.state.error?.message || 'An unexpected rendering error occurred in this view module.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ height: '38px', fontSize: '0.8125rem', padding: '0 16px' }}
              onClick={this.handleRetry}
            >
              🔄 Retry Module
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              style={{ height: '38px', fontSize: '0.8125rem', padding: '0 16px' }}
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
            >
              🏠 Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
