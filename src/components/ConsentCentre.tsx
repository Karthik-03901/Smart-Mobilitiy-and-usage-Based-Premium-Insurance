'use client';

import React from 'react';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import type { ConsentStream } from '../context/AppContext';
import styles from './ConsentCentre.module.css';

export const ConsentCentre: React.FC = () => {
  const { consents, toggleConsent, showToast } = useApp();

  const handleToggle = (c: ConsentStream) => {
    toggleConsent(c.id);
    const next = !c.isActive;
    showToast(
      next ? `${c.name} enabled - premium updated.` : `${c.name} disabled - standard rate applies.`,
      next ? 'success' : 'info'
    );
  };

  const handleExport = (c: ConsentStream) => {
    const blob = new Blob([JSON.stringify({ ...c, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `drivefair-${c.id}-consent.json`; a.click();
    URL.revokeObjectURL(url);
    showToast(`${c.name} data exported.`, 'success');
  };

  const activeCount  = consents.filter(c => c.isActive).length;
  const totalSavings = consents.filter(c => c.isActive)
    .reduce((s, c) => s + (c.pricingImpact.withoutConsent - c.pricingImpact.withConsent), 0);

  return (
    <div className={styles.page}>
      {/* ---- Page header ---- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Data Consent Centre</h1>
          <p className={styles.subtitle}>
            Control exactly what data you share and how it affects your premium.
            You can enable or disable any data stream at any time.
          </p>
        </div>
      </div>

      {/* ---- Summary banner ---- */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerIcon}>&#9632;</div>
          <div>
            <div className={styles.bannerTitle}>Your Privacy, Your Choice</div>
            <div className={styles.bannerSub}>Transparent control over your data with clear pricing impact</div>
          </div>
        </div>
        <div className={styles.bannerStats}>
          <div className={styles.bannerStat}>
            <div className={styles.bannerStatNum}>{activeCount}</div>
            <div className={styles.bannerStatLabel}>Active Consents</div>
          </div>
          <div className={styles.bannerDivider} />
          <div className={styles.bannerStat}>
            <div className={styles.bannerStatNum}>&#8377;{totalSavings.toLocaleString('en-IN')}</div>
            <div className={styles.bannerStatLabel}>Monthly Savings</div>
          </div>
        </div>
      </div>

      {/* ---- Consent cards ---- */}
      <div className={styles.cards}>
        {consents.map(consent => (
          <div key={consent.id} className={`${styles.card} ${consent.isActive ? styles.cardActive : ''}`}>
            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardIconWrap}>
                  <span className={styles.cardEmoji}>{consent.icon}</span>
                </div>
                <div>
                  <h2 className={styles.cardName}>{consent.name}</h2>
                  <p className={styles.cardPurpose}>{consent.purpose}</p>
                </div>
              </div>
              <div className={styles.cardHeaderRight}>
                <span className={`${styles.statusBadge} ${consent.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {consent.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={`${styles.toggle} ${consent.isActive ? styles.toggleOn : ''}`}
                  onClick={() => handleToggle(consent)}
                  role="switch"
                  aria-checked={consent.isActive}
                  aria-label={`Toggle ${consent.name}`}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: consent.isActive ? '100%' : '0%' }} />
            </div>

            {/* Description */}
            <p className={styles.cardDesc}>{consent.description}</p>

            {/* Data details */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>DATA COLLECTED</div>
                <ul className={styles.detailList}>
                  {consent.dataCollected.map(d => (
                    <li key={d} className={styles.detailItem}>
                      <span className={styles.detailBullet} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>RETENTION PERIOD</div>
                <p className={styles.retentionText}>{consent.retention}</p>
              </div>
            </div>

            {/* Pricing impact */}
            <div className={styles.pricingBox}>
              <div className={styles.pricingTitle}>&#9733; Pricing Impact</div>
              <div className={styles.pricingGrid}>
                <div className={styles.pricingItem}>
                  <div className={styles.pricingItemLabel}>With Data Sharing</div>
                  <div className={styles.pricingItemVal}>
                    &#8377;{consent.pricingImpact.withConsent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className={styles.pricingSavings}>
                  <div className={styles.pricingSavingsNum}>
                    -{'\u20B9'}{(consent.pricingImpact.withoutConsent - consent.pricingImpact.withConsent).toLocaleString('en-IN')}
                  </div>
                  <div className={styles.pricingSavingsLabel}>Savings</div>
                </div>
                <div className={styles.pricingItem}>
                  <div className={styles.pricingItemLabel}>Standard Rate</div>
                  <div className={styles.pricingItemVal}>
                    &#8377;{consent.pricingImpact.withoutConsent.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.cardFooter}>
              <span className={styles.lastUpdated}>
                Last updated: {consent.lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <div className={styles.cardActions}>
                <Button variant="ghost" size="sm" onClick={() => showToast(`Consent history for "${consent.name}" is not available in Phase 1 demo.`, 'info')}>
                  View History
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport(consent)}>
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
