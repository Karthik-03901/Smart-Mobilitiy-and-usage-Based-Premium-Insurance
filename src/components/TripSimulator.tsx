'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { LiveIndicator } from './LiveIndicator';
import { useApp } from '../context/AppContext';
import styles from './TripSimulator.module.css';

interface TripData {
  distance: number;
  duration: number;
  speed: number;
  maxSpeed: number;
  harshBrakes: number;
  harshAccelerations: number;
  speedingTime: number;
  nightDriving: number;
  rushHourDriving: number;
}

interface TripEvent {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: Date;
}

type DrivingProfile = 'safe' | 'average' | 'risky';

function calculateTripScore(data: TripData): number {
  if (data.duration === 0) return 100;
  const brakeDeduction = data.harshBrakes * 5;
  const accelDeduction = data.harshAccelerations * 3;
  const speedDeduction = (data.speedingTime / data.duration) * 30;
  return Math.max(0, Math.min(100, Math.round(100 - brakeDeduction - accelDeduction - speedDeduction)));
}

export const TripSimulator: React.FC = () => {
  const { addTrip, showToast, theme } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [profile, setProfile] = useState<DrivingProfile>('average');
  const [simulatedHour, setSimulatedHour] = useState(14);
  const [tripData, setTripData] = useState<TripData>({
    distance: 0, duration: 0, speed: 0, maxSpeed: 0,
    harshBrakes: 0, harshAccelerations: 0, speedingTime: 0,
    nightDriving: 0, rushHourDriving: 0,
  });
  const [events, setEvents] = useState<TripEvent[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const profileConfigs = {
    safe:    { baseSpeed: 45, speedVariance: 10, brakeChance: 0.005, accelChance: 0.003 },
    average: { baseSpeed: 55, speedVariance: 15, brakeChance: 0.015, accelChance: 0.012 },
    risky:   { baseSpeed: 70, speedVariance: 25, brakeChance: 0.035, accelChance: 0.030 },
  };

  const addEvent = useCallback((type: TripEvent['type'], message: string) => {
    const event: TripEvent = { id: `${Date.now()}-${Math.random()}`, type, message, timestamp: new Date() };
    setEvents(prev => [event, ...prev].slice(0, 10));
  }, []);

  const generateTripData = useCallback(() => {
    const config = profileConfigs[profile];
    const currentSpeed = Math.max(0, config.baseSpeed + (Math.random() - 0.5) * config.speedVariance);

    setTripData(prev => {
      const next = { ...prev };
      const dt = 0.1;
      next.distance += (currentSpeed / 3600) * dt;
      next.duration += dt;
      next.speed = currentSpeed;
      next.maxSpeed = Math.max(next.maxSpeed, currentSpeed);

      if (Math.random() < config.brakeChance) {
        next.harshBrakes += 1;
        addEvent('warning', `Harsh braking at ${currentSpeed.toFixed(0)} km/h`);
      }
      if (Math.random() < config.accelChance) {
        next.harshAccelerations += 1;
        addEvent('warning', 'Harsh acceleration detected');
      }
      if (currentSpeed > 60) {
        next.speedingTime += dt;
        if (Math.random() < 0.01)
          addEvent('danger', `Speeding: ${currentSpeed.toFixed(0)} km/h in 60 zone`);
      }
      if (simulatedHour >= 23 || simulatedHour < 5) next.nightDriving += dt;
      if ((simulatedHour >= 7 && simulatedHour < 9) || (simulatedHour >= 17 && simulatedHour < 19))
        next.rushHourDriving += dt;

      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, addEvent, simulatedHour]);

  const drawMap = useCallback((data: TripData, active: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth || 600;
    const cssH = canvas.offsetHeight || 300;
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.scale(dpr, dpr);

    // Canvas background
    ctx.fillStyle = isDark ? '#0b0f1a' : '#f1f3f5';
    ctx.fillRect(0, 0, cssW, cssH);

    if (!active && data.distance === 0) {
      ctx.fillStyle = isDark ? '#64748b' : '#adb5bd';
      ctx.font = '500 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press Start Trip to begin simulation', cssW / 2, cssH / 2);
      return;
    }

    const roadY = cssH / 2;
    ctx.strokeStyle = isDark ? '#1e293b' : '#495057';
    ctx.lineWidth = 60;
    ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(cssW, roadY); ctx.stroke();

    ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.45)' : '#ffffff';
    ctx.lineWidth = 3; ctx.setLineDash([20, 20]);
    ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(cssW, roadY); ctx.stroke();
    ctx.setLineDash([]);

    const carX = (data.distance * 80) % cssW;
    ctx.fillStyle = data.speed > 60 ? '#ef4444' : '#6366f1';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(carX - 22, roadY - 14, 44, 28, 4);
    else ctx.rect(carX - 22, roadY - 14, 44, 28);
    ctx.fill();

    ctx.fillStyle = 'rgba(135,206,235,0.9)';
    ctx.fillRect(carX - 16, roadY - 9, 12, 18);
    ctx.fillRect(carX + 4,  roadY - 9, 12, 18);

    const speedPct = Math.min(data.speed / 120, 1);
    ctx.strokeStyle = data.speed > 60 ? '#ef4444' : '#10b981';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cssW - 55, cssH - 55, 38, Math.PI, Math.PI + Math.PI * speedPct);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#f1f5f9' : '#212529';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.speed.toFixed(0)} km/h`, cssW - 55, cssH - 15);
  }, [theme]);

  useEffect(() => {
    if (isActive && !isPaused) {
      const id = setInterval(() => generateTripData(), 100);
      return () => clearInterval(id);
    }
  }, [isActive, isPaused, generateTripData]);

  useEffect(() => { drawMap(tripData, isActive); }, [tripData, drawMap, isActive, theme]);

  // Initial idle draw and theme change redraw
  useEffect(() => {
    drawMap(tripData, isActive);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const handleStart = () => {
    setIsActive(true); setIsPaused(false);
    addEvent('info', `Trip started — ${profile} profile, ${simulatedHour}:00`);
  };

  const handlePause = () => {
    setIsPaused(p => !p);
    addEvent('info', isPaused ? 'Trip resumed' : 'Trip paused');
  };

  const handleStop = () => {
    setIsActive(false); setIsPaused(false);
    const score = calculateTripScore(tripData);
    const impact = score >= 80 ? -Math.round(tripData.distance * 0.8)
                 : score >= 60 ? -Math.round(tripData.distance * 0.3)
                 :                Math.round(tripData.distance * 0.5);
    addTrip({ date: new Date(), distance: tripData.distance, duration: Math.round(tripData.duration / 60), score, impact });
    showToast(`Trip saved! Score: ${score}/100 — ${impact < 0 ? 'saved' : 'added'} ₹${Math.abs(impact)} on your premium.`, score >= 70 ? 'success' : 'warning');
    addEvent('info', `Trip saved — ${tripData.distance.toFixed(2)} km, Score: ${score}`);
  };

  const handleReset = () => {
    setIsActive(false); setIsPaused(false);
    setTripData({ distance: 0, duration: 0, speed: 0, maxSpeed: 0, harshBrakes: 0, harshAccelerations: 0, speedingTime: 0, nightDriving: 0, rushHourDriving: 0 });
    setEvents([]);
  };

  const metricColor = (v: number, good: number, warn: number) =>
    v <= good ? styles.metricGood : v <= warn ? styles.metricWarning : styles.metricDanger;

  const isNight    = simulatedHour >= 23 || simulatedHour < 5;
  const isRushHour = (simulatedHour >= 7 && simulatedHour < 9) || (simulatedHour >= 17 && simulatedHour < 19);

  const statusVariant: 'live' | 'updating' | 'offline' =
    !isActive ? 'offline' : isPaused ? 'updating' : 'live';
  const statusLabel = !isActive ? 'Idle' : isPaused ? 'Paused' : 'Driving';

  const speedingPct = tripData.duration > 0 ? (tripData.speedingTime / tripData.duration) * 100 : 0;

  return (
    <div className={styles.simulator}>
      <div className={styles.header}>
        <h2 className={styles.title}>Real-Time Trip Simulator</h2>
        <LiveIndicator variant={statusVariant} label={statusLabel} />
      </div>

      <div className={styles.mapContainer}>
        <canvas ref={canvasRef} className={styles.mapCanvas} />
        <div className={styles.mapOverlay}>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Speed</div>
            <div className={styles.mapStatValue}>{tripData.speed.toFixed(0)}<span className={styles.mapStatUnit}>km/h</span></div>
          </div>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Distance</div>
            <div className={styles.mapStatValue}>{tripData.distance.toFixed(2)}<span className={styles.mapStatUnit}>km</span></div>
          </div>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Time</div>
            <div className={styles.mapStatValue}>{(tripData.duration / 60).toFixed(1)}<span className={styles.mapStatUnit}>min</span></div>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricHeader}><span className={styles.metricLabel}>Harsh Brakes</span></div>
          <div className={styles.metricValue}>{tripData.harshBrakes}<span className={styles.metricUnit}> events</span></div>
          <div className={styles.metricBar}><div className={`${styles.metricBarFill} ${metricColor(tripData.harshBrakes, 2, 5)}`} style={{ width: `${Math.min((tripData.harshBrakes / 10) * 100, 100)}%` }} /></div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricHeader}><span className={styles.metricLabel}>Harsh Accel</span></div>
          <div className={styles.metricValue}>{tripData.harshAccelerations}<span className={styles.metricUnit}> events</span></div>
          <div className={styles.metricBar}><div className={`${styles.metricBarFill} ${metricColor(tripData.harshAccelerations, 2, 5)}`} style={{ width: `${Math.min((tripData.harshAccelerations / 10) * 100, 100)}%` }} /></div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricHeader}><span className={styles.metricLabel}>Speeding %</span></div>
          <div className={styles.metricValue}>{speedingPct.toFixed(0)}<span className={styles.metricUnit}>%</span></div>
          <div className={styles.metricBar}><div className={`${styles.metricBarFill} ${metricColor(speedingPct, 10, 25)}`} style={{ width: `${Math.min(speedingPct, 100)}%` }} /></div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricHeader}><span className={styles.metricLabel}>Max Speed</span></div>
          <div className={styles.metricValue}>{tripData.maxSpeed.toFixed(0)}<span className={styles.metricUnit}> km/h</span></div>
          <div className={styles.metricBar}><div className={`${styles.metricBarFill} ${metricColor(tripData.maxSpeed, 60, 80)}`} style={{ width: `${Math.min((tripData.maxSpeed / 120) * 100, 100)}%` }} /></div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Driving Profile</label>
          <select className={styles.select} value={profile} onChange={e => setProfile(e.target.value as DrivingProfile)} disabled={isActive}>
            <option value="safe">Safe Driver</option>
            <option value="average">Average Driver</option>
            <option value="risky">Risky Driver</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Simulated Hour: {simulatedHour}:00
            {isNight    && <span style={{ color: 'var(--color-primary-600)', marginLeft: 8 }}>🌙 Night</span>}
            {isRushHour && <span style={{ color: 'var(--color-warning-600)', marginLeft: 8 }}>🚦 Rush Hour</span>}
          </label>
          <input type="range" min="0" max="23" value={simulatedHour}
            onChange={e => setSimulatedHour(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {!isActive
            ? <Button variant="primary" onClick={handleStart}>Start Trip</Button>
            : <>
                <Button variant="warning" onClick={handlePause}>{isPaused ? 'Resume' : 'Pause'}</Button>
                <Button variant="danger"  onClick={handleStop}>End Trip</Button>
              </>
          }
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
        </div>
      </div>

      {events.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>Trip Events</h3>
          <div className={styles.eventsFeed}>
            {events.map(ev => {
              const cls = ev.type === 'danger' ? styles.eventDanger : ev.type === 'warning' ? styles.eventWarning : styles.eventInfo;
              return (
                <div key={ev.id} className={`${styles.event} ${cls}`}>
                  <span className={styles.eventDot} />
                  <div className={styles.eventContent}>
                    <div className={styles.eventMessage}>{ev.message}</div>
                    <div className={styles.eventTime}>{ev.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
