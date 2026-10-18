'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { TripDetailSimulator } from './TripDetailSimulator';
import { useApp } from '../context/AppContext';
import styles from './CustomerDashboard.module.css';

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    prev.current = 0;
    setValue(0);
    if (target === 0) return;

    const totalFrames = Math.round(duration / 16);
    let frame = 0;

    const raf = () => {
      frame++;
      // ease-out cubic
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      const next = Math.round(progress * target);
      setValue(next);
      if (frame < totalFrames) requestAnimationFrame(raf);
    };

    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);

  return value;
}

// ─── Animated SVG ring ────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false);
  const circumference = 2 * Math.PI * 45; // ≈ 282.7

  useEffect(() => {
    // small delay so the transition is visible on mount
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const dashOffset = mounted
    ? circumference - (score / 100) * circumference
    : circumference;

  return (
    <div className={styles.scoreCircle}>
      <svg viewBox="0 0 100 100" className={styles.scoreCircleSvg}>
        {/* Track */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="var(--color-neutral-200)"
          strokeWidth="8"
        />
        {/* Animated fill */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="var(--color-success-600)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CustomerDashboard: React.FC = () => {
  const { navigateTo, recentTrips, currentPremium, standardPremium, riskScore, showToast, currentUser } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Clock — kept separate from chart to avoid re-seeding bars
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ FIX: Seed bar heights ONCE with useMemo — never changes on re-render
  const chartBars = useMemo(
    () => Array.from({ length: 30 }, () => Math.random() * 100),
    []
  );

  // Animated numbers
  const animatedPremium = useCountUp(currentPremium);
  const animatedScore = useCountUp(riskScore);
  const animatedDistance = useCountUp(234);
  const animatedSavings = useCountUp(standardPremium - currentPremium);

  const totalTrips = recentTrips.length + 25; // include older trips
  const savingsPercent = ((standardPremium - currentPremium) / standardPremium * 100).toFixed(1);

  const getRiskColor = (score: number) => {
    if (score >= 80) return styles.excellent;
    if (score >= 60) return styles.good;
    if (score >= 40) return styles.fair;
    return styles.poor;
  };

  // Export trip history as JSON
  const handleExportData = () => {
    const data = recentTrips.map(t => ({
      date: t.date.toISOString(),
      distance: t.distance,
      duration: t.duration,
      score: t.score,
      impact: t.impact,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivefair-trip-history.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Trip history exported successfully.', 'success');
  };

  const displayName = currentUser?.driverName ? currentUser.driverName.split(' ')[0] : 'Driver';

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {displayName}</h1>
          <p className={styles.subtitle}>
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
            {' • '}
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {/* ✅ FIX: wired to navigate to Trip Simulator */}
        <Button id="btn-start-trip" variant="primary" onClick={() => navigateTo('simulator')}>
          Start New Trip
        </Button>
      </div>

      {/* Consent Status Banner */}
      <div className={styles.consentBanner}>
        <div className={styles.consentIcon}>🔒</div>
        <div className={styles.consentContent}>
          <h3>Data Sharing Active</h3>
          <p>You're currently sharing driving data to get personalized pricing</p>
        </div>
        {/* ✅ FIX: wired to navigate to Consent Centre */}
        <Button id="btn-manage-consent" variant="ghost" size="sm" onClick={() => navigateTo('consent')}>
          Manage Consent
        </Button>
      </div>

      {/* Key Metrics Grid — staggered entry */}
      <div className={styles.metricsGrid}>

        <Card className={`${styles.metricCard} ${styles.staggerIn}`} style={{ animationDelay: '0ms' }} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Current Premium</span>
            <span className={styles.metricTrend}>↓ {savingsPercent}%</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.currency}>₹</span>
            {/* ✅ FIX: count-up animation */}
            <span className={styles.amount}>{animatedPremium.toLocaleString('en-IN')}</span>
            <span className={styles.period}>/mo</span>
          </div>
          <div className={styles.metricComparison}>vs ₹{standardPremium.toLocaleString('en-IN')} standard rate</div>
          <div className={styles.metricBar}>
            <div
              className={`${styles.metricBarFill} ${styles.savings}`}
              style={{ width: `${(currentPremium / standardPremium) * 100}%` }}
            />
          </div>
        </Card>

        <Card className={`${styles.metricCard} ${styles.staggerIn}`} style={{ animationDelay: '80ms' }} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Risk Score</span>
            <span className={`${styles.badge} ${getRiskColor(riskScore)}`}>
              {riskScore >= 80 ? 'Excellent' : riskScore >= 60 ? 'Good' : 'Fair'}
            </span>
          </div>
          <div className={styles.metricValue}>
            {/* ✅ FIX: count-up animation */}
            <span className={styles.scoreValue}>{animatedScore}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <div className={styles.metricComparison}>Better than 68% of drivers</div>
          {/* ✅ FIX: animated SVG stroke draw */}
          <ScoreRing score={riskScore} />
        </Card>

        <Card className={`${styles.metricCard} ${styles.staggerIn}`} style={{ animationDelay: '160ms' }} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Distance This Month</span>
          </div>
          <div className={styles.metricValue}>
            {/* ✅ FIX: count-up animation */}
            <span className={styles.amount}>{animatedDistance}</span>
            <span className={styles.period}>km</span>
          </div>
          <div className={styles.metricComparison}>{totalTrips} trips completed</div>
          {/* ✅ FIX: bar heights seeded once via useMemo — no more flickering */}
          <div className={styles.miniChart}>
            {chartBars.map((h, i) => (
              <div
                key={i}
                className={styles.miniChartBar}
                style={{
                  height: `${h}%`,
                  background: i > 27 ? 'var(--color-primary-600)' : 'var(--color-neutral-300)',
                  animationDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>
        </Card>

        <Card className={`${styles.metricCard} ${styles.staggerIn}`} style={{ animationDelay: '240ms' }} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Savings</span>
            <span className={styles.metricTrend}>↑ {savingsPercent}%</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.currency}>₹</span>
            {/* ✅ FIX: count-up animation + from shared premium state */}
            <span className={styles.amount}>{animatedSavings}</span>
          </div>
          <div className={styles.metricComparison}>Saved this month</div>
          <div className={styles.savingsBreakdown}>
            <div className={styles.savingsItem}><span>Safe driving</span><span>-₹180</span></div>
            <div className={styles.savingsItem}><span>Low mileage</span><span>-₹80</span></div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card title="Recent Trips" variant="outlined">
        <div className={styles.tripsList}>
          {recentTrips.map((trip) => (
            <div key={trip.id}>
              <div className={styles.tripItem}>
                <div className={styles.tripDate}>
                  <div className={styles.tripDay}>
                    {trip.date.toLocaleDateString('en-IN', { day: '2-digit' })}
                  </div>
                  <div className={styles.tripMonth}>
                    {trip.date.toLocaleDateString('en-IN', { month: 'short' })}
                  </div>
                </div>

                <div className={styles.tripDetails}>
                  <div className={styles.tripInfo}>
                    <span className={styles.tripDistance}>{trip.distance.toFixed(1)} km</span>
                    <span className={styles.tripDuration}>{trip.duration} min</span>
                  </div>
                  <div className={styles.tripScore}>
                    <div className={`${styles.scoreIndicator} ${getRiskColor(trip.score)}`}>
                      {trip.score}
                    </div>
                    <span className={styles.scoreLabel}>Trip Score</span>
                  </div>
                </div>

                <div className={styles.tripImpact}>
                  <span className={trip.impact < 0 ? styles.impactPositive : styles.impactNegative}>
                    {trip.impact < 0 ? '' : '+'}₹{Math.abs(trip.impact)}
                  </span>
                  <span className={styles.impactLabel}>{trip.impact < 0 ? 'Saved' : 'Added'}</span>
                </div>

                {/* ✅ FIX: wired View Details toggle */}
                <Button
                  id={`btn-view-trip-${trip.id}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                >
                  {expandedTripId === trip.id ? 'Collapse' : 'View Details'}
                </Button>
              </div>

              {/* Inline trip detail panel */}
              {expandedTripId === trip.id && (
                <div className={styles.tripDetail}>
                  <div className={styles.tripDetailGrid}>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Distance</span>
                      <span className={styles.tripDetailValue}>{trip.distance.toFixed(1)} km</span>
                    </div>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Duration</span>
                      <span className={styles.tripDetailValue}>{trip.duration} min</span>
                    </div>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Trip Score</span>
                      <span className={`${styles.tripDetailValue} ${getRiskColor(trip.score)}`}>{trip.score}/100</span>
                    </div>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Premium Impact</span>
                      <span className={`${styles.tripDetailValue} ${trip.impact < 0 ? styles.impactPositive : styles.impactNegative}`}>
                        {trip.impact < 0 ? '' : '+'}₹{Math.abs(trip.impact)}
                      </span>
                    </div>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Avg Speed</span>
                      <span className={styles.tripDetailValue}>
                        {Math.round((trip.distance / trip.duration) * 60)} km/h
                      </span>
                    </div>
                    <div className={styles.tripDetailItem}>
                      <span className={styles.tripDetailLabel}>Date</span>
                      <span className={styles.tripDetailValue}>
                        {trip.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Realtime Simulator & Driver Satisfaction Optimizer for this trip */}
                  <TripDetailSimulator
                    trip={trip}
                    onOpenFullSimulator={() => navigateTo('simulator')}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions — all wired */}
      <div className={styles.quickActions}>
        {/* ✅ FIX: onClick to navigate to PremiumExplainer */}
        <Card
          compact
          interactive
          onClick={() => navigateTo('explainer')}
        >
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>📊</div>
            <div>
              <h4 className={styles.actionTitle}>View Full Breakdown</h4>
              <p className={styles.actionDescription}>See detailed premium explanation</p>
            </div>
          </div>
        </Card>

        {/* ✅ FIX: onClick to navigate to PremiumExplainer (What-If mode) */}
        <Card
          compact
          interactive
          onClick={() => navigateTo('explainer')}
        >
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>🎯</div>
            <div>
              <h4 className={styles.actionTitle}>What-If Simulator</h4>
              <p className={styles.actionDescription}>Estimate future savings</p>
            </div>
          </div>
        </Card>

        {/* SafeDrive Live Telematics Suite */}
        <Card
          compact
          interactive
          onClick={() => navigateTo('safedrive')}
        >
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>📱</div>
            <div>
              <h4 className={styles.actionTitle}>SafeDrive Live HUD</h4>
              <p className={styles.actionDescription}>Live telematics & roadside help</p>
            </div>
          </div>
        </Card>

        {/* ✅ FIX: onClick exports trip data */}
        <Card
          compact
          interactive
          onClick={handleExportData}
        >
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>📥</div>
            <div>
              <h4 className={styles.actionTitle}>Export Data</h4>
              <p className={styles.actionDescription}>Download your trip history</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


