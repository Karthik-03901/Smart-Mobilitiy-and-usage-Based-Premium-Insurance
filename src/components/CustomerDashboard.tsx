'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import styles from './CustomerDashboard.module.css';

interface TripSummary {
  id: string;
  date: Date;
  distance: number;
  duration: number;
  score: number;
  impact: number;
}

export const CustomerDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentTrips, setRecentTrips] = useState<TripSummary[]>([
    {
      id: '1',
      date: new Date(Date.now() - 86400000 * 1),
      distance: 24.5,
      duration: 45,
      score: 87,
      impact: -25,
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000 * 2),
      distance: 12.3,
      duration: 28,
      score: 92,
      impact: -35,
    },
    {
      id: '3',
      date: new Date(Date.now() - 86400000 * 3),
      distance: 45.2,
      duration: 82,
      score: 68,
      impact: 48,
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPremium = 1840;
  const standardPremium = 2100;
  const riskScore = 74;
  const totalDistance = 234.8;
  const totalTrips = 28;
  const savingsPercent = ((standardPremium - currentPremium) / standardPremium * 100).toFixed(1);

  const getRiskColor = (score: number) => {
    if (score >= 80) return styles.excellent;
    if (score >= 60) return styles.good;
    if (score >= 40) return styles.fair;
    return styles.poor;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, Asha</h1>
          <p className={styles.subtitle}>
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' • '}
            {currentTime.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Button variant="primary">Start New Trip</Button>
      </div>

      {/* Consent Status Banner */}
      <div className={styles.consentBanner}>
        <div className={styles.consentIcon}>🔒</div>
        <div className={styles.consentContent}>
          <h3>Data Sharing Active</h3>
          <p>You're currently sharing driving data to get personalized pricing</p>
        </div>
        <Button variant="ghost" size="sm">
          Manage Consent
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Current Premium</span>
            <span className={styles.metricTrend}>↓ 12.4%</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.currency}>₹</span>
            <span className={styles.amount}>{currentPremium}</span>
            <span className={styles.period}>/mo</span>
          </div>
          <div className={styles.metricComparison}>
            vs ₹{standardPremium} standard rate
          </div>
          <div className={styles.metricBar}>
            <div
              className={`${styles.metricBarFill} ${styles.savings}`}
              style={{ width: `${(currentPremium / standardPremium) * 100}%` }}
            />
          </div>
        </Card>

        <Card className={styles.metricCard} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Risk Score</span>
            <span className={`${styles.badge} ${getRiskColor(riskScore)}`}>
              {riskScore >= 80 ? 'Excellent' : riskScore >= 60 ? 'Good' : 'Fair'}
            </span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.scoreValue}>{riskScore}</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <div className={styles.metricComparison}>
            Better than 68% of drivers
          </div>
          <div className={styles.scoreCircle}>
            <svg viewBox="0 0 100 100" className={styles.scoreCircleSvg}>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-neutral-200)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-success-600)"
                strokeWidth="8"
                strokeDasharray={`${riskScore * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </Card>

        <Card className={styles.metricCard} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Distance This Month</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.amount}>{totalDistance}</span>
            <span className={styles.period}>km</span>
          </div>
          <div className={styles.metricComparison}>
            {totalTrips} trips completed
          </div>
          <div className={styles.miniChart}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={styles.miniChartBar}
                style={{
                  height: `${Math.random() * 100}%`,
                  background:
                    i > 27
                      ? 'var(--color-primary-600)'
                      : 'var(--color-neutral-300)',
                }}
              />
            ))}
          </div>
        </Card>

        <Card className={styles.metricCard} variant="elevated">
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Savings</span>
            <span className={styles.metricTrend}>↑ {savingsPercent}%</span>
          </div>
          <div className={styles.metricValue}>
            <span className={styles.currency}>₹</span>
            <span className={styles.amount}>{standardPremium - currentPremium}</span>
          </div>
          <div className={styles.metricComparison}>
            Saved this month
          </div>
          <div className={styles.savingsBreakdown}>
            <div className={styles.savingsItem}>
              <span>Safe driving</span>
              <span>-₹180</span>
            </div>
            <div className={styles.savingsItem}>
              <span>Low mileage</span>
              <span>-₹80</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card title="Recent Trips" variant="outlined">
        <div className={styles.tripsList}>
          {recentTrips.map((trip) => (
            <div key={trip.id} className={styles.tripItem}>
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
                  <span className={styles.tripDistance}>
                    {trip.distance.toFixed(1)} km
                  </span>
                  <span className={styles.tripDuration}>
                    {trip.duration} min
                  </span>
                </div>
                <div className={styles.tripScore}>
                  <div className={`${styles.scoreIndicator} ${getRiskColor(trip.score)}`}>
                    {trip.score}
                  </div>
                  <span className={styles.scoreLabel}>Trip Score</span>
                </div>
              </div>

              <div className={styles.tripImpact}>
                <span
                  className={trip.impact < 0 ? styles.impactPositive : styles.impactNegative}
                >
                  {trip.impact < 0 ? '' : '+'}₹{Math.abs(trip.impact)}
                </span>
                <span className={styles.impactLabel}>
                  {trip.impact < 0 ? 'Saved' : 'Added'}
                </span>
              </div>

              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Card compact interactive>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>📊</div>
            <div>
              <h4 className={styles.actionTitle}>View Full Breakdown</h4>
              <p className={styles.actionDescription}>
                See detailed premium explanation
              </p>
            </div>
          </div>
        </Card>

        <Card compact interactive>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>🎯</div>
            <div>
              <h4 className={styles.actionTitle}>What-If Simulator</h4>
              <p className={styles.actionDescription}>
                Estimate future savings
              </p>
            </div>
          </div>
        </Card>

        <Card compact interactive>
          <div className={styles.actionContent}>
            <div className={styles.actionIcon}>📥</div>
            <div>
              <h4 className={styles.actionTitle}>Export Data</h4>
              <p className={styles.actionDescription}>
                Download your trip history
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
