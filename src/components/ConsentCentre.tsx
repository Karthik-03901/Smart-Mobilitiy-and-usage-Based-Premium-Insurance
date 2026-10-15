'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import styles from './ConsentCentre.module.css';

interface ConsentStream {
  id: string;
  name: string;
  purpose: string;
  description: string;
  dataCollected: string[];
  retention: string;
  pricingImpact: {
    withConsent: number;
    withoutConsent: number;
  };
  isActive: boolean;
  lastUpdated: Date;
}

export const ConsentCentre: React.FC = () => {
  const [consents, setConsents] = useState<ConsentStream[]>([
    {
      id: 'telematics',
      name: 'Vehicle Telematics',
      purpose: 'Usage-based pricing and safe driving rewards',
      description: 'Track your driving behavior to offer personalized premiums based on actual driving patterns.',
      dataCollected: [
        'GPS location (coarse precision)',
        'Speed and acceleration',
        'Braking patterns',
        'Time of day and duration',
        'Trip distance'
      ],
      retention: '30 days for raw data, aggregated features kept per policy period',
      pricingImpact: {
        withConsent: 1840,
        withoutConsent: 2100
      },
      isActive: true,
      lastUpdated: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'wearable',
      name: 'Wearable Health Data',
      purpose: 'Wellness-based discount program',
      description: 'Connect your fitness tracker to earn discounts based on healthy lifestyle habits.',
      dataCollected: [
        'Daily step count',
        'Active minutes',
        'Sleep patterns',
        'Heart rate zones'
      ],
      retention: 'Monthly aggregates only',
      pricingImpact: {
        withConsent: 1950,
        withoutConsent: 2100
      },
      isActive: false,
      lastUpdated: new Date(Date.now() - 86400000 * 10),
    },
    {
      id: 'iot',
      name: 'Home IoT Sensors',
      purpose: 'Smart home security discount',
      description: 'Link your smart home security system for additional discounts on home insurance bundling.',
      dataCollected: [
        'Security system status',
        'Smoke detector alerts',
        'Water leak sensor data',
        'Door lock status'
      ],
      retention: '90 days for events, status changes kept indefinitely',
      pricingImpact: {
        withConsent: 2000,
        withoutConsent: 2100
      },
      isActive: false,
      lastUpdated: new Date(Date.now() - 86400000 * 30),
    },
  ]);

  const handleToggleConsent = (id: string) => {
    setConsents(prev =>
      prev.map(consent =>
        consent.id === id
          ? { ...consent, isActive: !consent.isActive, lastUpdated: new Date() }
          : consent
      )
    );
  };

  const activeCount = consents.filter(c => c.isActive).length;
  const totalSavings = consents
    .filter(c => c.isActive)
    .reduce((sum, c) => sum + (c.pricingImpact.withoutConsent - c.pricingImpact.withConsent), 0);

  return (
    <div className={styles.consentCentre}>
      <div className={styles.header}>
        <h1 className={styles.title}>Data Consent Centre</h1>
        <p className={styles.description}>
          Control exactly what data you share and see how it affects your premium. 
          You can enable or disable any data stream at any time.
        </p>
      </div>

      <div className={styles.summaryBanner}>
        <div className={styles.summaryContent}>
          <div className={styles.summaryText}>
            <h3>Your Privacy, Your Choice</h3>
            <p>Transparent control over your data with clear pricing impact</p>
          </div>
          <div className={styles.summaryStats}>
            <div className={styles.summaryStat}>
              <div className={styles.summaryStatValue}>{activeCount}</div>
              <div className={styles.summaryStatLabel}>Active Consents</div>
            </div>
            <div className={styles.summaryStat}>
              <div className={styles.summaryStatValue}>₹{totalSavings}</div>
              <div className={styles.summaryStatLabel}>Monthly Savings</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.consentList}>
        {consents.map(consent => (
          <div
            key={consent.id}
            className={`${styles.consentCard} ${consent.isActive ? styles.active : styles.inactive}`}
          >
            <div className={styles.consentHeader}>
              <div className={styles.consentInfo}>
                <h3 className={styles.consentName}>
                  <span className={styles.consentIcon}>
                    {consent.id === 'telematics' && '🚗'}
                    {consent.id === 'wearable' && '⌚'}
                    {consent.id === 'iot' && '🏠'}
                  </span>
                  {consent.name}
                </h3>
                <p className={styles.consentPurpose}>{consent.purpose}</p>
                <div className={consent.isActive ? styles.statusActive : styles.statusInactive}>
                  <span className={styles.statusDot}></span>
                  {consent.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className={styles.toggleContainer}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={consent.isActive}
                    onChange={() => handleToggleConsent(consent.id)}
                    aria-label={`Toggle ${consent.name}`}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>

            <div className={styles.consentDetails}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                {consent.description}
              </p>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Data Collected</div>
                  <ul className={styles.dataList}>
                    {consent.dataCollected.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Retention Period</div>
                  <div className={styles.detailValue}>{consent.retention}</div>
                </div>
              </div>

              <div className={styles.impactSection}>
                <div className={styles.impactTitle}>
                  💰 Pricing Impact
                </div>
                <div className={styles.impactComparison}>
                  <div className={styles.impactPrice}>
                    <div className={styles.impactLabel}>With Data Sharing</div>
                    <div className={styles.impactValue}>
                      <span className={styles.impactCurrency}>₹</span>
                      {consent.pricingImpact.withConsent}
                    </div>
                  </div>

                  <div className={styles.impactDifference}>
                    {consent.pricingImpact.withoutConsent > consent.pricingImpact.withConsent ? (
                      <span className={styles.impactSavings}>
                        -₹{consent.pricingImpact.withoutConsent - consent.pricingImpact.withConsent}
                      </span>
                    ) : (
                      <span className={styles.impactIncrease}>
                        +₹{consent.pricingImpact.withConsent - consent.pricingImpact.withoutConsent}
                      </span>
                    )}
                  </div>

                  <div className={styles.impactPrice}>
                    <div className={styles.impactLabel}>Standard Rate</div>
                    <div className={styles.impactValue}>
                      <span className={styles.impactCurrency}>₹</span>
                      {consent.pricingImpact.withoutConsent}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.consentFooter}>
              <span className={styles.lastUpdated}>
                Last updated: {consent.lastUpdated.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <div className={styles.consentActions}>
                <Button variant="ghost" size="sm">
                  View History
                </Button>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card
        title="Your Rights"
        variant="outlined"
        style={{ marginTop: 'var(--space-8)' }}
      >
        <ul style={{ marginBottom: 0 }}>
          <li>You can withdraw consent at any time without penalty</li>
          <li>Standard tariff applies when consent is revoked (no hidden charges)</li>
          <li>Export your data in JSON format anytime</li>
          <li>Request deletion of your behavioral data (aggregate features retained per policy requirements)</li>
          <li>All consent changes are logged and auditable</li>
        </ul>
      </Card>
    </div>
  );
};
