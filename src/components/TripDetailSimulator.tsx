'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TripSummary } from '../context/AppContext';
import styles from './TripDetailSimulator.module.css';

interface TripDetailSimulatorProps {
  trip: TripSummary;
  onOpenFullSimulator?: () => void;
}

export const TripDetailSimulator: React.FC<TripDetailSimulatorProps> = ({
  trip,
  onOpenFullSimulator,
}) => {
  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  // What-If Driver Satisfaction Sliders
  const [brakingQuality, setBrakingQuality] = useState(85); // 50 to 100
  const [speedCompliance, setSpeedCompliance] = useState(90); // 70 to 100
  const [timingChoice, setTimingChoice] = useState<'offpeak' | 'peak'>('offpeak');

  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated speed profile based on route progress
  const getCurrentSpeed = (prog: number) => {
    if (prog === 0 || prog === 100) return 0;
    const avg = Math.round((trip.distance / (trip.duration || 1)) * 60) || 38;
    // Sinusoidal speed variation around average
    const variation = Math.sin((prog / 100) * Math.PI * 4) * 12;
    return Math.max(15, Math.round(avg + variation));
  };

  // Simulated live events as the vehicle progresses
  const getEventAtProgress = (prog: number) => {
    if (prog === 0) return { title: 'Trip Start', desc: 'Engine ignited, GPS telemetry locked', icon: '🟢' };
    if (prog < 25) return { title: 'Smooth Acceleration', desc: 'Optimal throttle response (+0.18g)', icon: '⚡' };
    if (prog < 50) return { title: 'Corridor Cruising', desc: 'Speed sustained strictly within 50 km/h limit', icon: '🚗' };
    if (prog < 75) return { title: 'Gentle Deceleration', desc: 'Anticipatory coasting at junction (0 harsh brakes)', icon: '🛑' };
    if (prog < 100) return { title: 'Final Approach', desc: 'Smooth parking manoeuvre into destination', icon: '🎯' };
    return { title: 'Destination Reached', desc: 'Trip completed safely with high score!', icon: '🏁' };
  };

  // Replay animation loop
  useEffect(() => {
    if (isPlaying) {
      animRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 1 * playbackSpeed);
        });
      }, 75);
    } else if (animRef.current) {
      clearInterval(animRef.current);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const handlePlayToggle = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const currentSpeed = getCurrentSpeed(progress);
  const currentEvent = getEventAtProgress(progress);

  // Dynamic Driver Satisfaction Score & Savings calculation
  const baseScore = trip.score || 85;
  const brakingBonus = Math.round((brakingQuality - 75) * 0.2);
  const speedBonus = Math.round((speedCompliance - 80) * 0.25);
  const timingBonus = timingChoice === 'offpeak' ? 4 : -4;

  const simulatedScore = Math.min(100, Math.max(50, baseScore + brakingBonus + speedBonus + timingBonus));
  const scoreDiff = simulatedScore - baseScore;

  // Base savings for this trip
  const baseSavings = Math.max(10, Math.abs(trip.impact));
  const simulatedSavings = Math.round(baseSavings * (simulatedScore / (baseScore || 1)));
  const extraSavings = Math.max(0, simulatedSavings - baseSavings);

  // Road progress calculation for SVG
  const pathLength = 360;
  const dashOffset = pathLength - (progress / 100) * pathLength;
  const carX = 25 + (progress / 100) * 310;
  const carY = 38 + Math.sin((progress / 100) * Math.PI * 2) * 12;

  return (
    <div className={styles.container}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className={styles.simHeader}>
        <div className={styles.simTitleGroup}>
          <div className={styles.badgeRow}>
            <span className={styles.simBadge}>
              <span className={styles.pulseDot} />
              Real-Time Drive Telematics
            </span>
            <span className={styles.tripIdPill}>
              Trip #{trip.id.substring(0, 8)}
            </span>
          </div>
          <div>
            <h4 className={styles.simTitle}>Route Replay &amp; Sensor Telemetry</h4>
            <p className={styles.simSubtitle}>
              Interactive second-by-second telematics replay with dynamic Driver Satisfaction optimizer
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.playBtn}
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pause replay' : 'Start replay'}
          >
            {isPlaying ? '⏸ Pause' : progress >= 100 ? '🔄 Replay Again' : '▶ Play Drive'}
          </button>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            title="Reset to departure point"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            className={styles.speedToggleBtn}
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
            title="Toggle playback speed"
          >
            ⚡ {playbackSpeed}x Speed
          </button>
        </div>
      </div>

      {/* ─── Live Route HUD & Speedometer Cluster ──────────────── */}
      <div className={styles.hudGrid}>
        {/* Animated Road Track Box */}
        <div className={styles.trackBox}>
          <div className={styles.trackTopBar}>
            <span className={styles.trackWaypoint}>
              <span>🟢</span> Departure
            </span>
            <span className={styles.progressPill}>
              Route Progress: {Math.round(progress)}%
            </span>
            <span className={styles.trackWaypoint}>
              <span>🏁</span> Destination
            </span>
          </div>

          {/* SVG Road Track */}
          <div className={styles.roadSvgWrapper}>
            <svg
              className={styles.roadSvg}
              viewBox="0 0 360 76"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="roadGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="carGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Asphalt Road Base Path - EXPLICIT fill="none" */}
              <path
                d="M 25 38 Q 110 8, 195 38 T 335 38"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="12"
                strokeLinecap="round"
                className={styles.roadBaseTrack}
              />

              {/* Dashed Center White Line */}
              <path
                d="M 25 38 Q 110 8, 195 38 T 335 38"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className={styles.roadDashedLine}
              />

              {/* Animated Progress Path - EXPLICIT fill="none" */}
              <path
                d="M 25 38 Q 110 8, 195 38 T 335 38"
                fill="none"
                stroke="url(#roadGlowGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                className={styles.roadProgressTrack}
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: dashOffset,
                }}
              />

              {/* Checkpoint Rings */}
              <circle cx="25" cy="38" r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              <circle cx="335" cy="38" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

              {/* Animated Car Node */}
              <g
                transform={`translate(${carX - 13}, ${carY - 13})`}
                className={styles.carMarkerNode}
                filter="url(#carGlow)"
              >
                <circle cx="13" cy="13" r="14" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
                <text x="6" y="17" fontSize="13">🚗</text>
              </g>
            </svg>
          </div>

          {/* Interactive Scrubber Row */}
          <div className={styles.scrubberRow}>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                setProgress(Number(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className={styles.scrubber}
              aria-label="Trip Replay Timeline Scrubber"
            />
            <span className={styles.scrubberTime}>
              {Math.round((progress / 100) * trip.duration)}m / {trip.duration}m
            </span>
          </div>

          {/* Real-time Telemetry Event Ticker */}
          <div className={styles.ticker}>
            <div className={styles.tickerContent}>
              <span>{currentEvent.icon}</span>
              <span className={styles.tickerTitle}>{currentEvent.title}:</span>
              <span>{currentEvent.desc}</span>
            </div>
            <span className={styles.tickerDistance}>
              at {(progress * 0.01 * trip.distance).toFixed(1)} km
            </span>
          </div>
        </div>

        {/* Digital Speedometer & Live G-Force Cluster */}
        <div className={styles.gaugeBox}>
          <div className={styles.gaugeDialLabel}>LIVE TELEMATICS</div>
          <div className={styles.speedDisplay}>
            <span className={styles.speedNum}>{currentSpeed}</span>
            <span className={styles.speedUnit}>km/h</span>
          </div>
          <div className={styles.gForcePill}>
            <span>⚡</span>
            <span>Smooth: {(0.12 + (currentSpeed / 100) * 0.09).toFixed(2)}g</span>
          </div>
          <div className={styles.speedLimitFooter}>
            <span>🛡️</span> Limit: 50 km/h • Compliant
          </div>
        </div>
      </div>

      {/* ─── Telemetry Quality Strip (4 Distinct Spaced Cards) ── */}
      <div className={styles.telemetryStrip}>
        <div className={styles.telemetryPill}>
          <span className={styles.telemetryLabel}>Braking Deceleration</span>
          <div className={styles.telemetryValueRow}>
            <span className={styles.telemetryValue} style={{ color: '#10b981' }}>
              {brakingQuality}% Smooth
            </span>
            <span className={styles.telemetryBadge} style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
              Gentle
            </span>
          </div>
        </div>

        <div className={styles.telemetryPill}>
          <span className={styles.telemetryLabel}>Speed Limit Adherence</span>
          <div className={styles.telemetryValueRow}>
            <span className={styles.telemetryValue} style={{ color: '#0ea5e9' }}>
              {speedCompliance}% Match
            </span>
            <span className={styles.telemetryBadge} style={{ background: 'rgba(14,165,233,0.12)', color: '#0284c7' }}>
              Safe
            </span>
          </div>
        </div>

        <div className={styles.telemetryPill}>
          <span className={styles.telemetryLabel}>Commute Window</span>
          <div className={styles.telemetryValueRow}>
            <span
              className={styles.telemetryValue}
              style={{ color: timingChoice === 'offpeak' ? '#10b981' : '#f59e0b' }}
            >
              {timingChoice === 'offpeak' ? 'Off-Peak' : 'Rush Hour'}
            </span>
            <span
              className={styles.telemetryBadge}
              style={{
                background: timingChoice === 'offpeak' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                color: timingChoice === 'offpeak' ? '#059669' : '#d97706',
              }}
            >
              {timingChoice === 'offpeak' ? 'Optimal' : '+Risk'}
            </span>
          </div>
        </div>

        <div className={styles.telemetryPill}>
          <span className={styles.telemetryLabel}>Trip Distance</span>
          <div className={styles.telemetryValueRow}>
            <span className={styles.telemetryValue}>
              {trip.distance.toFixed(1)} km
            </span>
            <span className={styles.telemetryBadge} style={{ background: 'rgba(99,102,241,0.12)', color: '#4f46e5' }}>
              {trip.duration} min
            </span>
          </div>
        </div>
      </div>

      {/* ─── Driver Satisfaction What-If Tuning Simulator ─── */}
      <div className={styles.simSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionSparkle}>✨</span>
            <h5 className={styles.sectionTitle}>
              Driver Satisfaction Optimizer — Interactive What-If Tuning
            </h5>
          </div>
          <p className={styles.sectionSubtitle}>
            Simulate driving behavior improvements to visualize instant premium discounts and policy tier upgrades:
          </p>
        </div>

        <div className={styles.tuningGrid}>
          {/* Slider 1: Smooth Braking */}
          <div className={styles.tuningCard}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Smooth Braking Technique</span>
              <span className={styles.sliderValueBadge}>{brakingQuality}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={brakingQuality}
              onChange={(e) => setBrakingQuality(Number(e.target.value))}
              className={styles.sliderTrack}
              aria-label="Smooth Braking Technique"
            />
            <div className={styles.sliderLimitsRow}>
              <span>Frequent Hard Stops</span>
              <span>Gentle Coasting</span>
            </div>
          </div>

          {/* Slider 2: Speed Discipline */}
          <div className={styles.tuningCard}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Speed Limit Discipline</span>
              <span className={styles.sliderValueBadge}>{speedCompliance}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={speedCompliance}
              onChange={(e) => setSpeedCompliance(Number(e.target.value))}
              className={styles.sliderTrack}
              aria-label="Speed Limit Discipline"
            />
            <div className={styles.sliderLimitsRow}>
              <span>Minor Speeding</span>
              <span>Strict 100% Match</span>
            </div>
          </div>

          {/* Toggle 3: Time-of-Day Commute Window */}
          <div className={styles.tuningCard}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Time-of-Day Window</span>
              <span
                className={styles.sliderValueBadge}
                style={{
                  background: timingChoice === 'offpeak' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: timingChoice === 'offpeak' ? '#059669' : '#d97706',
                }}
              >
                {timingChoice === 'offpeak' ? 'Off-Peak' : 'Rush Hour'}
              </span>
            </div>
            <div className={styles.commuteToggleGroup}>
              <button
                type="button"
                onClick={() => setTimingChoice('offpeak')}
                className={`${styles.commutePillBtn} ${
                  timingChoice === 'offpeak' ? styles.commutePillActiveSafe : styles.commutePillInactive
                }`}
              >
                <span>🟢</span> Off-Peak
              </button>
              <button
                type="button"
                onClick={() => setTimingChoice('peak')}
                className={`${styles.commutePillBtn} ${
                  timingChoice === 'peak' ? styles.commutePillActivePeak : styles.commutePillInactive
                }`}
              >
                <span>⚠️</span> Rush Hour
              </button>
            </div>
            <div className={styles.sliderLimitsRow}>
              <span>Daylight / Low Traffic</span>
              <span>Heavy Congestion</span>
            </div>
          </div>
        </div>

        {/* Dynamic Driver Satisfaction Outcome Banner */}
        <div className={styles.outcomeBanner}>
          <div className={styles.outcomeStatsGroup}>
            {/* Projected Score */}
            <div className={styles.outcomeStatCol}>
              <span className={styles.outcomeStatLabel}>Projected Score</span>
              <div className={styles.outcomeStatNumRow}>
                <span className={styles.outcomeStatNum}>{simulatedScore}</span>
                <span className={styles.outcomeDeltaBadge}>
                  {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts
                </span>
              </div>
            </div>

            {/* Simulated Savings */}
            <div className={styles.outcomeStatCol}>
              <span className={styles.outcomeStatLabel}>Simulated Savings</span>
              <div className={styles.outcomeStatNumRow}>
                <span className={`${styles.outcomeStatNum} ${styles.outcomeStatNumSavings}`}>
                  ₹{simulatedSavings}
                </span>
                {extraSavings > 0 && (
                  <span className={styles.outcomeDeltaBadge}>
                    +₹{extraSavings}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Coaching Feedback */}
          <div className={styles.outcomeFeedback}>
            {simulatedScore >= 90 ? (
              <span>
                🌟 <strong>Super Safe Driver!</strong> Maintaining this smooth braking and disciplined speed on trips like this can save you over <strong>₹1,650/year</strong> on your DriveFair policy.
              </span>
            ) : simulatedScore >= 80 ? (
              <span>
                👍 <strong>Good Driving Quality!</strong> Boosting smooth braking by 10% will unlock safe driver tier rewards on your next billing cycle.
              </span>
            ) : (
              <span>
                ⚠️ <strong>Higher Risk Profile.</strong> Heavy traffic and sudden braking reduce your savings. Try shifting off-peak to save up to <strong>₹35 more per trip</strong>.
              </span>
            )}
          </div>

          {/* Full Simulator CTA */}
          {onOpenFullSimulator && (
            <button
              type="button"
              onClick={onOpenFullSimulator}
              className={styles.fullSimulatorBtn}
            >
              Open Full Trip Simulator →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
