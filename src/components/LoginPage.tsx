'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const { login, createAccount, showToast, navigateTo } = useApp();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (tab === 'signup') {
      if (!name.trim()) e.name = 'Driver full name is required';
      if (!licenseId.trim()) e.licenseId = 'Driver License ID is required (e.g. DL-042022001928)';
      if (!vehicleNo.trim()) e.vehicleNo = 'Vehicle registration number is required (e.g. KA-01-MJ-5022)';
    }
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAccountNotice(null);
    if (!validate()) return;
    setLoading(true);

    if (tab === 'signup') {
      const res = await createAccount({
        driverName: name,
        email,
        password,
        licenseId,
        vehicleNo,
      });
      setLoading(false);
      if (!res.ok) {
        setErrors({ email: res.message || 'Account creation could not be completed.' });
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (!res.ok) {
        if (res.reason === 'NOT_FOUND') {
          // User not found: route to Create Account tab and pre-fill email
          setTab('signup');
          setSuccessNotice(null);
          setAccountNotice(
            `User not found! No account exists for "${email}". Please sign in as a new user by entering your details below to create your account.`
          );
          setErrors({
            email: 'New user: Please enter your driver details to create an account.',
          });
        } else if (res.reason === 'INVALID_CREDENTIALS') {
          setSuccessNotice(null);
          setAccountNotice(null);
          setErrors({ password: 'Incorrect password. Please try again.' });
        } else {
          setSuccessNotice(null);
          setAccountNotice(null);
          setErrors({ password: res.message || 'Login failed. Check your credentials.' });
        }
      }
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => { });
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && video) {
        video.play().catch(() => { });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleDemoLogin = async () => {
    setEmail('asha.kumar@drivefair.in');
    setPassword('demo123');
    setAccountNotice(null);
    setLoading(true);
    await login('asha.kumar@drivefair.in', 'demo123');
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topActionsWrapper}>
        <button
          id="btn-back-home"
          type="button"
          className={styles.backHomeBtn}
          onClick={() => navigateTo('home')}
          aria-label="Back to Home"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </button>
        <ThemeToggle size="sm" id="login-theme-toggle" />
      </div>

      <div className={styles.formCard} style={{ position: 'relative', width: '100%', maxWidth: '490px', borderRadius: '28px', overflow: 'hidden' }}>
        {/* Background Animation Video inside Card */}
        <div className={styles.cardVideoContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', borderRadius: '28px', pointerEvents: 'none', zIndex: 0 }}>
          <video
            ref={videoRef}
            className={styles.cardVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onPause={(e) => e.currentTarget.play()}
            onEnded={(e) => e.currentTarget.play()}
          >
            <source src="/Software_login_page_assembly_20261016003455.mp4" type="video/mp4" />
            <source src="/login-background.mp4" type="video/mp4" />
          </video>
          <div className={styles.cardVideoOverlay} style={{ position: 'absolute', inset: 0 }} />
        </div>

        {/* Card Content Layer */}
        <div className={styles.cardContent}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setTab('login'); setAccountNotice(null); setSuccessNotice(null); setErrors({}); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
              onClick={() => { setTab('signup'); setAccountNotice(null); setSuccessNotice(null); setErrors({}); }}
            >
              Create Account
            </button>
          </div>

          {/* Welcome heading */}
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {tab === 'login' ? 'Welcome Back' : 'Create Driver Account'}
            </h2>
            <p className={styles.formSubtitle}>
              {tab === 'login'
                ? 'Login to your DriveFair account'
                : 'Register your vehicle & license to start saving'}
            </p>
          </div>

          {/* Success banner when account is created */}
          {successNotice && tab === 'login' && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#065f46',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>✅</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '2px', color: '#047857' }}>
                  Account Created Successfully!
                </strong>
                {successNotice}
              </div>
            </div>
          )}

          {/* Notice banner when account not found */}
          {accountNotice && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid #f59e0b',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#92400e',
              fontSize: '13px',
              lineHeight: '1.45',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '2px', color: '#78350f' }}>
                  No Account Found
                </strong>
                {accountNotice}
              </div>
            </div>
          )}

          {/* Demo shortcut */}
          <button type="button" className={styles.demoBtn} onClick={handleDemoLogin} disabled={loading}>
            <span className={styles.demoBtnIcon}>&#9658;</span>
            Quick Demo — Sign in as Asha Kumar
          </button>

          <div className={styles.divider}>
            <span>{tab === 'login' ? 'or continue with email' : 'or enter driver details'}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {tab === 'signup' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Driver Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      id="input-name"
                      type="text"
                      className={`${styles.input} ${styles.inputWithIcon} ${errors.name ? styles.inputError : ''}`}
                      placeholder="e.g. Asha Kumar"
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                      autoFocus
                    />
                  </div>
                  {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Driver License ID</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🪪</span>
                    <input
                      id="input-license"
                      type="text"
                      className={`${styles.input} ${styles.inputWithIcon} ${errors.licenseId ? styles.inputError : ''}`}
                      placeholder="e.g. DL-042022001928"
                      value={licenseId}
                      onChange={e => { setLicenseId(e.target.value); setErrors(p => ({ ...p, licenseId: '' })); }}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.licenseId && <p className={styles.errorMsg}>{errors.licenseId}</p>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Vehicle Number</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🚗</span>
                    <input
                      id="input-vehicle"
                      type="text"
                      className={`${styles.input} ${styles.inputWithIcon} ${errors.vehicleNo ? styles.inputError : ''}`}
                      placeholder="e.g. KA-01-MJ-5022"
                      value={vehicleNo}
                      onChange={e => { setVehicleNo(e.target.value); setErrors(p => ({ ...p, vehicleNo: '' })); }}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.vehicleNo && <p className={styles.errorMsg}>{errors.vehicleNo}</p>}
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>@</span>
                <input
                  id="input-email"
                  type="email"
                  className={`${styles.input} ${styles.inputWithIcon} ${errors.email ? styles.inputError : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                {tab === 'login' && (
                  <button type="button" className={styles.forgotLink} onClick={() => showToast('Password reset is not available in the Phase 1 demo.', 'info')}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ''}`}
                  placeholder={tab === 'login' ? 'Your password' : 'Minimum 6 characters'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">
                  {showPassword ? '●' : '○'}
                </button>
              </div>
              {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
            </div>

            {tab === 'login' && (
              <label className={styles.rememberRow}>
                <input type="checkbox" className={styles.checkbox} checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span className={styles.rememberLabel}>Remember me on this device</span>
              </label>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              className={`${styles.submitBtn} ${loading ? styles.submitLoading : ''}`}
              disabled={loading}
            >
              {loading
                ? <><span className={styles.spinner} />{tab === 'login' ? 'Signing in...' : 'Saving to Database...'}</>
                : (tab === 'login' ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          {/* Switch tab */}
          <p className={styles.switchRow}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className={styles.switchLink} onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setAccountNotice(null); setErrors({}); }}>
              {tab === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <p className={styles.terms}>
            By continuing you agree to our{' '}
            <button className={styles.termsLink} onClick={() => showToast('Privacy Policy not available in Phase 1 demo.', 'info')}>Privacy Policy</button>
            {' '}and{' '}
            <button className={styles.termsLink} onClick={() => showToast('Terms not available in Phase 1 demo.', 'info')}>Terms of Service</button>.
          </p>
        </div>
      </div>
    </div>
  );
};
