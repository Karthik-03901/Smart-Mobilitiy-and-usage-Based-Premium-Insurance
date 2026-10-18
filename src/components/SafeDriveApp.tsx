'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { ErrorBoundary } from './ErrorBoundary';
import { LEAFLET_DESTINATIONS, DestinationRoute } from './SafeDriveLeafletMap';
import styles from './SafeDriveApp.module.css';

// Client-only dynamic import of the Leaflet Map
const SafeDriveLeafletMap = dynamic(
  () => import('./SafeDriveLeafletMap').then((mod) => mod.SafeDriveLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapLoadingPlaceholder}>
        <div className={styles.mapSpinner} />
        <span>Initializing Leaflet 5G GPS Telematics...</span>
      </div>
    ),
  }
);

interface SafetyEvent {
  id: string;
  time: string;
  icon: string;
  title: string;
  impact: string;
  type: 'positive' | 'neutral';
}

const INITIAL_EVENTS: SafetyEvent[] = [
  { id: '1', time: 'Just now', icon: '⚡', title: 'Speed maintained safely within limit', impact: '+0.4 pts', type: 'positive' },
  { id: '2', time: '2m ago', icon: '🛡️', title: 'Gentle deceleration approaching highway ramp', impact: '+0.8 pts', type: 'positive' },
  { id: '3', time: '6m ago', icon: '📱', title: 'Zero phone interactions detected', impact: '+1.2 pts', type: 'positive' },
];

