'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import styles from './InsurerDashboard.module.css';

interface PortfolioMetrics {
  totalCustomers: number;
  behavioralPricingCustomers: number;
  averageScore: number;
  totalPremium: number;
  projectedLossRatio: number;
}

const DISTRIBUTION = [
  { range: '0-20',   count: 45,  color: '#e60000' },
  { range: '21-40',  count: 187, color: '#ffba00' },
  { range: '41-60',  count: 542, color: '#0080ff' },
  { range: '61-80',  count: 856, color: '#00c767' },
  { range: '81-100', count: 293, color: '#00a054' },
];

export const InsurerDashboard: React.FC = () => {
  const { showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalCustomers: 2847,
    behavioralPricingCustomers: 1923,
    averageScore: 71.4,
    totalPremium: 4785320,
    projectedLossRatio: 0.64,
  });

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.offsetWidth || 600;
    const cssHeight = 250;

    canvas.width  = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width  = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(dpr, dpr);

    const maxCount = Math.max(...DISTRIBUTION.map(d => d.count));
    const barWidth = cssWidth / DISTRIBUTION.length - 20;
    const maxBarHeight = cssHeight - 60;

    let frame = 0;
    const totalFrames = 30;

    const animate = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      DISTRIBUTION.forEach((data, i) => {
        const fullH = (data.count / maxCount) * maxBarHeight;
        const barH  = fullH * ease;
        const x = i * (barWidth + 20) + 10;
        const y = cssHeight - barH - 40;

        ctx.fillStyle = data.color;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        else ctx.rect(x, y, barWidth, barH);
        ctx.fill();

        if (progress > 0.8) {
          ctx.fillStyle = '#212529';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.globalAlpha = (progress - 0.8) / 0.2;
          ctx.fillText(String(data.count), x + barWidth / 2, y - 10);
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = '#495057';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.range, x + barWidth / 2, cssHeight - 15);
      });

      if (frame < totalFrames) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => { drawChart(); }, [drawChart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawChart());
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, [drawChart]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalCustomers: prev.totalCustomers + Math.round((Math.random() - 0.48) * 3),
        behavioralPricingCustomers: prev.behavioralPricingCustomers + Math.round((Math.random() - 0.48) * 2),
        averageScore: Math.min(100, Math.max(0, prev.averageScore + (Math.random() - 0.5) * 0.1)),
        totalPremium: prev.totalPremium + Math.round((Math.random() - 0.45) * 5000),
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Customers', String(metrics.totalCustomers)],
      ['Behavioral Pricing Customers', String(metrics.behavioralPricingCustomers)],
      ['Average Score', metrics.averageScore.toFixed(1)],
      ['Total Premium (INR)', String(metrics.totalPremium)],
      ['Projected Loss Ratio', `${(metrics.projectedLossRatio * 100).toFixed(1)}%`],
      ...DISTRIBUTION.map(d => [`Score Range ${d.range}`, String(d.count)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivefair-portfolio-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Portfolio report exported as CSV.', 'success');
  };

  const handleConfigureRules = () => {
    showToast('Rules engine configuration is not available in the Phase 1 demo.', 'info');
  };

  const behavioralPercent = ((metrics.behavioralPricingCustomers / metrics.totalCustomers) * 100).toFixed(1);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Insurer Portfolio Dashboard</h1>
          <p className={styles.subtitle}>Real-time behavioral insurance analytics</p>
        </div>
        <div className={styles.headerActions}>
          <Button id="btn-export-report" variant="outline" size="sm" onClick={handleExportReport}>Export Report</Button>
          <Button id="btn-configure-rules" variant="primary" size="sm" onClick={handleConfigureRules}>Configure Rules</Button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-primary-100)' }}>👥</div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Total Customers</div>
            <div className={styles.metricValue}>{metrics.totalCustomers.toLocaleString()}</div>
            <div className={styles.metricChange}><span className={styles.metricTrend}>↑ 8.3%</span><span className={styles.metricPeriod}> vs last month</span></div>
          </div>
        </Card>
        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-success-100)' }}>📈</div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Behavioral Pricing</div>
            <div className={styles.metricValue}>{metrics.behavioralPricingCustomers.toLocaleString()}</div>
            <div className={styles.metricChange}><span className={styles.metricSubtext}>{behavioralPercent}% of portfolio</span></div>
          </div>
        </Card>
        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-warning-100)' }}>⭐</div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Average Score</div>
            <div className={styles.metricValue}>{metrics.averageScore.toFixed(1)}<span className={styles.metricUnit}>/100</span></div>
            <div className={styles.metricChange}><span className={styles.metricTrend}>↑ 2.1 pts</span></div>
          </div>
        </Card>
        <Card variant="elevated" className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'var(--color-primary-100)' }}>💰</div>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Total Premium</div>
            <div className={styles.metricValue}>₹{(metrics.totalPremium / 100000).toFixed(1)}L</div>
            <div className={styles.metricChange}><span className={styles.metricTrend}>↑ 12.7%</span></div>
          </div>
        </Card>
      </div>

      <Card title="Risk Score Distribution" subtitle="Portfolio segmentation by customer risk scores">
        <div className={styles.chartContainer}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        <div className={styles.distributionLegend}>
          {DISTRIBUTION.map(d => (
            <div key={d.range} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: d.color }} />
              <span>
                {d.range === '0-20' && 'High Risk '}
                {d.range === '21-40' && 'Medium Risk '}
                {d.range === '41-60' && 'Average '}
                {d.range === '61-80' && 'Good '}
                {d.range === '81-100' && 'Excellent '}
                ({d.range})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Fairness Monitor"
        subtitle="Disparity analysis across demographic groups"
        headerAction={
          <span className={styles.statusBadge} style={{ background: 'var(--color-success-100)', color: 'var(--color-success-800)' }}>
            Within Limits
          </span>
        }
      >
        <div className={styles.fairnessGrid}>
          {[
            { label: 'Age Groups',    color: 'var(--color-primary-500)', disparity: '8.7%', items: [{ name: '18-25', value: '₹2,245', pct: '89%' }, { name: '26-35', value: '₹1,890', pct: '75%' }, { name: '36-50', value: '₹1,675', pct: '66%' }] },
            { label: 'Regions',       color: 'var(--color-success-500)', disparity: '6.4%', items: [{ name: 'Urban',    value: '₹1,945', pct: '77%' }, { name: 'Suburban', value: '₹1,820', pct: '72%' }, { name: 'Rural',    value: '₹1,780', pct: '71%' }] },
            { label: 'Vehicle Class', color: 'var(--color-warning-500)', disparity: '9.2%', items: [{ name: 'Sedan',     value: '₹1,850', pct: '73%' }, { name: 'SUV',       value: '₹2,150', pct: '85%' }, { name: 'Hatchback', value: '₹1,620', pct: '64%' }] },
          ].map(group => (
            <div key={group.label} className={styles.fairnessCard}>
              <div className={styles.fairnessHeader}><h4>{group.label}</h4><span className={styles.fairnessStatus}>✓</span></div>
              <div className={styles.fairnessMetrics}>
                {group.items.map(item => (
                  <div key={item.name} className={styles.fairnessItem}>
                    <span className={styles.fairnessLabel}>{item.name}</span>
                    <span className={styles.fairnessValue}>{item.value}</span>
                    <div className={styles.fairnessBar}><div style={{ width: item.pct, background: group.color }} /></div>
                  </div>
                ))}
              </div>
              <div className={styles.fairnessFooter}>
                <span>Max disparity: {group.disparity}</span>
                <span className={styles.fairnessThreshold}>Threshold: 10%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.activityGrid}>
        <Card title="Recent Customer Activity" variant="outlined" compact>
          <div className={styles.activityList}>
            {[
              { user: 'Rajesh K.',   action: 'Consent granted',       time: '2 min ago',  type: 'success' },
              { user: 'Priya S.',    action: 'Trip completed (45km)', time: '8 min ago',  type: 'info'    },
              { user: 'Amit P.',     action: 'Quote generated',       time: '12 min ago', type: 'info'    },
              { user: 'Sneha M.',    action: 'Consent revoked',       time: '24 min ago', type: 'warning' },
              { user: 'Karthik V.',  action: 'Data exported',         time: '31 min ago', type: 'info'    },
            ].map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles[a.type]}`} />
                <div className={styles.activityContent}>
                  <div className={styles.activityUser}>{a.user}</div>
                  <div className={styles.activityAction}>{a.action}</div>
                </div>
                <div className={styles.activityTime}>{a.time}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Loss Ratio Projection" variant="outlined" compact>
          <div className={styles.lossRatioDisplay}>
            <div className={styles.lossRatioValue}>{(metrics.projectedLossRatio * 100).toFixed(1)}%</div>
            <div className={styles.lossRatioLabel}>Projected Loss Ratio</div>
            <div className={styles.lossRatioBar}>
              <div className={styles.lossRatioFill} style={{ width: `${metrics.projectedLossRatio * 100}%` }} />
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
