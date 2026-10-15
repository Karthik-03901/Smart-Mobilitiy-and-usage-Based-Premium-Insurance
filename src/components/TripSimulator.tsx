'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
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

export const TripSimulator: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [profile, setProfile] = useState<DrivingProfile>('average');
  const [tripData, setTripData] = useState<TripData>({
    distance: 0,
    duration: 0,
    speed: 0,
    maxSpeed: 0,
    harshBrakes: 0,
    harshAccelerations: 0,
    speedingTime: 0,
    nightDriving: 0,
    rushHourDriving: 0,
  });
  const [events, setEvents] = useState<TripEvent[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Profile configurations
  const profiles = {
    safe: {
      baseSpeed: 45,
      speedVariance: 10,
      brakeChance: 0.005,
      accelChance: 0.003,
      speedingChance: 0.02,
      maxSpeed: 65,
    },
    average: {
      baseSpeed: 55,
      speedVariance: 15,
      brakeChance: 0.015,
      accelChance: 0.012,
      speedingChance: 0.15,
      maxSpeed: 85,
    },
    risky: {
      baseSpeed: 70,
      speedVariance: 25,
      brakeChance: 0.035,
      accelChance: 0.030,
      speedingChance: 0.40,
      maxSpeed: 110,
    },
  };

  const addEvent = useCallback((type: TripEvent['type'], message: string) => {
    const event: TripEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
    };
    setEvents(prev => [event, ...prev].slice(0, 10));
  }, []);

  const generateTripData = useCallback(() => {
    const config = profiles[profile];
    const currentSpeed = Math.max(
      0,
      config.baseSpeed + (Math.random() - 0.5) * config.speedVariance
    );

    setTripData(prev => {
      const newData = { ...prev };
      const timeDelta = 0.1; // 100ms = 0.1 seconds
      
      // Update distance (km) and duration (seconds)
      newData.distance += (currentSpeed / 3600) * timeDelta;
      newData.duration += timeDelta;
      newData.speed = currentSpeed;
      newData.maxSpeed = Math.max(newData.maxSpeed, currentSpeed);

      // Check for harsh events
      if (Math.random() < config.brakeChance) {
        newData.harshBrakes += 1;
        addEvent('warning', `Harsh braking detected at ${currentSpeed.toFixed(0)} km/h`);
      }

      if (Math.random() < config.accelChance) {
        newData.harshAccelerations += 1;
        addEvent('warning', `Harsh acceleration detected`);
      }

      // Check for speeding (assuming 60 km/h limit)
      if (currentSpeed > 60) {
        newData.speedingTime += timeDelta;
        if (Math.random() < 0.01) {
          addEvent('danger', `Speeding: ${currentSpeed.toFixed(0)} km/h in 60 km/h zone`);
        }
      }

      // Night driving (11pm - 5am simulation)
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 5) {
        newData.nightDriving += timeDelta;
      }

      // Rush hour (7-9am, 5-7pm)
      if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
        newData.rushHourDriving += timeDelta;
      }

      return newData;
    });
  }, [profile, addEvent]);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#f1f3f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw road
    const roadY = canvas.height / 2;
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 60;
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(canvas.width, roadY);
    ctx.stroke();

    // Draw road markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(canvas.width, roadY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw car
    const carX = (Date.now() % 5000) / 5000 * canvas.width;
    const carY = roadY;
    
    // Car body
    ctx.fillStyle = tripData.speed > 60 ? '#e60000' : '#0080ff';
    ctx.fillRect(carX - 20, carY - 15, 40, 30);
    
    // Car windows
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(carX - 15, carY - 10, 12, 20);
    ctx.fillRect(carX + 3, carY - 10, 12, 20);

    // Speedometer arc
    const speedPercent = Math.min(tripData.speed / 120, 1);
    const startAngle = Math.PI;
    const endAngle = Math.PI + (Math.PI * speedPercent);
    
    ctx.strokeStyle = tripData.speed > 60 ? '#e60000' : '#00c767';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width - 60, canvas.height - 60, 40, startAngle, endAngle);
    ctx.stroke();

  }, [tripData.speed]);

  useEffect(() => {
    if (isActive && !isPaused) {
      const interval = setInterval(() => {
        generateTripData();
        drawMap();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, isPaused, generateTripData, drawMap]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    addEvent('info', `Trip started with ${profile} driving profile`);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    addEvent('info', isPaused ? 'Trip resumed' : 'Trip paused');
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    addEvent('info', `Trip completed: ${tripData.distance.toFixed(2)} km in ${(tripData.duration / 60).toFixed(1)} minutes`);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTripData({
      distance: 0,
      duration: 0,
      speed: 0,
      maxSpeed: 0,
      harshBrakes: 0,
      harshAccelerations: 0,
      speedingTime: 0,
      nightDriving: 0,
      rushHourDriving: 0,
    });
    setEvents([]);
    addEvent('info', 'Simulator reset');
  };

  const getStatusClass = () => {
    if (!isActive) return styles.idle;
    if (isPaused) return styles.paused;
    return styles.driving;
  };

  const getStatusText = () => {
    if (!isActive) return 'Idle';
    if (isPaused) return 'Paused';
    return 'Driving';
  };

  const calculateMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return styles.metricGood;
    if (value <= thresholds.warning) return styles.metricWarning;
    return styles.metricDanger;
  };

  return (
    <div className={styles.simulator}>
      <div className={styles.header}>
        <h2 className={styles.title}>Real-Time Trip Simulator</h2>
        <div className={`${styles.status} ${getStatusClass()}`}>
          <span className={styles.statusIndicator}></span>
          {getStatusText()}
        </div>
      </div>

      <div className={styles.mapContainer}>
        <canvas ref={canvasRef} className={styles.mapCanvas} />
        <div className={styles.mapOverlay}>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Speed</div>
            <div className={styles.mapStatValue}>
              {tripData.speed.toFixed(0)}
              <span className={styles.mapStatUnit}>km/h</span>
            </div>
          </div>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Distance</div>
            <div className={styles.mapStatValue}>
              {tripData.distance.toFixed(2)}
              <span className={styles.mapStatUnit}>km</span>
            </div>
          </div>
          <div className={styles.mapStat}>
            <div className={styles.mapStatLabel}>Time</div>
            <div className={styles.mapStatValue}>
              {(tripData.duration / 60).toFixed(1)}
              <span className={styles.mapStatUnit}>min</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Harsh Brakes</span>
          </div>
          <div className={styles.metricValue}>
            {tripData.harshBrakes}
            <span className={styles.metricUnit}>events</span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={`${styles.metricBarFill} ${calculateMetricColor(tripData.harshBrakes, { good: 2, warning: 5 })}`}
              style={{ width: `${Math.min((tripData.harshBrakes / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Harsh Acceleration</span>
          </div>
          <div className={styles.metricValue}>
            {tripData.harshAccelerations}
            <span className={styles.metricUnit}>events</span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={`${styles.metricBarFill} ${calculateMetricColor(tripData.harshAccelerations, { good: 2, warning: 5 })}`}
              style={{ width: `${Math.min((tripData.harshAccelerations / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Speeding Time</span>
          </div>
          <div className={styles.metricValue}>
            {((tripData.speedingTime / tripData.duration) * 100 || 0).toFixed(0)}
            <span className={styles.metricUnit}>%</span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={`${styles.metricBarFill} ${calculateMetricColor((tripData.speedingTime / tripData.duration) * 100, { good: 10, warning: 25 })}`}
              style={{ width: `${Math.min((tripData.speedingTime / tripData.duration) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Max Speed</span>
          </div>
          <div className={styles.metricValue}>
            {tripData.maxSpeed.toFixed(0)}
            <span className={styles.metricUnit}>km/h</span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={`${styles.metricBarFill} ${calculateMetricColor(tripData.maxSpeed, { good: 60, warning: 80 })}`}
              style={{ width: `${Math.min((tripData.maxSpeed / 120) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Driving Profile</label>
          <select 
            className={styles.select}
            value={profile}
            onChange={(e) => setProfile(e.target.value as DrivingProfile)}
            disabled={isActive}
          >
            <option value="safe">Safe Driver</option>
            <option value="average">Average Driver</option>
            <option value="risky">Risky Driver</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {!isActive ? (
            <Button variant="primary" onClick={handleStart}>
              Start Trip
            </Button>
          ) : (
            <>
              <Button variant="warning" onClick={handlePause}>
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="danger" onClick={handleStop}>
                End Trip
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {events.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Trip Events
          </h3>
          <div className={styles.eventsFeed}>
            {events.map(event => (
              <div key={event.id} className={`${styles.event} ${styles[`event${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`]}`}>
                <span className={styles.eventDot}></span>
                <div className={styles.eventContent}>
                  <div className={styles.eventMessage}>{event.message}</div>
                  <div className={styles.eventTime}>
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
