'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import styles from './PremiumExplainer.module.css';

interface Factor {
  name: string;
  value: string;
  impact: number;
  direction: 'saves' | 'adds';
  currentValue: number;
  improvedValue: number;
  potentialSaving: number;
}

export const PremiumExplainer: React.FC = () => {
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    speeding: 6,
    nightDriving: 34,
    harshBraking: 8,
    rushHour: 45,
  });

  const currentPremium = 1840;
  const standardPremium = 2100;
  const basePremium = 1500;

  const factors: Factor[] = [
    {
      name: 'Speeding',
      value: `${adjustments.speeding}% of driving time`,
      impact: adjustments.speeding * 12,
      direction: 'adds',
      currentValue: 6,
      improvedValue: 2,
      potentialSaving: 48,
    },
    {
      name: 'Night Driving',
      value: `${adjustments.nightDriving}% of distance`,
      impact: adjustments.nightDriving * 2.5,
      direction: 'adds',
      currentValue: 34,
      improvedValue: 15,
      potentialSaving: 47.5,
    },
    {
      name: 'Harsh Braking',
      value: `${adjustments.harshBraking} per 100 km`,
      impact: adjustments.harshBraking * 8,
      direction: 'adds',
      currentValue: 8,
      improvedValue: 3,
      potentialSaving: 40,
    },
    {
      name: 'Rush Hour Exposure',
      value: `${adjustments.rushHour}% of trips`,
      impact: -adjustments.rushHour * 0.5,
      direction: 'saves',
      currentValue: 45,
      improvedValue: 60,
      potentialSaving: 7.5,
    },
  ];

  const calculatedPremium = basePremium + factors.reduce((sum, f) => 
    sum + (f.direction === 'adds' ? f.impact : -f.impact), 0
  );

  const totalSavings = standardPremium - calculatedPremium;
  const savingsPercent = ((totalSavings / standardPremium) * 100).toFixed(1);

  const handleAdjustment = (key: string, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value)),
    }));
  };

  return (
    <div className={styles.explainer}>
      <div className={styles.premiumCard}>
        <div className={styles.premiumHeader}>
          <div>
            <h2 className={styles.premiumTitle}>Your Monthly Premium</h2>
            <p className={styles.premiumSubtitle}>Based on your driving behavior</p>
          </div>
          <Button
            variant={whatIfMode ? 'primary' : 'outline'}
            onClick={() => setWhatIfMode(!whatIfMode)}
            size="sm"
          >
            {whatIfMode ? 'Exit' : 'What-If'} Mode
          </Button>
        </div>

        <div className={styles.premiumDisplay}>
          <div className={styles.premiumMain}>
            <span className={styles.currency}>₹</span>
            <span className={styles.amount}>{Math.round(calculatedPremium)}</span>
            <span className={styles.period}>/month</span>
          </div>
          <div className={styles.premiumComparison}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Standard rate</span>
              <span className={styles.comparisonValue}>₹{standardPremium}</span>
            </div>
            <div className={styles.comparisonDivider}></div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>You save</span>
              <span className={`${styles.comparisonValue} ${styles.savings}`}>
                ₹{Math.round(totalSavings)} ({savingsPercent}%)
              </span>
            </div>
          </div>
        </div>

        <div className={styles.premiumBreakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Base Premium</span>
            <span className={styles.breakdownValue}>₹{basePremium}</span>
          </div>
          {factors.map(factor => (
            <div key={factor.name} className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>
                {factor.name}
                <span className={styles.breakdownDetail}>{factor.value}</span>
              </span>
              <span className={`${styles.breakdownValue} ${factor.direction === 'saves' ? styles.positive : styles.negative}`}>
                {factor.direction === 'saves' ? '-' : '+'}₹{Math.abs(Math.round(factor.impact))}
              </span>
            </div>
          ))}
          <div className={`${styles.breakdownItem} ${styles.total}`}>
            <span className={styles.breakdownLabel}>Total Monthly Premium</span>
            <span className={styles.breakdownValue}>₹{Math.round(calculatedPremium)}</span>
          </div>
        </div>
      </div>

      {whatIfMode && (
        <div className={styles.whatIfSection}>
          <h3 className={styles.whatIfTitle}>
            🔮 What-If Simulator
          </h3>
          <p className={styles.whatIfDescription}>
            Adjust your driving behaviors to see how they would affect your premium
          </p>

          <div className={styles.whatIfControls}>
            {factors.map(factor => {
              const key = factor.name.toLowerCase().replace(/\s+/g, '');
              const sliderKey = key === 'rushhourexposure' ? 'rushHour' : 
                               key === 'harshbraking' ? 'harshBraking' :
                               key === 'nightdriving' ? 'nightDriving' : 'speeding';

              return (
                <div key={factor.name} className={styles.whatIfControl}>
                  <div className={styles.whatIfControlHeader}>
                    <label className={styles.whatIfLabel}>{factor.name}</label>
                    <span className={styles.whatIfValue}>
                      {adjustments[sliderKey]}
                      {sliderKey === 'harshBraking' ? ' per 100km' : '%'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={sliderKey === 'harshBraking' ? '20' : '100'}
                    value={adjustments[sliderKey]}
                    onChange={(e) => handleAdjustment(sliderKey, Number(e.target.value))}
                    className={styles.whatIfSlider}
                  />

                  <div className={styles.whatIfMeta}>
                    <span className={styles.whatIfCurrent}>
                      Current: {factor.currentValue}{sliderKey === 'harshBraking' ? '/100km' : '%'}
                    </span>
                    <span className={styles.whatIfTarget}>
                      Target: {factor.improvedValue}{sliderKey === 'harshBraking' ? '/100km' : '%'}
                    </span>
                  </div>

                  <div className={styles.whatIfImpact}>
                    {adjustments[sliderKey] < factor.currentValue && (
                      <span className={styles.impactPositive}>
                        Could save ₹{Math.round((factor.currentValue - adjustments[sliderKey]) * (factor.impact / factor.currentValue))}
                      </span>
                    )}
                    {adjustments[sliderKey] > factor.currentValue && (
                      <span className={styles.impactNegative}>
                        Would add ₹{Math.round((adjustments[sliderKey] - factor.currentValue) * (factor.impact / factor.currentValue))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card title="💡 Improvement Tips" variant="outlined">
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>🚦</div>
            <div className={styles.tipContent}>
              <h4 className={styles.tipTitle}>Reduce Speeding</h4>
              <p className={styles.tipDescription}>
                Reducing speeding from 6% to 2% could save you approximately ₹48/month
              </p>
              <div className={styles.tipImpact}>
                <span className={styles.tipImpactLabel}>Potential savings:</span>
                <span className={styles.tipImpactValue}>₹48/month</span>
              </div>
            </div>
          </div>

          <div className={styles.tip}>
            <div className={styles.tipIcon}>🌙</div>
            <div className={styles.tipContent}>
              <h4 className={styles.tipTitle}>Shift Night Trips</h4>
              <p className={styles.tipDescription}>
                Moving 20% of night trips to daytime hours could reduce your premium by ₹47.5/month
              </p>
              <div className={styles.tipImpact}>
                <span className={styles.tipImpactLabel}>Potential savings:</span>
                <span className={styles.tipImpactValue}>₹47.5/month</span>
              </div>
            </div>
          </div>

          <div className={styles.tip}>
            <div className={styles.tipIcon}>🛑</div>
            <div className={styles.tipContent}>
              <h4 className={styles.tipTitle}>Gentle Braking</h4>
              <p className={styles.tipDescription}>
                Reducing harsh braking events from 8 to 3 per 100km saves ₹40/month
              </p>
              <div className={styles.tipImpact}>
                <span className={styles.tipImpactLabel}>Potential savings:</span>
                <span className={styles.tipImpactValue}>₹40/month</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.explanationSummary}>
        <h3 className={styles.summaryTitle}>How Your Premium Is Calculated</h3>
        <p className={styles.summaryText}>
          Your premium starts with a base amount of ₹{basePremium} determined by your vehicle 
          and coverage. We then adjust this based on your actual driving behavior. Safe drivers 
          like you benefit from lower premiums, while those with riskier patterns pay more to 
          reflect their higher claim probability. You're currently saving {savingsPercent}% 
          compared to customers who don't share their driving data.
        </p>
      </div>
    </div>
  );
};