export const SafeDriveApp: React.FC = () => {
  const { currentUser, showToast, theme, toggleTheme } = useApp();

  // Telematics State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [speedUnit, setSpeedUnit] = useState<'mph' | 'km/h'>('mph');
  const [speed, setSpeed] = useState<number>(58);
  const [brakingScore, setBrakingScore] = useState<number>(94);
  const [speedScore, setSpeedScore] = useState<number>(98);
  const [corneringScore] = useState<number>(91);
  const [distractionScore] = useState<number>(100);
  const [overallScore, setOverallScore] = useState<number>(92);
  const [events, setEvents] = useState<SafetyEvent[]>(INITIAL_EVENTS);

  // Leaflet Route State
  const [selectedDestination, setSelectedDestination] = useState<DestinationRoute>(LEAFLET_DESTINATIONS[0]);
  const [isLocationShared, setIsLocationShared] = useState<boolean>(false);

  // Roadside Assistance & Emergency
  const [activeRsa, setActiveRsa] = useState<{ id: string; title: string; tech: string; eta: string } | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState<number>(5);
  const emergencyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const policyNo = currentUser?.policyNumber || 'P-19284-A';
  const driverName = currentUser?.driverName || 'Alex Mercer';
  const speedLimit = speedUnit === 'mph' ? 65 : 105;

  // Real-time speed & score simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSpeed((prev) => {
        const delta = (Math.random() - 0.49) * 2.5;
        const targetBase = speedUnit === 'mph' ? 58 : 94;
        return Math.round(Math.min(targetBase + 5, Math.max(targetBase - 5, prev + delta)));
      });

      setOverallScore((prev) => {
        const delta = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.min(97, Math.max(88, prev + delta));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, speedUnit]);

  // Emergency SOS Countdown Timer
  useEffect(() => {
    if (showEmergencyModal && emergencyCountdown > 0) {
      emergencyTimerRef.current = setTimeout(() => {
        setEmergencyCountdown((c) => c - 1);
      }, 1000);
    } else if (emergencyCountdown === 0 && showEmergencyModal) {
      showToast('🚨 Emergency dispatch broadcast confirmed to local authorities.', 'info');
    }
    return () => {
      if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    };
  }, [showEmergencyModal, emergencyCountdown, showToast]);

  const handleToggleSpeedUnit = () => {
    if (speedUnit === 'mph') {
      setSpeedUnit('km/h');
      setSpeed(Math.round(speed * 1.60934));
    } else {
      setSpeedUnit('mph');
      setSpeed(Math.round(speed / 1.60934));
    }
  };

  const handleSimulateBrake = () => {
    setSpeed((s) => Math.max(20, s - 16));
    setBrakingScore((b) => Math.max(82, b - 3));
    const newEvent: SafetyEvent = {
      id: Date.now().toString(),
      time: 'Just now',
      icon: '⚡',
      title: 'Smooth deceleration evaluated on route',
      impact: '+0.5 pts',
      type: 'positive',
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 3)]);
    showToast('Braking deceleration event evaluated as smooth & controlled.', 'info');
  };

  const handleToggleRsa = (id: string, title: string) => {
    if (activeRsa?.id === id) {
      setActiveRsa(null);
      showToast(`${title} request cancelled.`, 'info');
      return;
    }
    setActiveRsa({
      id,
      title,
      tech: 'Marcus Vance • Mobile Patrol #14',
      eta: '8 mins',
    });
    showToast(`Dispatched ${title}! Patrol vehicle en route (ETA 8 mins).`, 'info');
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageInner}>

        {/* ─── Top Control Bar ─── */}
        <header className={styles.topBar}>
          <div className={styles.barLeft}>
            <div className={styles.statusPulseGroup}>
              <span className={styles.pulseDot} />
              <span className={styles.liveLabel}>LIVE TELEMATICS</span>
            </div>
            <div className={styles.vehicleInfo}>
              <strong>Tesla Model 3</strong>
              <span className={styles.bulletDot}>•</span>
              <span>CA 8XYZ921</span>
              <span className={styles.bulletDot}>•</span>
              <span>Policy #{policyNo}</span>
              <span className={styles.bulletDot}>•</span>
              <span className={styles.driverTag}>{driverName}</span>
            </div>
          </div>

          <div className={styles.barRight}>
            {/* White / Dark Theme Toggle Controls */}
            <div className={styles.themeToggleContainer} id="safedrive-theme-toggle-wrap">
              <div className={styles.themeSegmentedGroup} role="group" aria-label="Theme Mode Selector">
                <button
                  id="safedrive-theme-white-btn"
                  type="button"
                  className={`${styles.themeSegmentItem} ${theme !== 'dark' ? styles.themeSegmentItemActive : ''}`}
                  onClick={() => {
                    if (theme === 'dark') {
                      toggleTheme();
                      showToast('Switched to White Mode', 'info');
                    }
                  }}
                  title="Switch to White (Light) Mode"
                  aria-pressed={theme !== 'dark'}
                >
                  ☀️ White
                </button>
                <button
                  id="safedrive-theme-dark-btn"
                  type="button"
                  className={`${styles.themeSegmentItem} ${theme === 'dark' ? styles.themeSegmentItemActive : ''}`}
                  onClick={() => {
                    if (theme !== 'dark') {
                      toggleTheme();
                      showToast('Switched to Dark Mode', 'info');
                    }
                  }}
                  title="Switch to Dark Mode"
                  aria-pressed={theme === 'dark'}
                >
                  🌙 Dark
                </button>
              </div>

              <ThemeToggle size="sm" id="safedrive-theme-btn" />
            </div>

            <button
              className={styles.pillButton}
              onClick={handleToggleSpeedUnit}
              title="Toggle Velocity Unit"
            >
              Unit: <strong>{speedUnit.toUpperCase()}</strong>
            </button>

            <button
              className={`${styles.pillButton} ${isSimulating ? styles.pillButtonActive : ''}`}
              onClick={() => {
                setIsSimulating(!isSimulating);
                showToast(isSimulating ? 'Driving simulation paused' : 'Driving simulation resumed', 'info');
              }}
            >
              {isSimulating ? '⏸ Pause Sim' : '▶ Resume Sim'}
            </button>

            <button
              className={styles.pillButton}
              onClick={handleSimulateBrake}
              title="Test Brake Deceleration"
            >
              ⚡ Test Brake
            </button>

            <button
              id="safedrive-emergency-btn"
              className={styles.sosButton}
              onClick={() => {
                setEmergencyCountdown(5);
                setShowEmergencyModal(true);
              }}
            >
              🚨 Emergency SOS
            </button>
          </div>
        </header>

        {/* ─── Main 2-Column Grid: Leaflet GPS Map + Instrumentation & Score ─── */}
        <section className={styles.mainGrid} id="safedrive-screen-hud">
          {/* Left Column: Leaflet GPS Navigation & Turn-by-Turn Cue */}
          <div className={styles.mapColumn}>
            <ErrorBoundary componentName="Leaflet GPS Navigation">
              <SafeDriveLeafletMap
                selectedDestination={selectedDestination}
                onSelectDestination={(dest) => {
                  setSelectedDestination(dest);
                  showToast(`Waypoint updated to ${dest.name} via ${dest.highway}`, 'info');
                }}
                speed={speed}
                speedUnit={speedUnit}
                isSimulating={isSimulating}
              />
            </ErrorBoundary>

            {/* Turn-by-Turn Cue & Live Safety Feed */}
            <div className={styles.cueAndFeedRow}>
              <div className={styles.cueBox}>
                <div className={styles.cueIcon}>↗</div>
                <div>
                  <div className={styles.cueNext}>NEXT MANEUVER (IN 800M)</div>
                  <div className={styles.cueText}>Keep left towards Airport Blvd & Main Terminal</div>
                </div>
              </div>

              <div className={styles.eventFeedBox}>
                <div className={styles.feedTitle}>RECENT SAFETY TELEMETRY</div>
                <div className={styles.eventList}>
                  {events.map((ev) => (
                    <div key={ev.id} className={styles.eventItem}>
                      <span className={styles.eventIcon}>{ev.icon}</span>
                      <span className={styles.eventTitle}>{ev.title}</span>
                      <span className={styles.eventImpact}>{ev.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cockpit Telemetry HUD & Master Safety Score */}
          <div className={styles.rightColumn}>
            {/* Speedometer & Live Gauges */}
            <div className={styles.cleanCard}>
              <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                  <span className={styles.cardHeaderIcon}>⚡</span>
                  <h2 className={styles.cardTitle}>Driving Instrumentation</h2>
                </div>
                <span className={styles.activeBadge}>5G Synced</span>
              </div>

              {/* Speed Display */}
              <div className={styles.speedDisplay}>
                <div className={styles.speedValueWrap}>
                  <span className={styles.speedDigit}>{speed}</span>
                  <span className={styles.speedUnit}>{speedUnit}</span>
                </div>

                <div className={styles.speedMetaWrap}>
                  <div className={styles.limitTag}>
                    SPEED LIMIT <strong>{speedLimit} {speedUnit}</strong>
                  </div>
                  <div className={styles.complianceTag}>
                    <span className={styles.checkIcon}>✓</span>
                    <span>Compliant Speed</span>
                  </div>
                </div>
              </div>

              {/* Sub-telemetry Metrics */}
              <div className={styles.telemetryBar}>
                <div className={styles.telemetryStat}>
                  <span className={styles.statLabel}>Braking</span>
                  <span className={styles.statValue}>{brakingScore}%</span>
                  <span className={styles.statSub}>Smooth</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.telemetryStat}>
                  <span className={styles.statLabel}>Accel</span>
                  <span className={styles.statValue}>+0.3g</span>
                  <span className={styles.statSub}>Gentle</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.telemetryStat}>
                  <span className={styles.statLabel}>Gap</span>
                  <span className={styles.statValue}>3.4s</span>
                  <span className={styles.statSub}>Safe</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.actionRow}>
                <button
                  className={`${styles.actionBtnOutline} ${isLocationShared ? styles.actionBtnActive : ''}`}
                  onClick={() => {
                    setIsLocationShared(!isLocationShared);
                    showToast(!isLocationShared ? 'Emergency beacon broadcasted to trusted contacts.' : 'Beacon deactivated.', 'info');
                  }}
                >
                  {isLocationShared ? '● Beacon Sharing Active' : 'Share Live Beacon'}
                </button>
                <button
                  className={styles.actionBtnOutline}
                  onClick={() => showToast('Calling DriveFair 24/7 Hotline: 1800-DRIVEFAIR', 'info')}
                >
                  24/7 Hotline
                </button>
              </div>
            </div>

            {/* Safety Score & Reward Card */}
            <div className={styles.cleanCard} id="safedrive-screen-insights">
              <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                  <span className={styles.cardHeaderIcon}>🛡️</span>
                  <h2 className={styles.cardTitle}>Safety Score & Reward</h2>
                </div>
                <span className={styles.tierPill}>Tier 1 Safe Driver</span>
              </div>

              {/* Score Ring & Reward */}
              <div className={styles.scoreHeroRow}>
                <div className={styles.scoreCircle}>
                  <svg className={styles.scoreSvg} viewBox="0 0 100 100">
                    <circle className={styles.circleBg} cx="50" cy="50" r="40" />
                    <circle
                      className={styles.circleFill}
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
                    />
                  </svg>
                  <div className={styles.scoreInner}>
                    <span className={styles.scoreBig}>{overallScore}</span>
                    <span className={styles.scoreMax}>/ 100</span>
                  </div>
                </div>

                <div className={styles.discountCard}>
                  <span className={styles.discountPre}>MONTHLY REWARD</span>
                  <div className={styles.discountAmount}>25% Premium Discount</div>
                  <div className={styles.discountSub}>Saving ₹1,450 on next renewal</div>
                  <div className={styles.streakBadge}>🔥 14-Day Safe Driving Streak</div>
                </div>
              </div>

              {/* Factors */}
              <div className={styles.factorsList}>
                <div className={styles.factorItem}>
                  <div className={styles.factorLabelRow}>
                    <span>Speed Compliance</span>
                    <span className={styles.factorScore}>{speedScore}%</span>
                  </div>
                  <div className={styles.factorTrack}>
                    <div className={styles.factorFill} style={{ width: `${speedScore}%`, background: '#38bdf8' }} />
                  </div>
                </div>

                <div className={styles.factorItem}>
                  <div className={styles.factorLabelRow}>
                    <span>Smooth Braking</span>
                    <span className={styles.factorScore}>{brakingScore}%</span>
                  </div>
                  <div className={styles.factorTrack}>
                    <div className={styles.factorFill} style={{ width: `${brakingScore}%`, background: '#6366f1' }} />
                  </div>
                </div>

                <div className={styles.factorItem}>
                  <div className={styles.factorLabelRow}>
                    <span>Cornering Stability</span>
                    <span className={styles.factorScore}>{corneringScore}%</span>
                  </div>
                  <div className={styles.factorTrack}>
                    <div className={styles.factorFill} style={{ width: `${corneringScore}%`, background: '#10b981' }} />
                  </div>
                </div>

                <div className={styles.factorItem}>
                  <div className={styles.factorLabelRow}>
                    <span>Zero Phone Distractions</span>
                    <span className={styles.factorScore}>{distractionScore}%</span>
                  </div>
                  <div className={styles.factorTrack}>
                    <div className={styles.factorFill} style={{ width: `${distractionScore}%`, background: '#a855f7' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom Section: Roadside Assistance 24/7 ─── */}
        <section className={styles.rsaSection} id="safedrive-screen-rsa">
          <div className={styles.cleanCard}>
            <div className={styles.cardHeader}>
              <div className={styles.titleGroup}>
                <span className={styles.cardHeaderIcon}>🛠️</span>
                <h2 className={styles.cardTitle}>Roadside Assistance & Fleet Patrol</h2>
              </div>
              <span className={styles.policyCoveredTag}>Complimentary Policy Benefit • ₹0 Deductible</span>
            </div>

            {/* Active Dispatch Banner if triggered */}
            {activeRsa && (
              <div className={styles.activeDispatchBanner}>
                <div className={styles.dispatchLeft}>
                  <span className={styles.dispatchPulse} />
                  <div>
                    <div className={styles.dispatchTitle}>
                      {activeRsa.title} — Patrol Dispatched (ETA {activeRsa.eta})
                    </div>
                    <div className={styles.dispatchSub}>
                      Assigned Technician: {activeRsa.tech}
                    </div>
                  </div>
                </div>
                <button
                  className={styles.dispatchCancelBtn}
                  onClick={() => setActiveRsa(null)}
                >
                  Cancel Request
                </button>
              </div>
            )}

            {/* 4 Clean Service Cards */}
            <div className={styles.rsaGrid}>
              <div className={styles.rsaCard}>
                <div className={styles.rsaCardTop}>
                  <div className={styles.rsaIconWrap}>🛞</div>
                  <div>
                    <h3 className={styles.rsaCardTitle}>Flat Tire</h3>
                    <p className={styles.rsaCardDesc}>Puncture seal or spare wheel mount</p>
                  </div>
                </div>
                <button
                  className={`${styles.rsaBtn} ${activeRsa?.id === 'tire' ? styles.rsaBtnActive : ''}`}
                  onClick={() => handleToggleRsa('tire', 'Flat Tire Service')}
                >
                  {activeRsa?.id === 'tire' ? '✓ Dispatched' : 'Request Assistance'}
                </button>
              </div>

              <div className={styles.rsaCard}>
                <div className={styles.rsaCardTop}>
                  <div className={styles.rsaIconWrap}>🔋</div>
                  <div>
                    <h3 className={styles.rsaCardTitle}>Battery Jump</h3>
                    <p className={styles.rsaCardDesc}>12V boost & auxiliary system check</p>
                  </div>
                </div>
                <button
                  className={`${styles.rsaBtn} ${activeRsa?.id === 'jump' ? styles.rsaBtnActive : ''}`}
                  onClick={() => handleToggleRsa('jump', 'Battery Jumpstart')}
                >
                  {activeRsa?.id === 'jump' ? '✓ Dispatched' : 'Request Assistance'}
                </button>
              </div>

              <div className={styles.rsaCard}>
                <div className={styles.rsaCardTop}>
                  <div className={styles.rsaIconWrap}>⚡</div>
                  <div>
                    <h3 className={styles.rsaCardTitle}>Fuel & EV Mobile</h3>
                    <p className={styles.rsaCardDesc}>5L fuel delivery or rapid EV mobile boost</p>
                  </div>
                </div>
                <button
                  className={`${styles.rsaBtn} ${activeRsa?.id === 'fuel' ? styles.rsaBtnActive : ''}`}
                  onClick={() => handleToggleRsa('fuel', 'Emergency Fuel / EV Boost')}
                >
                  {activeRsa?.id === 'fuel' ? '✓ Dispatched' : 'Request Assistance'}
                </button>
              </div>

              <div className={styles.rsaCard}>
                <div className={styles.rsaCardTop}>
                  <div className={styles.rsaIconWrap}>🚛</div>
                  <div>
                    <h3 className={styles.rsaCardTitle}>Flatbed Tow</h3>
                    <p className={styles.rsaCardDesc}>Safe transport to nearest certified garage</p>
                  </div>
                </div>
                <button
                  className={`${styles.rsaBtn} ${activeRsa?.id === 'tow' ? styles.rsaBtnActive : ''}`}
                  onClick={() => handleToggleRsa('tow', 'Flatbed Towing')}
                >
                  {activeRsa?.id === 'tow' ? '✓ Dispatched' : 'Request Assistance'}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ─── Emergency SOS Modal ─── */}
      {showEmergencyModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowEmergencyModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.sosModalTitle}>🚨 EMERGENCY SOS DISPATCH</h3>
              <button className={styles.modalClose} onClick={() => setShowEmergencyModal(false)}>✕</button>
            </div>

            <p className={styles.sosModalDesc}>
              Critical telematics distress beacon initiated for vehicle <strong>Tesla Model 3 (CA 8XYZ921)</strong>. Coordinates locked at Highway 101 South. Emergency response units will dispatch in:
            </p>

            <div className={styles.sosCountdown}>
              {emergencyCountdown > 0 ? `${emergencyCountdown}s` : 'DISPATCHED'}
            </div>

            <div className={styles.sosButtonRow}>
              <button
                className={styles.sosCancelBtn}
                onClick={() => {
                  setShowEmergencyModal(false);
                  showToast('Emergency SOS alert cancelled.', 'info');
                }}
              >
                Cancel (False Alarm)
              </button>
              <button
                className={styles.sosConfirmBtn}
                onClick={() => {
                  setEmergencyCountdown(0);
                  showToast('Emergency response teams dispatched immediately.', 'info');
                }}
              >
                Dispatch Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
