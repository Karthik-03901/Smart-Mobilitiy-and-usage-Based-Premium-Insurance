'use client';

import React, { useEffect, useState } from 'react';

import { AppProvider, useApp } from '../context/AppContext';
import { HomePage } from '../components/HomePage';
import { AboutPage } from '../components/AboutPage';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { ProfilePage } from '../components/ProfilePage';
import { HelpPage } from '../components/HelpPage';
import { InsurerDashboard } from '../components/InsurerDashboard';
import { TripSimulator } from '../components/TripSimulator';
import { ConsentCentre } from '../components/ConsentCentre';
import { PremiumExplainer } from '../components/PremiumExplainer';
import { LoginPage } from '../components/LoginPage';
import { SafeDriveApp } from '../components/SafeDriveApp';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { ErrorBoundary } from '../components/ErrorBoundary';
import styles from './page.module.css';

function HomeContent() {
  const { currentView, navigateTo, goBack, canGoBack, isAuthenticated, currentUser, logout, showToast } = useApp();
  const [navHidden, setNavHidden] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Legal & Support Modals State with Mock Data
  const [activeFooterModal, setActiveFooterModal] = useState<'privacy' | 'terms' | 'irdai' | 'phone' | 'email' | null>(null);
  const [callbackPhone, setCallbackPhone] = useState<string>('+91 98765 43210');
  const [callbackCategory, setCallbackCategory] = useState<string>('Telematics Score & Discount');
  const [callbackSuccess, setCallbackSuccess] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('Inquiry on safe driving discount tier');
  const [ticketMessage, setTicketMessage] = useState<string>('Hello DriveFair support, I logged 342 miles this week with a 92% smooth braking score. When will this reflect on my monthly premium discount?');
  const [ticketSuccess, setTicketSuccess] = useState<boolean>(false);

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          // Always reveal navbar near the top of the page (first 60px)
          if (currentScrollY <= 60) {
            setNavHidden(false);
          } else if (diff > 8) {
            // Scrolling down -> hide navbar
            setNavHidden(true);
          } else if (diff < -8) {
            // Scrolling up -> reveal navbar
            setNavHidden(false);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on every view change & reset navbar visibility
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setNavHidden(false);
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'home':      return <HomePage />;
      case 'about':     return <AboutPage />;
      case 'dashboard': return <CustomerDashboard />;
      case 'profile':   return <ProfilePage />;
      case 'help':      return <HelpPage />;
      case 'simulator': return <TripSimulator />;
      case 'explainer': return <PremiumExplainer />;
      case 'consent':   return <ConsentCentre />;
      case 'insurer':   return <InsurerDashboard />;
      case 'safedrive': return <SafeDriveApp />;
      case 'login':     return <LoginPage />;
      default:          return <HomePage />;
    }
  };

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    showToast('Signed out successfully.', 'info');
  };

  const handleCancelSignOut = () => {
    setShowSignOutConfirm(false);
  };

  const handleOpenFooterModal = (type: 'privacy' | 'terms' | 'irdai' | 'phone' | 'email') => {
    setCallbackSuccess(false);
    setTicketSuccess(false);
    setActiveFooterModal(type);
  };

  const handleCloseFooterModal = () => {
    setActiveFooterModal(null);
  };

  const handleDownloadMockPdf = (docName: string) => {
    const mockContent = `DriveFair Official Document: ${docName}\nPolicyholder: ${currentUser?.driverName || 'Driver'}\nPolicy #: ${currentUser?.policyNumber || 'P-19284-A'}\nVerification Date: 2026-10-16\nIRDAI Sandbox Ref: IRDAI/NL-UBI/2026/DF-982\n\nThis is an official cryptographic verification proof issued by the DriveFair Core Telematics Engine.`;
    const blob = new Blob([mockContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName.toLowerCase().replace(/\s+/g, '_')}_2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded verified ${docName} package.`, 'info');
  };

  const nl = (view: typeof currentView) =>
    `${styles.navLink}${currentView === view ? ' ' + styles.active : ''}`;

  const isFullPage = currentView === 'home' || currentView === 'about' || currentView === 'safedrive' || currentView === 'login';
  const isAuthPage = currentView === 'login';

  return (
    <div className={styles.app}>
      {!isAuthPage && (
        <nav className={`${styles.nav} ${navHidden ? styles.navHidden : ''}`}>
          <div className={styles.navContent}>
            <div className={styles.navBrandGroup}>
              <button
                id="nav-back-btn"
                className={`${styles.backButton} ${canGoBack ? styles.backButtonActive : styles.backButtonDisabled}`}
                onClick={goBack}
                disabled={!canGoBack}
                aria-label="Go back to previous page"
                title={canGoBack ? "Go back to previous page" : "Already at start"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className={styles.logo}
                onClick={() => navigateTo('home')}
                aria-label="Go to Home"
                title="DriveFair Home"
              >
                <div className={styles.logoIcon}>D</div>
                <span className={styles.logoText}>DriveFair</span>
              </button>
            </div>

            <div className={styles.navLinks}>
              <button id="nav-home"      className={nl('home')}      onClick={() => navigateTo('home')}>
                <span className={styles.navIcon} />Home
              </button>
              <button id="nav-about"     className={nl('about')}     onClick={() => navigateTo('about')}>
                <span className={styles.navIcon} />About
              </button>
              <button id="nav-safedrive" className={nl('safedrive')} onClick={() => navigateTo('safedrive')}>
                <span className={styles.navIcon} />SafeDrive
              </button>
              <button id="nav-dashboard" className={nl('dashboard')} onClick={() => navigateTo('dashboard')}>
                <span className={styles.navIcon} />Dashboard
              </button>
              <button id="nav-profile"   className={nl('profile')}   onClick={() => navigateTo('profile')}>
                <span className={styles.navIcon} />Profile
              </button>
              <button id="nav-help"      className={nl('help')}      onClick={() => navigateTo('help')}>
                <span className={styles.navIcon} />Help
              </button>
            </div>

            <div className={styles.navActions}>
              {isAuthenticated && (
                <div className={styles.userGreeting} id="user-greeting-pill">
                  <span className={styles.greetingPrefix}>Welcome,</span>
                  <span className={styles.greetingName}>{currentUser?.driverName || 'Driver'}</span>
                </div>
              )}
              <ThemeToggle size="md" id="nav-theme-toggle" />
              {isAuthenticated ? (
                <Button id="btn-sign-out" variant="ghost" size="md" onClick={handleSignOutClick}>
                  Sign Out
                </Button>
              ) : (
                <Button id="btn-login" variant="primary" size="md" onClick={() => navigateTo('login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className={isFullPage ? styles.mainFull : styles.main}>
        <div key={currentView} className={isFullPage ? styles.contentFull : `${styles.content} ${styles.viewTransition}`}>
          <ErrorBoundary key={currentView} componentName={`DriveFair ${currentView.toUpperCase()}`}>
            {renderView()}
          </ErrorBoundary>
        </div>
      </main>

      {!isAuthPage && (
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>DriveFair</h4>
              <p>Consent-based behavioral insurance pricing. Fair, transparent, data-driven.</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Navigate</h4>
              <ul>
                <li><button className={styles.footerLink} onClick={() => navigateTo('home')}>Home</button></li>
                <li><button className={styles.footerLink} onClick={() => navigateTo('safedrive')}>SafeDrive Live HUD</button></li>
                <li><button className={styles.footerLink} onClick={() => navigateTo('about')}>About Us</button></li>
                <li><button className={styles.footerLink} onClick={() => navigateTo('dashboard')}>Dashboard</button></li>
                <li><button className={styles.footerLink} onClick={() => navigateTo('simulator')}>Trip Simulator</button></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <ul>
                <li><button className={styles.footerLink} onClick={() => handleOpenFooterModal('privacy')}>Privacy Policy</button></li>
                <li><button className={styles.footerLink} onClick={() => handleOpenFooterModal('terms')}>Terms of Service</button></li>
                <li><button className={styles.footerLink} onClick={() => handleOpenFooterModal('irdai')}>IRDAI Compliance</button></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4>Support</h4>
              <ul>
                <li><button className={styles.footerLink} onClick={() => navigateTo('help')}>Help Center</button></li>
                <li><button className={styles.footerLink} onClick={() => handleOpenFooterModal('email')}>support@drivefair.in</button></li>
                <li><button className={styles.footerLink} onClick={() => handleOpenFooterModal('phone')}>1800-DRIVEFAIR</button></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>2026 DriveFair. Built with transparency and fairness.</p>
            <p className={styles.footerNote}>Phase 1 MVP</p>
          </div>
        </footer>
      )}

      {showSignOutConfirm && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCancelSignOut}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-out-modal-title"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 id="sign-out-modal-title" className={styles.modalTitle}>
              Verify Sign Out
            </h3>
            <p className={styles.modalDesc}>
              Are you sure you want to sign out, <strong>{currentUser?.driverName || 'Driver'}</strong>? You will need to sign in again to access your personalized telematics dashboard.
            </p>
            <div className={styles.modalActions}>
              <button
                id="btn-cancel-sign-out"
                type="button"
                className={styles.modalCancelBtn}
                onClick={handleCancelSignOut}
              >
                Cancel
              </button>
              <button
                id="btn-confirm-sign-out"
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmSignOut}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Privacy Policy Modal ─── */}
      {activeFooterModal === 'privacy' && (
        <div className={styles.modalBackdrop} onClick={handleCloseFooterModal} role="dialog" aria-modal="true">
          <div className={styles.largeModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderWrap}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalBrandIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Privacy Policy & Data Sovereignty</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Version 2.8 • DPDP Act 2023 & IRDAI Compliant • Last Audited: October 2026
                  </p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseFooterModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBodyScroll}>
              <div className={styles.modalInfoBox}>
                <span style={{ fontSize: '1.2rem' }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8' }}>
                    Core Principle: Edge Computing & Zero Trajectory Selling
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 2 }}>
                    DriveFair processes GPS & accelerometer data locally on your device. We never sell, lease, or broker raw trip paths to third parties or advertising networks.
                  </div>
                </div>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>1. Telematics Collected vs. Never Collected</h4>
                <p className={styles.modalSectionText}>
                  We collect aggregate safety metrics: braking deceleration (G-forces), cornering lateral force, speed limit compliance, and daytime vs. night driving ratios. We <strong>never</strong> store continuous street-level surveillance or personal travel destinations.
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>2. Cryptographic k-Anonymization</h4>
                <p className={styles.modalSectionText}>
                  When communicating with insurance underwriters for policy renewals, scores are aggregated into differential privacy risk tiers (e.g. Tier 1: 90-100, Tier 2: 80-89). Underwriters receive verified discount eligibility without raw sensor telemetry.
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>3. Right to Erasure & Consent Revocation</h4>
                <p className={styles.modalSectionText}>
                  You hold complete sovereignty over your data. You may pause telematics tracking or permanently delete all trip history at any time through the DriveFair Consent Centre.
                </p>
                <div className={styles.badgePillsRow}>
                  <span className={styles.badgePill}>On-Device Edge Computation</span>
                  <span className={styles.badgePill}>AES-256 Encryption at Rest</span>
                  <span className={styles.badgePill}>90-Day Auto Purge</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooterBar}>
              <button
                className={styles.modalSecondaryBtn}
                onClick={() => {
                  handleCloseFooterModal();
                  navigateTo('consent');
                }}
              >
                Go to Consent Centre
              </button>
              <button
                className={styles.modalCtaBtn}
                onClick={() => handleDownloadMockPdf('Privacy Policy & Telematics Governance')}
              >
                Download Policy Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Terms of Service Modal ─── */}
      {activeFooterModal === 'terms' && (
        <div className={styles.modalBackdrop} onClick={handleCloseFooterModal} role="dialog" aria-modal="true">
          <div className={styles.largeModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderWrap}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalBrandIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Terms of Service & Driver Agreement</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Contract Ref: DF-TOS-2026-V3 • Active Policy #{currentUser?.policyNumber || 'P-19284-A'}
                  </p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseFooterModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBodyScroll}>
              <div className={styles.modalInfoBox}>
                <span style={{ fontSize: '1.2rem' }}>📜</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8' }}>
                    Fair Pricing Guarantee: Discounts Only, No Arbitrary Surcharges
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 2 }}>
                    DriveFair policies reward safe drivers with up to 35% discount. Lower telematics scores will never increase your baseline statutory insurance rate.
                  </div>
                </div>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>1. Usage-Based Premium Calculation</h4>
                <p className={styles.modalSectionText}>
                  Discounts are calculated based on transparent criteria: Smooth Braking (30%), Speed Compliance (35%), Focus & Daytime Driving (20%), and Route Regularity (15%). Monthly savings are applied directly to renewal invoices.
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>2. 14-Day Erroneous Event Dispute Window</h4>
                <p className={styles.modalSectionText}>
                  If an emergency evasion or public transit ride triggers an incorrect harsh event, policyholders have 14 days to submit an appeal via the Trip Simulator for automated review and score adjustment.
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>3. Emergency Assistance & Fleet Dispatch</h4>
                <p className={styles.modalSectionText}>
                  Complimentary roadside assistance (Flat Tire, Fuel/EV Charge, Jumpstart, Towing) is provided in collaboration with certified rapid patrol hauler fleets across India with $0 deductible under policy #{currentUser?.policyNumber || 'P-19284-A'}.
                </p>
              </div>
            </div>

            <div className={styles.modalFooterBar}>
              <button
                className={styles.modalSecondaryBtn}
                onClick={() => handleDownloadMockPdf('Terms of Service Agreement')}
              >
                Download Agreement
              </button>
              <button
                className={styles.modalCtaBtn}
                onClick={() => {
                  showToast('Terms of Service acknowledged and saved to policy profile.', 'info');
                  handleCloseFooterModal();
                }}
              >
                I Accept & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── IRDAI Compliance Modal ─── */}
      {activeFooterModal === 'irdai' && (
        <div className={styles.modalBackdrop} onClick={handleCloseFooterModal} role="dialog" aria-modal="true">
          <div className={styles.largeModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderWrap}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalBrandIcon} style={{ background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>IRDAI Regulatory Compliance & Sandbox</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Approval Ref: IRDAI/NL-UBI/2026/DF-982 • Regulatory Sandbox Batch VII
                  </p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseFooterModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBodyScroll}>
              <div className={styles.modalInfoBox} style={{ borderColor: 'rgba(16, 185, 129, 0.35)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#34d399' }}>
                    Certified Indian Regulatory Sandbox Product
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 2 }}>
                    Approved by the Insurance Regulatory and Development Authority of India (IRDAI) under the Use and File Telematics Sandbox Guidelines for PHYD & PAYD products.
                  </div>
                </div>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>Actuarial Transparency & Filing Standards</h4>
                <p className={styles.modalSectionText}>
                  In accordance with IRDAI circular <em>IRDAI/NL/GDL/MISC/2026</em>, all algorithmic pricing coefficients are deposited in the IRDAI actuarial registry. Underwriting factors are open to policyholder inspection with 100% mathematical auditability.
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>Data Sovereignty & Local Hosting Mandate</h4>
                <p className={styles.modalSectionText}>
                  All policy records, telematics aggregations, and claims telemetry are stored exclusively within sovereign Indian data borders on MeitY-accredited Tier-IV data centers in Mumbai (ap-south-1) and Hyderabad (ap-south-2).
                </p>
              </div>

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>Consumer Grievance Redressal (Bima Bharosa)</h4>
                <p className={styles.modalSectionText}>
                  Policyholders have statutory access to IRDAI&apos;s Bima Bharosa online portal. Principal Grievance Officer: <strong>Shri R. K. Nambiar</strong> (grievance@drivefair.in • +91-22-6899-4400 • IRDAI Reg #GO-8841).
                </p>
                <div className={styles.badgePillsRow}>
                  <span className={styles.badgePill} style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>IRDAI Sandbox Certified</span>
                  <span className={styles.badgePill}>DPDP Act 2023 Compliant</span>
                  <span className={styles.badgePill}>ISO 27001 Certified</span>
                  <span className={styles.badgePill}>SOC-2 Type II Audited</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooterBar}>
              <button
                className={styles.modalSecondaryBtn}
                onClick={() => showToast('Connecting to IRDAI Bima Bharosa portal: bimabharosa.irdai.gov.in', 'info')}
              >
                Bima Bharosa Portal
              </button>
              <button
                className={styles.modalCtaBtn}
                onClick={() => handleDownloadMockPdf('IRDAI Regulatory Sandbox Certificate')}
              >
                View Sandbox Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 1800-DRIVEFAIR Phone Helpline & Instant Callback Modal ─── */}
      {activeFooterModal === 'phone' && (
        <div className={styles.modalBackdrop} onClick={handleCloseFooterModal} role="dialog" aria-modal="true">
          <div className={styles.largeModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderWrap}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalBrandIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>24/7 Priority Support & Roadside Line</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Toll-Free: 1800-DRIVEFAIR (1800-374-833247) • Round-the-clock
                  </p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseFooterModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBodyScroll}>
              <div className={styles.callDeskGrid}>
                <div className={styles.callStatCard}>
                  <span className={styles.callStatLabel}>Current Wait Time</span>
                  <span className={styles.callStatValue}>28 seconds</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>🟢 All phone lines open</span>
                </div>
                <div className={styles.callStatCard}>
                  <span className={styles.callStatLabel}>Specialists Online</span>
                  <span className={styles.callStatValue}>14 Agents</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Telematics & Claims desk</span>
                </div>
              </div>

              {!callbackSuccess ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCallbackSuccess(true);
                    showToast(`Priority callback scheduled for ${callbackPhone}! An agent will connect in ~90 seconds.`, 'info');
                  }}
                  className={styles.modalSectionCard}
                >
                  <h4 className={styles.modalSectionTitle}>Request Instant Agent Callback</h4>
                  <p className={styles.modalSectionText}>
                    Skip the queue. Enter your phone number and our automated dispatch system will connect you with a specialist in under 2 minutes.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                    <div className={styles.callInputGroup}>
                      <label className={styles.callInputLabel}>Your Phone Number</label>
                      <input
                        type="tel"
                        className={styles.callTextInput}
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.callInputGroup}>
                      <label className={styles.callInputLabel}>Inquiry Reason</label>
                      <select
                        className={styles.callTextInput}
                        value={callbackCategory}
                        onChange={(e) => setCallbackCategory(e.target.value)}
                      >
                        <option value="Telematics Score & Discount">Telematics Score & Discount</option>
                        <option value="Emergency Roadside Help">Emergency Roadside Help</option>
                        <option value="Policy Renewal & Billing">Policy Renewal & Billing</option>
                        <option value="Trip Event Dispute">Trip Event Dispute</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.modalCtaBtn}
                    style={{ marginTop: 12, alignSelf: 'flex-start' }}
                  >
                    ⚡ Request Callback Now
                  </button>
                </form>
              ) : (
                <div className={styles.modalInfoBox} style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
                  <span style={{ fontSize: '1.4rem' }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#34d399' }}>
                      Callback Scheduled to {callbackPhone}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: 4 }}>
                      Senior Telematics Specialist <strong>Kavita Sharma</strong> has been assigned to inquiry #{currentUser?.policyNumber || 'P-19284-A'} ({callbackCategory}). Estimated call connection: <strong>1 min 30 sec</strong>.
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>Direct Dial Shortcut</h4>
                <p className={styles.modalSectionText}>
                  Need immediate connection? Tap below to launch your phone dialer directly:
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <a
                    href="tel:1800374833247"
                    className={styles.modalCtaBtn}
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    onClick={() => showToast('Dialing 1800-DRIVEFAIR (1800-374-833247)...', 'info')}
                  >
                    📞 Call 1800-DRIVEFAIR
                  </a>
                  <button
                    className={styles.modalSecondaryBtn}
                    onClick={() => {
                      handleCloseFooterModal();
                      navigateTo('safedrive');
                    }}
                  >
                    Open SafeDrive Emergency Hub →
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalFooterBar}>
              <button className={styles.modalSecondaryBtn} onClick={handleCloseFooterModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── support@drivefair.in Direct Support Ticket Modal ─── */}
      {activeFooterModal === 'email' && (
        <div className={styles.modalBackdrop} onClick={handleCloseFooterModal} role="dialog" aria-modal="true">
          <div className={styles.largeModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderWrap}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalBrandIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Email Support Desk</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    support@drivefair.in • Policy #{currentUser?.policyNumber || 'P-19284-A'}
                  </p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseFooterModal} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBodyScroll}>
              {!ticketSuccess ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setTicketSuccess(true);
                    showToast('Support Ticket #DF-84920 created! An engineering officer will respond within 15 mins.', 'info');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className={styles.callInputGroup}>
                      <label className={styles.callInputLabel}>Policyholder Name</label>
                      <input
                        type="text"
                        className={styles.callTextInput}
                        value={currentUser?.driverName || 'Karthik Rajalee'}
                        readOnly
                      />
                    </div>
                    <div className={styles.callInputGroup}>
                      <label className={styles.callInputLabel}>Active Policy Number</label>
                      <input
                        type="text"
                        className={styles.callTextInput}
                        value={currentUser?.policyNumber || 'P-19284-A'}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className={styles.callInputGroup}>
                    <label className={styles.callInputLabel}>Subject</label>
                    <input
                      type="text"
                      className={styles.callTextInput}
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.callInputGroup}>
                    <label className={styles.callInputLabel}>Message / Inquiry Details</label>
                    <textarea
                      rows={4}
                      className={styles.callTextInput}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      ⚡ Priority Response Guarantee: &lt; 15 mins
                    </span>
                    <button type="submit" className={styles.modalCtaBtn}>
                      Send Support Ticket
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.modalInfoBox} style={{ borderColor: '#38bdf8', background: 'rgba(14, 165, 233, 0.12)' }}>
                  <span style={{ fontSize: '1.4rem' }}>📨</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>
                      Support Ticket #DF-84920 Created Successfully
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: 4 }}>
                      We have logged your ticket regarding &ldquo;{ticketSubject}&rdquo;. A confirmation email with audit tracking has been dispatched to <strong>{currentUser?.driverName?.toLowerCase().replace(/\s+/g, '.') || 'karthik'}@drivefair.in</strong>.
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalSectionCard}>
                <h4 className={styles.modalSectionTitle}>Direct Email Client Link</h4>
                <p className={styles.modalSectionText}>
                  Prefer to draft an email directly from your desktop mail client (Outlook, Apple Mail, Gmail)?
                </p>
                <div style={{ marginTop: 8 }}>
                  <a
                    href="mailto:support@drivefair.in?subject=DriveFair%20Support%20Inquiry%20Policy%20P-19284-A"
                    className={styles.modalSecondaryBtn}
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Open Mail App (support@drivefair.in)
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.modalFooterBar}>
              <button className={styles.modalSecondaryBtn} onClick={handleCloseFooterModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
