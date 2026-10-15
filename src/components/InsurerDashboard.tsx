'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import styles from './InsurerDashboard.module.css';

interface PortfolioMetrics {
  totalCustomers: number;
  behavioralPricingCustomers: number;
  averageScore: number;
  totalPremium: number;
  projectedLossRatio: number;
}

export const InsurerDashboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalCustomers: 2847,
    behavioralPricingCustomers: 1923,
    averageScore: 71.4,
    totalPremium: 4785320,
    projectedLossRatio: 0.64,
  });

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalCustomers: prev.totalCustomers + Math.floor(Math.random() * 3),
        behavioralPricingCustomers: prev.behavioralPricingCustomers + Math.floor(Math.random() * 2),
        averageScore: prev.averageScore + (Math.random() - 0.5) * 0.1,
        totalPremium: prev.totalPremium + Math.floor(Math.random() * 5000),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Draw distribution chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 250;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Distribution data (score ranges)
    const distribution = [
      { range: '0-20', count: 45, color: '#e60000' },
      { range: '21-40', count: 187, color: '#ffba00' },
      { range: '41-60', count: 542, color: '#0080ff' },
      { range: '61-80', count: 856, color: '#00c767' },
      { range: '81-100', count: 293, color: '#00a054' },
    ];

    const maxCount = Math.max(...distribution.map(d => d.count));
    const barWidth = canvas.width / distribution.length - 20;
    const maxBarHeight = canvas.height - 60;

    distribution.forEach((data, index) => {
      const barHeight = (data.count / maxCount) * maxBarHeight;
      const x = index * (barWidth + 20) + 10;
      const y = canvas.height - barHeight - 40;

      // Draw bar
      ctx.fillStyle = data.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw count
      ctx.fillStyle = '#212529';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.count.toString(), x + barWidth / 2, y - 10);

      // Draw label
      ctx.font = '12px sans-serif';
      ctx.fillText(data.range, x + barWidth / 2, canvas.height - 15);
    });
  }, [metrics]);

  const behavioralPercent = ((metrics.behavioralPricingCustomers / metrics.totalCustomers) * 100).toFixed(1);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Insurer Portfolio Dashboard</h1>
          <p className={styles.subtitle}>Real-time behavioral insurance analytics</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="primary" size="sm">
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-primary-100)' }}>
            👥
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Total Customers</div>
            <div className={styles.metricValue}>
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div className={styles.metricChange}>
              <span className={styles.metricTrend}>↑ 8.3%</span>
              <span className={styles.metricPeriod}>vs last month</span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-success-100)' }}>
            📈
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Behavioral Pricing</div>
            <div className={styles.metricValue}>
              {metrics.behavioralPricingCustomers.toLocaleString()}
            </div>
            <div className={styles.metricChange}>
              <span className={styles.metricSubtext}>{behavioralPercent}% of portfolio</span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-warning-100)' }}>
            ⭐
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Average Score</div>
            <div className={styles.metricValue}>
              {metrics.averageScore.toFixed(1)}
              <span className={styles.metricUnit}>/100</span>
            </div>
            <div className={styles.metricChange}>
              <span className={styles.metricTrend}>↑ 2.1 pts</span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-primary-100)' }}>
            💰
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Total Premium</div>
            <div className={styles.metricValue}>
              ₹{(metrics.totalPremium / 100000).toFixed(1)}L
            </div>
            <div className={styles.metricChange}>
              <span className={styles.metricTrend}>↑ 12.7%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card title="Risk Score Distribution" subtitle="Portfolio segmentation by customer risk scores">
        <div className={styles.chartContainer}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        <div className={styles.distributionLegend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#e60000' }}></span>
            <span>High Risk (0-20)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ffba00' }}></span>
            <span>Medium Risk (21-40)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#0080ff' }}></span>
            <span>Average (41-60)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#00c767' }}></span>
            <span>Good (61-80)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#00a054' }}></span>
            <span>Excellent (81-100)</span>
          </div>
        </div>
      </Card>

      {/* Fairness Monitor */}
      <Card 
        title="Fairness Monitor" 
        subtitle="Disparity analysis across demographic groups"
        headerAction={
          <span className={styles.statusBadge} style={{ background: 'var(--color-success-100)', color: 'var(--color-success-800)' }}>
            ✓ Within Limits
          </span>
        }
      >
        <div className={styles.fairnessGrid}>
          <div className={styles.fairnessCard}>
            <div className={styles.fairnessHeader}>
              <h4>Age Groups</h4>
              <span className={styles.fairnessStatus}>✓</span>
            </div>
            <div className={styles.fairnessMetrics}>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>18-25</span>
                <span className={styles.fairnessValue}>₹2,245</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '89%', background: 'var(--color-primary-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>26-35</span>
                <span className={styles.fairnessValue}>₹1,890</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '75%', background: 'var(--color-primary-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>36-50</span>
                <span className={styles.fairnessValue}>₹1,675</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '66%', background: 'var(--color-primary-500)' }}></div>
                </div>
              </div>
            </div>
            <div className={styles.fairnessFooter}>
              <span>Max disparity: 8.7%</span>
              <span className={styles.fairnessThreshold}>Threshold: 10%</span>
            </div>
          </div>

          <div className={styles.fairnessCard}>
            <div className={styles.fairnessHeader}>
              <h4>Regions</h4>
              <span className={styles.fairnessStatus}>✓</span>
            </div>
            <div className={styles.fairnessMetrics}>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>Urban</span>
                <span className={styles.fairnessValue}>₹1,945</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '77%', background: 'var(--color-success-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>Suburban</span>
                <span className={styles.fairnessValue}>₹1,820</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '72%', background: 'var(--color-success-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>Rural</span>
                <span className={styles.fairnessValue}>₹1,780</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '71%', background: 'var(--color-success-500)' }}></div>
                </div>
              </div>
            </div>
            <div className={styles.fairnessFooter}>
              <span>Max disparity: 6.4%</span>
              <span className={styles.fairnessThreshold}>Threshold: 10%</span>
            </div>
          </div>

          <div className={styles.fairnessCard}>
            <div className={styles.fairnessHeader}>
              <h4>Vehicle Class</h4>
              <span className={styles.fairnessStatus}>✓</span>
            </div>
            <div className={styles.fairnessMetrics}>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>Sedan</span>
                <span className={styles.fairnessValue}>₹1,850</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '73%', background: 'var(--color-warning-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>SUV</span>
                <span className={styles.fairnessValue}>₹2,150</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '85%', background: 'var(--color-warning-500)' }}></div>
                </div>
              </div>
              <div className={styles.fairnessItem}>
                <span className={styles.fairnessLabel}>Hatchback</span>
                <span className={styles.fairnessValue}>₹1,620</span>
                <div className={styles.fairnessBar}>
                  <div style={{ width: '64%', background: 'var(--color-warning-500)' }}></div>
                </div>
              </div>
            </div>
            <div className={styles.fairnessFooter}>
              <span>Max disparity: 9.2%</span>
              <span className={styles.fairnessThreshold}>Threshold: 10%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className={styles.activityGrid}>
        <Card title="Recent Customer Activity" variant="outlined" compact>
          <div className={styles.activityList}>
            {[
              { user: 'Rajesh K.', action: 'Consent granted', time: '2 min ago', type: 'success' },
              { user: 'Priya S.', action: 'Trip completed (45km)', time: '8 min ago', type: 'info' },
              { user: 'Amit P.', action: 'Quote generated', time: '12 min ago', type: 'info' },
              { user: 'Sneha M.', action: 'Consent revoked', time: '24 min ago', type: 'warning' },
              { user: 'Karthik V.', action: 'Data exported', time: '31 min ago', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles[activity.type]}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityUser}>{activity.user}</div>
                  <div className={styles.activityAction}>{activity.action}</div>
                </div>
                <div className={styles.activityTime}>{activity.time}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Loss Ratio Projection" variant="outlined" compact>
          <div className={styles.lossRatioDisplay}>
            <div className={styles.lossRatioValue}>
              {(metrics.projectedLossRatio * 100).toFixed(1)}%
            </div>
            <div className={styles.lossRatioLabel}>Projected Loss Ratio</div>
            <div className={styles.lossRatioBar}>
              <div
                className={styles.lossRatioFill}
                style={{ width: `${metrics.projectedLossRatio * 100}%` }}
              ></div>
            </div>
            <div className={styles.lossRatioMeta}>
              <span>Target: 70%</span>
              <span className={styles.lossRatioStatus}>✓ On Track</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
