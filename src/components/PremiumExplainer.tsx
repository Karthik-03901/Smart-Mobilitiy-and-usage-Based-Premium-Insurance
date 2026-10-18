'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import styles from './PremiumExplainer.module.css';

interface Factor {
  name: string;
  sliderKey: string;
  unit: string;
  value: string;
  impact: number;
  direction: 'saves' | 'adds';
  currentValue: number;
  improvedValue: number;
  potentialSaving: number;
  maxSlider: number;
}

export const PremiumExplainer: React.FC = () => {
  const { currentPremium, standardPremium } = useApp();
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    speeding: 6, nightDriving: 34, harshBraking: 8, rushHour: 45,
  });

  const basePremium = 1500;

  // Simulation parameters for "How Your Premium Is Calculated"
  const [simVehicle, setSimVehicle] = useState<'hatchback' | 'sedan' | 'suv' | 'ev'>('sedan');
  const [simSpeedCompliance, setSimSpeedCompliance] = useState<number>(85); // 0-100%
  const [simHarshBraking, setSimHarshBraking] = useState<number>(4); // events/100km
  const [simNightDriving, setSimNightDriving] = useState<number>(15); // % of distance
  const [simDistraction, setSimDistraction] = useState<number>(2); // min/hr
  const [simConsents, setSimConsents] = useState<{ telematics: boolean; mobileSensor: boolean; dashcam: boolean }>({
    telematics: true,
    mobileSensor: true,
    dashcam: false,
  });

  const VEHICLE_OPTIONS: Record<'hatchback' | 'sedan' | 'suv' | 'ev', { name: string; base: number; icon: string }> = {
    hatchback: { name: 'Hatchback', base: 1200, icon: '🚗' },
    sedan:     { name: 'Sedan',     base: 1500, icon: '🚙' },
    suv:       { name: 'SUV',       base: 1850, icon: '🚙' },
    ev:        { name: 'EV',        base: 1350, icon: '⚡' },
  };

  const simBase = VEHICLE_OPTIONS[simVehicle].base;

  // Behavior score (0-100)
  const simScore = Math.min(100, Math.max(20, Math.round(
    (simSpeedCompliance * 0.40) +
    ((20 - Math.min(20, simHarshBraking)) / 20 * 30) +
    ((50 - Math.min(50, simNightDriving)) / 50 * 20) +
    ((15 - Math.min(15, simDistraction)) / 15 * 10)
  )));

  // Adjustments in INR
  const speedAdj = Math.round((85 - simSpeedCompliance) * 4); // <85 adds surcharge, >85 saves
  const brakingAdj = Math.round((simHarshBraking - 4) * 25);
  const nightAdj = Math.round((simNightDriving - 15) * 4);
  const distractionAdj = Math.round((simDistraction - 2) * 20);
  const totalBehaviorAdj = speedAdj + brakingAdj + nightAdj + distractionAdj;

  const consentDiscount = (simConsents.telematics ? 180 : 0) +
                          (simConsents.mobileSensor ? 80 : 0) +
                          (simConsents.dashcam ? 120 : 0);

  const simulatedPremium = Math.max(850, Math.round(simBase + totalBehaviorAdj - consentDiscount));
  const benchmarkStandard = Math.round(simBase * 1.45);
  const simSavings = Math.max(0, benchmarkStandard - simulatedPremium);
  const simSavingsPercent = ((simSavings / benchmarkStandard) * 100).toFixed(1);

  const applyPreset = (preset: 'safe' | 'average' | 'risky' | 'reset') => {
    if (preset === 'safe') {
      setSimSpeedCompliance(98);
      setSimHarshBraking(1);
      setSimNightDriving(5);
      setSimDistraction(0);
      setSimConsents({ telematics: true, mobileSensor: true, dashcam: true });
    } else if (preset === 'average') {
      setSimSpeedCompliance(80);
      setSimHarshBraking(5);
      setSimNightDriving(22);
      setSimDistraction(3);
      setSimConsents({ telematics: true, mobileSensor: true, dashcam: false });
    } else if (preset === 'risky') {
      setSimSpeedCompliance(55);
      setSimHarshBraking(12);
      setSimNightDriving(42);
      setSimDistraction(8);
      setSimConsents({ telematics: false, mobileSensor: false, dashcam: false });
    } else {
      setSimVehicle('sedan');
      setSimSpeedCompliance(85);
      setSimHarshBraking(4);
      setSimNightDriving(15);
      setSimDistraction(2);
      setSimConsents({ telematics: true, mobileSensor: true, dashcam: false });
    }
  };

  const getTierInfo = (score: number) => {
    if (score >= 85) return { label: 'Platinum Safe', className: styles.safe, icon: '🏆' };
    if (score >= 70) return { label: 'Gold Responsible', className: styles.safe, icon: '⭐' };
    if (score >= 55) return { label: 'Silver Moderate', className: styles.moderate, icon: '⚡' };
    return { label: 'High Risk Alert', className: styles.risky, icon: '⚠️' };
  };

  const tier = getTierInfo(simScore);

  const factors: Factor[] = [
    { name: 'Speeding',          sliderKey: 'speeding',     unit: '% of time',      value: `${adjustments.speeding}% of driving time`,  impact: adjustments.speeding * 12,      direction: 'adds',  currentValue: 6,  improvedValue: 2,  potentialSaving: 48,   maxSlider: 100 },
    { name: 'Night Driving',     sliderKey: 'nightDriving', unit: '% of distance',  value: `${adjustments.nightDriving}% of distance`,  impact: adjustments.nightDriving * 2.5, direction: 'adds',  currentValue: 34, improvedValue: 15, potentialSaving: 47.5, maxSlider: 100 },
    { name: 'Harsh Braking',     sliderKey: 'harshBraking', unit: 'per 100 km',     value: `${adjustments.harshBraking} per 100 km`,    impact: adjustments.harshBraking * 8,   direction: 'adds',  currentValue: 8,  improvedValue: 3,  potentialSaving: 40,   maxSlider: 20  },
    { name: 'Rush Hour Exposure',sliderKey: 'rushHour',     unit: '% of trips',     value: `${adjustments.rushHour}% of trips`,         impact: adjustments.rushHour * 0.5,     direction: 'saves', currentValue: 45, improvedValue: 60, potentialSaving: 7.5,  maxSlider: 100 },
  ];

  const calculatedPremium = basePremium + factors.reduce(
    (sum, f) => sum + (f.direction === 'adds' ? f.impact : -f.impact), 0
  );
  const savingsPercent = (((standardPremium - calculatedPremium) / standardPremium) * 100).toFixed(1);

  const handleAdjustment = (key: string, value: number) =>
    setAdjustments(prev => ({ ...prev, [key]: Math.max(0, value) }));

  const getSavingForDelta = (factor: Factor, sliderVal: number): number => {
    const range = Math.abs(factor.currentValue - factor.improvedValue);
    if (range === 0) return 0;
    const rate = factor.potentialSaving / range;
    const delta = factor.currentValue - sliderVal;
    return Math.round(delta * rate);
  };

  return (
    <div className={styles.explainer}>
      <div className={styles.premiumCard}>
        <div className={styles.premiumHeader}>
          <div>
            <h2 className={styles.premiumTitle}>Your Monthly Premium</h2>
            <p className={styles.premiumSubtitle}>Based on your driving behavior</p>
          </div>
          <Button variant={whatIfMode ? 'primary' : 'outline'} size="sm" onClick={() => setWhatIfMode(m => !m)}>
            {whatIfMode ? 'Exit' : 'What-If'} Mode
          </Button>
        </div>

        <div className={styles.premiumDisplay}>
          <div className={styles.premiumMain}>
            <span className={styles.currency}>₹</span>
            <span className={styles.amount}>{currentPremium.toLocaleString('en-IN')}</span>
            <span className={styles.period}>/month</span>
          </div>
          <div className={styles.premiumComparison}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Standard rate</span>
              <span className={styles.comparisonValue}>₹{standardPremium}</span>
            </div>
            <div className={styles.comparisonDivider} />
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>You save</span>
              <span className={`${styles.comparisonValue} ${styles.savings}`}>
                ₹{standardPremium - currentPremium} ({(((standardPremium - currentPremium) / standardPremium) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        <div className={styles.premiumBreakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Base Premium</span>
            <span className={styles.breakdownValue}>₹{basePremium}</span>
          </div>
          {factors.map(f => (
            <div key={f.name} className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>
                {f.name}
                <span className={styles.breakdownDetail}> — {f.value}</span>
              </span>
              <span className={`${styles.breakdownValue} ${f.direction === 'saves' ? styles.positive : styles.negative}`}>
                {f.direction === 'saves' ? '-' : '+'}₹{Math.abs(Math.round(f.impact))}
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
          <h3 className={styles.whatIfTitle}>🔮 What-If Simulator</h3>
          <p className={styles.whatIfDescription}>Adjust your driving behaviors to see how they would affect your premium</p>
          <div className={styles.whatIfControls}>
            {factors.map(factor => {
              const sliderVal = adjustments[factor.sliderKey] ?? factor.currentValue;
              const saving    = getSavingForDelta(factor, sliderVal);
              return (
                <div key={factor.name} className={styles.whatIfControl}>
                  <div className={styles.whatIfControlHeader}>
                    <label className={styles.whatIfLabel}>{factor.name}</label>
                    <span className={styles.whatIfValue}>{sliderVal} {factor.unit}</span>
                  </div>
                  <input type="range" min="0" max={factor.maxSlider} value={sliderVal}
                    onChange={e => handleAdjustment(factor.sliderKey, Number(e.target.value))}
                    className={styles.whatIfSlider} />
                  <div className={styles.whatIfMeta}>
                    <span className={styles.whatIfCurrent}>Current: {factor.currentValue} {factor.unit}</span>
                    <span className={styles.whatIfTarget}>Target: {factor.improvedValue} {factor.unit}</span>
                  </div>
                  <div className={styles.whatIfImpact}>
                    {saving > 0 && <span className={styles.impactPositive}>Could save ₹{saving}/mo</span>}
                    {saving < 0 && <span className={styles.impactNegative}>Would add ₹{Math.abs(saving)}/mo</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card title="💡 Improvement Tips" variant="outlined">
        <div className={styles.tipsList}>
          {[
            { icon: '🚦', title: 'Reduce Speeding',   desc: 'Reducing speeding from 6% to 2% could save approximately ₹48/month', saving: '₹48/month' },
            { icon: '🌙', title: 'Shift Night Trips',  desc: 'Moving 20% of night trips to daytime could reduce your premium by ₹47.5/month', saving: '₹47.5/month' },
            { icon: '🛑', title: 'Gentle Braking',     desc: 'Reducing harsh braking from 8 to 3 per 100km saves ₹40/month', saving: '₹40/month' },
          ].map(tip => (
            <div key={tip.title} className={styles.tip}>
              <div className={styles.tipIcon}>{tip.icon}</div>
              <div className={styles.tipContent}>
                <h4 className={styles.tipTitle}>{tip.title}</h4>
                <p className={styles.tipDescription}>{tip.desc}</p>
                <div className={styles.tipImpact}>
                  <span className={styles.tipImpactLabel}>Potential savings:</span>
                  <span className={styles.tipImpactValue}>{tip.saving}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.explanationSummary}>
        {/* Top Header & Presets Bar */}
        <div className={styles.simTopBar}>
          <div className={styles.simBadge}>
            <span className={styles.simBadgeDot}>⚡</span> Live Actuarial Simulator
          </div>
          <div className={styles.presetsBar}>
            <span className={styles.presetLabel}>Scenarios:</span>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset('safe')}>⭐ Safe Driver</button>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset('average')}>🚗 Everyday</button>
            <button type="button" className={styles.presetBtn} onClick={() => applyPreset('risky')}>⚡ High Risk</button>
            <button type="button" className={`${styles.presetBtn} ${styles.presetResetBtn}`} onClick={() => applyPreset('reset')}>🔄 Reset</button>
          </div>
        </div>

        <div className={styles.simHeader}>
          <h3 className={styles.summaryTitle}>How Your Premium Is Calculated</h3>
          <p className={styles.summaryText}>
            Your premium starts with a base of <strong>₹{simBase.toLocaleString('en-IN')}</strong> determined by your vehicle and coverage tier.
            We then adjust it based on your actual driving behavior. Safe drivers benefit from lower premiums,
            while riskier patterns increase cost to reflect higher claim probability.
          </p>
        </div>

        {/* Live Equation Bar */}
        <div className={styles.formulaBar}>
          <div className={styles.formulaToken}>
            <span className={styles.formulaTokenLabel}>Base Policy</span>
            <strong className={styles.formulaTokenVal}>₹{simBase.toLocaleString('en-IN')}</strong>
          </div>

          <span className={styles.formulaOp}>+</span>

          <div className={styles.formulaToken}>
            <span className={styles.formulaTokenLabel}>Behavior Impact</span>
            <strong
              className={styles.formulaTokenVal}
              style={{ color: totalBehaviorAdj <= 0 ? '#10b981' : '#ef4444' }}
            >
              {totalBehaviorAdj > 0 ? `+₹${totalBehaviorAdj}` : `-₹${Math.abs(totalBehaviorAdj)}`}
            </strong>
          </div>

          <span className={styles.formulaOp}>−</span>

          <div className={styles.formulaToken}>
            <span className={styles.formulaTokenLabel}>Privacy Rebates</span>
            <strong className={styles.formulaTokenVal} style={{ color: '#10b981' }}>
              −₹{consentDiscount}
            </strong>
          </div>

          <span className={styles.formulaOp}>=</span>

          <div className={styles.formulaResultBox}>
            <span className={styles.formulaResultLabel}>Net Premium</span>
            <strong className={styles.formulaResultVal}>
              ₹{simulatedPremium.toLocaleString('en-IN')}<span className={styles.formulaResultPer}>/mo</span>
            </strong>
          </div>
        </div>

        {/* Two-Column Simulation Workspace */}
        <div className={styles.simGrid}>
          {/* Left Controls */}
          <div className={styles.simControls}>
            {/* 1. Vehicle Selection */}
            <div className={styles.controlGroup}>
              <div className={styles.controlGroupTitle}>
                <span className={styles.controlGroupIcon}>🚘</span>
                <span>Vehicle Class &amp; Coverage Tier</span>
              </div>
              <div className={styles.vehiclePills}>
                {(Object.keys(VEHICLE_OPTIONS) as Array<keyof typeof VEHICLE_OPTIONS>).map((vKey) => {
                  const v = VEHICLE_OPTIONS[vKey];
                  const isActive = simVehicle === vKey;
                  return (
                    <button
                      key={vKey}
                      type="button"
                      className={`${styles.vehiclePill} ${isActive ? styles.vehiclePillActive : ''}`}
                      onClick={() => setSimVehicle(vKey)}
                    >
                      <span className={styles.vehiclePillIcon}>{v.icon}</span>
                      <span className={styles.vehiclePillName}>{v.name}</span>
                      <span className={styles.vehiclePillPrice}>₹{v.base.toLocaleString('en-IN')}/mo</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Telematics Behavioral Inputs */}
            <div className={styles.controlGroup}>
              <div className={styles.controlGroupTitle}>
                <span className={styles.controlGroupIcon}>📊</span>
                <span>Behavioral Telematics Factors</span>
              </div>

              {/* Speeding Compliance */}
              <div className={styles.simSliderItem}>
                <div className={styles.simSliderHeader}>
                  <div className={styles.simSliderTitleWrap}>
                    <span className={styles.simSliderIcon}>🏎️</span>
                    <span className={styles.simSliderLabel}>Speed Compliance</span>
                  </div>
                  <div className={styles.simSliderRightMeta}>
                    <span className={`${styles.simSliderImpactBadge} ${speedAdj <= 0 ? styles.impactBadgeSave : styles.impactBadgeSurcharge}`}>
                      {speedAdj <= 0 ? `Saves ₹${Math.abs(speedAdj)}/mo` : `Adds +₹${speedAdj}/mo`}
                    </span>
                    <span className={styles.simSliderVal}>{simSpeedCompliance}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={simSpeedCompliance}
                  onChange={(e) => setSimSpeedCompliance(Number(e.target.value))}
                  className={styles.simSlider}
                />
                <div className={styles.simSliderScaleMarks}>
                  <span>40% (High Surcharge)</span>
                  <span>Benchmark: 85%</span>
                  <span>100% (Max Safe)</span>
                </div>
              </div>

              {/* Harsh Braking */}
              <div className={styles.simSliderItem}>
                <div className={styles.simSliderHeader}>
                  <div className={styles.simSliderTitleWrap}>
                    <span className={styles.simSliderIcon}>🛑</span>
                    <span className={styles.simSliderLabel}>Harsh Braking Events</span>
                  </div>
                  <div className={styles.simSliderRightMeta}>
                    <span className={`${styles.simSliderImpactBadge} ${brakingAdj <= 0 ? styles.impactBadgeSave : styles.impactBadgeSurcharge}`}>
                      {brakingAdj <= 0 ? `Saves ₹${Math.abs(brakingAdj)}/mo` : `Adds +₹${brakingAdj}/mo`}
                    </span>
                    <span className={styles.simSliderVal}>{simHarshBraking} / 100km</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simHarshBraking}
                  onChange={(e) => setSimHarshBraking(Number(e.target.value))}
                  className={styles.simSlider}
                />
                <div className={styles.simSliderScaleMarks}>
                  <span>0 (Smooth)</span>
                  <span>Benchmark: 4 / 100km</span>
                  <span>15+ (Aggressive)</span>
                </div>
              </div>

              {/* Night Driving */}
              <div className={styles.simSliderItem}>
                <div className={styles.simSliderHeader}>
                  <div className={styles.simSliderTitleWrap}>
                    <span className={styles.simSliderIcon}>🌙</span>
                    <span className={styles.simSliderLabel}>Late Night Trips (11 PM - 5 AM)</span>
                  </div>
                  <div className={styles.simSliderRightMeta}>
                    <span className={`${styles.simSliderImpactBadge} ${nightAdj <= 0 ? styles.impactBadgeSave : styles.impactBadgeSurcharge}`}>
                      {nightAdj <= 0 ? `Saves ₹${Math.abs(nightAdj)}/mo` : `Adds +₹${nightAdj}/mo`}
                    </span>
                    <span className={styles.simSliderVal}>{simNightDriving}% distance</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={simNightDriving}
                  onChange={(e) => setSimNightDriving(Number(e.target.value))}
                  className={styles.simSlider}
                />
                <div className={styles.simSliderScaleMarks}>
                  <span>0% (Day only)</span>
                  <span>Benchmark: 15%</span>
                  <span>50% (High Exposure)</span>
                </div>
              </div>

              {/* Phone Distraction */}
              <div className={styles.simSliderItem}>
                <div className={styles.simSliderHeader}>
                  <div className={styles.simSliderTitleWrap}>
                    <span className={styles.simSliderIcon}>📱</span>
                    <span className={styles.simSliderLabel}>Mobile Distraction</span>
                  </div>
                  <div className={styles.simSliderRightMeta}>
                    <span className={`${styles.simSliderImpactBadge} ${distractionAdj <= 0 ? styles.impactBadgeSave : styles.impactBadgeSurcharge}`}>
                      {distractionAdj <= 0 ? `Saves ₹${Math.abs(distractionAdj)}/mo` : `Adds +₹${distractionAdj}/mo`}
                    </span>
                    <span className={styles.simSliderVal}>{simDistraction} min/hr</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simDistraction}
                  onChange={(e) => setSimDistraction(Number(e.target.value))}
                  className={styles.simSlider}
                />
                <div className={styles.simSliderScaleMarks}>
                  <span>0 min (Hands-free)</span>
                  <span>Benchmark: 2 min</span>
                  <span>10 min (Heavy use)</span>
                </div>
              </div>
            </div>

            {/* 3. Consent & Privacy Streams */}
            <div className={styles.controlGroup}>
              <div className={styles.controlGroupTitle}>
                <span className={styles.controlGroupIcon}>🔐</span>
                <span>Consented Telemetry Rebates</span>
              </div>
              <div className={styles.simConsentsGrid}>
                <div
                  className={`${styles.simConsentRow} ${simConsents.telematics ? styles.simConsentRowActive : ''}`}
                  onClick={() => setSimConsents(p => ({ ...p, telematics: !p.telematics }))}
                >
                  <div className={styles.simConsentInfo}>
                    <input
                      type="checkbox"
                      checked={simConsents.telematics}
                      onChange={() => {}}
                      className={styles.simCheckbox}
                    />
                    <div className={styles.simConsentIconBox}>🚗</div>
                    <div className={styles.simConsentTextWrap}>
                      <span className={styles.simConsentName}>Vehicle GPS &amp; Speed Stream</span>
                      <span className={styles.simConsentSub}>Precision mileage &amp; compliance verification</span>
                    </div>
                  </div>
                  <span className={styles.simConsentBadge}>−₹180 / mo rebate</span>
                </div>

                <div
                  className={`${styles.simConsentRow} ${simConsents.mobileSensor ? styles.simConsentRowActive : ''}`}
                  onClick={() => setSimConsents(p => ({ ...p, mobileSensor: !p.mobileSensor }))}
                >
                  <div className={styles.simConsentInfo}>
                    <input
                      type="checkbox"
                      checked={simConsents.mobileSensor}
                      onChange={() => {}}
                      className={styles.simCheckbox}
                    />
                    <div className={styles.simConsentIconBox}>📲</div>
                    <div className={styles.simConsentTextWrap}>
                      <span className={styles.simConsentName}>Mobile Gyro &amp; Acceleration</span>
                      <span className={styles.simConsentSub}>G-force event analysis &amp; distraction tracking</span>
                    </div>
                  </div>
                  <span className={styles.simConsentBadge}>−₹80 / mo rebate</span>
                </div>

                <div
                  className={`${styles.simConsentRow} ${simConsents.dashcam ? styles.simConsentRowActive : ''}`}
                  onClick={() => setSimConsents(p => ({ ...p, dashcam: !p.dashcam }))}
                >
                  <div className={styles.simConsentInfo}>
                    <input
                      type="checkbox"
                      checked={simConsents.dashcam}
                      onChange={() => {}}
                      className={styles.simCheckbox}
                    />
                    <div className={styles.simConsentIconBox}>🎥</div>
                    <div className={styles.simConsentTextWrap}>
                      <span className={styles.simConsentName}>Dashcam Verified Driving</span>
                      <span className={styles.simConsentSub}>Opt-in visual validation for zero-fraud assurance</span>
                    </div>
                  </div>
                  <span className={styles.simConsentBadge}>−₹120 / mo rebate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Actuarial Result */}
          <div className={styles.simOutputCard}>
            <div className={styles.simScoreHeader}>
              <div>
                <div className={styles.scoreSubTitle}>ACTUARIAL BEHAVIOR SCORE</div>
                <div className={styles.scoreBigValue}>
                  {simScore}<span className={styles.scoreMax}>/100</span>
                </div>
              </div>
              <div className={`${styles.simScoreBadge} ${tier.className}`}>
                <span className={styles.tierIcon}>{tier.icon}</span>
                <span className={styles.tierLabel}>{tier.label}</span>
              </div>
            </div>

            <div className={styles.simPriceCard}>
              <div className={styles.simPriceLabel}>Simulated Monthly Premium</div>
              <div className={styles.simPriceRow}>
                <span className={styles.simPriceCurrency}>₹</span>
                <span className={styles.simPriceNumber}>{simulatedPremium.toLocaleString('en-IN')}</span>
                <span className={styles.simPricePer}>/mo</span>
              </div>
              <div className={styles.simPriceSub}>
                Billed monthly • Dynamically adjusted on 30-day driving cycle
              </div>
            </div>

            <div className={styles.simSavingsBanner}>
              <div className={styles.simSavingsText}>
                <div className={styles.simSavingsTitle}>Compared to Traditional Rate (₹{benchmarkStandard.toLocaleString('en-IN')})</div>
                <div className={styles.simSavingsSub}>No telematics sharing</div>
              </div>
              <div className={styles.simSavingsVal}>
                Save ₹{simSavings.toLocaleString('en-IN')} <span className={styles.simSavingsPercent}>({simSavingsPercent}%)</span>
              </div>
            </div>

            <div className={styles.simBreakdownList}>
              <div className={styles.simBreakdownRow}>
                <span className={styles.breakdownLabel}>Base Policy ({VEHICLE_OPTIONS[simVehicle].name})</span>
                <span className={styles.breakdownVal}>₹{simBase.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.simBreakdownRow}>
                <span className={styles.breakdownLabel}>Behavior Adjustment</span>
                <span
                  className={styles.breakdownVal}
                  style={{ color: totalBehaviorAdj <= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}
                >
                  {totalBehaviorAdj > 0 ? `+₹${totalBehaviorAdj}` : `-₹${Math.abs(totalBehaviorAdj)}`}
                </span>
              </div>
              <div className={styles.simBreakdownRow}>
                <span className={styles.breakdownLabel}>Consented Privacy Rebates</span>
                <span className={styles.breakdownVal} style={{ color: '#10b981', fontWeight: 700 }}>
                  −₹{consentDiscount}
                </span>
              </div>
              <div className={`${styles.simBreakdownRow} ${styles.simBreakdownTotal}`}>
                <span className={styles.breakdownTotalLabel}>Net Simulated Premium</span>
                <span className={styles.breakdownTotalVal}>
                  ₹{simulatedPremium.toLocaleString('en-IN')} <span className={styles.breakdownTotalPer}>/ mo</span>
                </span>
              </div>
            </div>

            <div className={styles.simActuarialNote}>
              <span className={styles.noteIcon}>💡</span>
              <p className={styles.noteText}>
                <strong>How it works in production:</strong> Under DriveFair&apos;s transparent pricing framework, your base premium is determined on day 1. At the end of every 30-day billing cycle, your telematics telemetry scores are averaged to apply discounts or surcharges, guaranteeing that good driving translates directly into real rupee savings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
