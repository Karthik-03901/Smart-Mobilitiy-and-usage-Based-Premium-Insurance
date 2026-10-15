'use client';

import React, { useState } from 'react';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { InsurerDashboard } from '../components/InsurerDashboard';
import { TripSimulator } from '../components/TripSimulator';
import { ConsentCentre } from '../components/ConsentCentre';
import { PremiumExplainer } from '../components/PremiumExplainer';
import { Button } from '../components/Button';
import styles from './page.module.css';

type View = 'customer' | 'insurer' | 'simulator' | 'consent' | 'explainer';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('customer');

  const renderView = () => {
    switch (currentView) {
      case 'customer':
        return <CustomerDashboard />;
      case 'insurer':
        return <InsurerDashboard />;
      case 'simulator':
        return <TripSimulator />;
      case 'consent':
        return <ConsentCentre />;
      case 'explainer':
        return <PremiumExplainer />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className={styles.app}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚗</span>
            <span className={styles.logoText}>DriveFair</span>
            <span className={styles.logoBeta}>Phase 1</span>
          </div>

          <div className={styles.navLinks}>
            <button
              className={`${styles.navLink} ${currentView === 'customer' ? styles.active : ''}`}
              onClick={() => setCurrentView('customer')}
            >
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </button>
            <button
              className={`${styles.navLink} ${currentView === 'simulator' ? styles.active : ''}`}
              onClick={() => setCurrentView('simulator')}
            >
              <span className={styles.navIcon}>🚦</span>
              Trip Simulator
            </button>
            <button
              className={`${styles.navLink} ${currentView === 'explainer' ? styles.active : ''}`}
              onClick={() => setCurrentView('explainer')}
            >
              <span className={styles.navIcon}>💡</span>
              Premium Breakdown
            </button>
            <button
              className={`${styles.navLink} ${currentView === 'consent' ? styles.active : ''}`}
              onClick={() => setCurrentView('consent')}
            >
              <span className={styles.navIcon}>🔒</span>
              Consent Centre
            </button>
            <button
              className={`${styles.navLink} ${currentView === 'insurer' ? styles.active : ''}`}
              onClick={() => setCurrentView('insurer')}
            >
              <span className={styles.navIcon}>📈</span>
              Insurer View
            </button>
          </div>

          <div className={styles.navActions}>
            <Button variant="ghost" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>DriveFair</h4>
            <p>Consent-based behavioral insurance pricing platform</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Features</h4>
            <ul>
              <li>Real-time trip tracking</li>
              <li>Transparent pricing</li>
              <li>Granular consent control</li>
              <li>What-if simulations</li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Data Protection</li>
              <li>IRDAI Compliance</li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact</h4>
            <ul>
              <li>support@drivefair.in</li>
              <li>1800-DRIVEFAIR</li>
              <li>Help Center</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 DriveFair. Built with transparency and fairness in mind.</p>
          <p className={styles.footerNote}>
            Phase 1 MVP • Built with Next.js, React & modern UI/UX principles
          </p>
        </div>
      </footer>
    </div>
  );
}
