'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SafeDriveLeafletMap.module.css';

export interface DestinationRoute {
  id: string;
  name: string;
  dist: string;
  eta: string;
  highway: string;
  coords: [number, number]; // [lat, lng]
  waypoints: [number, number][];
}

export const LEAFLET_DESTINATIONS: DestinationRoute[] = [
  {
    id: 'sfo',
    name: 'SFO International Airport (Terminal 2)',
    dist: '4.2 mi',
    eta: '8 mins',
    highway: 'US-101 South',
    coords: [37.6213, -122.3790],
    waypoints: [
      [37.7879, -122.4074], // Market St
      [37.7735, -122.4120], // 101 entrance
      [37.7550, -122.4050], // Bayshore
      [37.7280, -122.4010], // Silver Ave
      [37.7080, -122.4020], // Cow Palace
      [37.6820, -122.3990], // Brisbane
      [37.6580, -122.3960], // South SF
      [37.6390, -122.3980], // San Bruno
      [37.6213, -122.3790], // SFO Terminal 2
    ],
  },
  {
    id: 'goldengate',
    name: 'Golden Gate Bridge Vista Point',
    dist: '6.8 mi',
    eta: '16 mins',
    highway: 'Presidio Pkwy',
    coords: [37.8280, -122.4830],
    waypoints: [
      [37.7879, -122.4074], // Union Square
      [37.7940, -122.4180], // Nob Hill
      [37.8010, -122.4350], // Lombard St
      [37.8020, -122.4550], // Presidio Richardson
      [37.8100, -122.4700], // Doyle Dr
      [37.8199, -122.4783], // Golden Gate Toll
      [37.8280, -122.4830], // North Vista Point
    ],
  },
  {
    id: 'wharf',
    name: 'Fisherman’s Wharf Pier 39',
    dist: '3.4 mi',
    eta: '12 mins',
    highway: 'The Embarcadero',
    coords: [37.8087, -122.4098],
    waypoints: [
      [37.7879, -122.4074], // Union Square
      [37.7925, -122.3995], // Market / Embarcadero
      [37.7985, -122.3970], // Ferry Building
      [37.8040, -122.4010], // Pier 27
      [37.8087, -122.4098], // Pier 39
    ],
  },
  {
    id: 'silicon',
    name: 'Silicon Valley Hub (Palo Alto)',
    dist: '18.6 mi',
    eta: '24 mins',
    highway: 'I-280 South',
    coords: [37.4419, -122.1430],
    waypoints: [
      [37.7879, -122.4074],
      [37.7550, -122.4050],
      [37.6820, -122.3990],
      [37.6213, -122.3790],
      [37.5500, -122.3100], // San Mateo
      [37.4900, -122.2400], // Redwood City
      [37.4419, -122.1430], // Palo Alto
    ],
  },
];

interface SafeDriveLeafletMapProps {
  selectedDestination: DestinationRoute;
  onSelectDestination: (dest: DestinationRoute) => void;
  speed: number;
  speedUnit: string;
  isSimulating: boolean;
}

export const SafeDriveLeafletMap: React.FC<SafeDriveLeafletMapProps> = ({
  selectedDestination,
  onSelectDestination,
  speed,
  speedUnit,
  isSimulating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const vehicleMarkerRef = useRef<any>(null);
  const polylineGlowRef = useRef<any>(null);
  const polylineCoreRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);

  const [waypointIndex, setWaypointIndex] = useState<number>(2);
  const [currentCoord, setCurrentCoord] = useState<[number, number]>(selectedDestination.waypoints[2]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  // Initialize Leaflet Map safely in browser
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // already initialized

      const L = await import('leaflet');

      if (isCancelled || !mapContainerRef.current) return;

      // Create a dynamically injected inner container so Leaflet does not modify React's direct ref
      let innerContainer = mapContainerRef.current.querySelector('.leaflet-inner-target') as HTMLDivElement | null;
      if (!innerContainer) {
        innerContainer = document.createElement('div');
        innerContainer.className = 'leaflet-inner-target';
        innerContainer.style.width = '100%';
        innerContainer.style.height = '100%';
        mapContainerRef.current.appendChild(innerContainer);
      }

      // Clear any prior Leaflet ID attribute from reuse
      if ((innerContainer as any)._leaflet_id) {
        delete (innerContainer as any)._leaflet_id;
      }

      // Create Leaflet Map Instance on the inner container
      const initialCenter = selectedDestination.waypoints[2] || [37.7749, -122.4194];
      const map = L.map(innerContainer, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Free OpenStreetMap Standard Tiles (Clean, fast, NO API Key watermark)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Attribution control in subtle bottom right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" style="color:#64748b">OpenStreetMap</a> contributors')
        .addTo(map);

      // Create Custom SVG DivIcons for Light Theme
      const vehicleDivIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; transform: translate(-50%, -50%);">
            <div style="position:absolute; width:42px; height:42px; border-radius:50%; background:rgba(79, 70, 229, 0.2); animation: vehiclePulse 2s infinite ease-out;"></div>
            <div style="position:absolute; width:28px; height:28px; border-radius:50%; background:#ffffff; border: 2.5px solid #4f46e5; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#4f46e5"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const originDivIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `
          <div style="transform: translate(-50%, -50%); display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#4f46e5; border:2px solid #ffffff; box-shadow:0 3px 10px rgba(79,70,229,0.35);">
            <span style="font-size:12px; font-weight:800; color:#ffffff;">A</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const destDivIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="transform: translate(-50%, -50%); display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#0284c7; border:2px solid #ffffff; box-shadow:0 3px 10px rgba(2,132,199,0.35);">
            <span style="font-size:12px; font-weight:800; color:#ffffff;">B</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      // Polylines (Sleek Indigo Route Line with Soft Aura)
      const glow = L.polyline(selectedDestination.waypoints, {
        color: '#818cf8',
        weight: 10,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const core = L.polyline(selectedDestination.waypoints, {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Markers
      const originPt = selectedDestination.waypoints[0];
      const destPt = selectedDestination.waypoints[selectedDestination.waypoints.length - 1];
      const vehiclePt = selectedDestination.waypoints[2];

      const originMarker = L.marker(originPt, { icon: originDivIcon })
        .bindTooltip('Origin: Union Square, SF', { direction: 'top', className: styles.lightTooltip })
        .addTo(map);

      const destMarker = L.marker(destPt, { icon: destDivIcon })
        .bindTooltip(`Destination: ${selectedDestination.name}`, { direction: 'top', className: styles.lightTooltip })
        .addTo(map);

      const vehicleMarker = L.marker(vehiclePt, { icon: vehicleDivIcon })
        .bindTooltip(`Tesla Model 3 (${speed} ${speedUnit})`, { direction: 'top', className: styles.lightTooltip })
        .addTo(map);

      // Fit bounds to show route nicely
      map.fitBounds(core.getBounds(), { padding: [50, 50] });

      mapInstanceRef.current = map;
      polylineGlowRef.current = glow;
      polylineCoreRef.current = core;
      originMarkerRef.current = originMarker;
      destMarkerRef.current = destMarker;
      vehicleMarkerRef.current = vehicleMarker;

      setMapLoaded(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        const mapToDestroy = mapInstanceRef.current;
        mapInstanceRef.current = null;
        try {
          mapToDestroy.off();
          mapToDestroy.stop();
        } catch {
          // ignore
        }

        // Defer removal to next event tick so React finishes unmounting host nodes first
        setTimeout(() => {
          try {
            mapToDestroy.remove();
          } catch {
            // ignore
          }
        }, 0);
      }
    };
  }, []);

  // Update Route and Markers when Selected Destination changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    try {
      const map = mapInstanceRef.current;
      const waypoints = selectedDestination.waypoints;
      const originPt = waypoints[0];
      const destPt = waypoints[waypoints.length - 1];
      const vehiclePt = waypoints[Math.min(2, waypoints.length - 1)];

      if (polylineGlowRef.current) polylineGlowRef.current.setLatLngs(waypoints);
      if (polylineCoreRef.current) polylineCoreRef.current.setLatLngs(waypoints);
      if (originMarkerRef.current) originMarkerRef.current.setLatLng(originPt);
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng(destPt);
        destMarkerRef.current.setTooltipContent(`Destination: ${selectedDestination.name}`);
      }
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng(vehiclePt);
        vehicleMarkerRef.current.setTooltipContent(`Tesla Model 3 (${speed} ${speedUnit})`);
      }

      setWaypointIndex(2);
      setCurrentCoord(vehiclePt);

      if (polylineCoreRef.current) {
        map.fitBounds(polylineCoreRef.current.getBounds(), { padding: [50, 50], animate: true, duration: 1 });
      }
    } catch {
      // ignore
    }
  }, [selectedDestination, mapLoaded]);

  // Live Vehicle Simulation Along Leaflet Waypoints
  useEffect(() => {
    if (!isSimulating || !mapLoaded || !vehicleMarkerRef.current) return;

    const interval = setInterval(() => {
      setWaypointIndex((prevIdx) => {
        const waypoints = selectedDestination.waypoints;
        const nextIdx = (prevIdx + 1) % waypoints.length;
        const nextCoord = waypoints[nextIdx];

        if (vehicleMarkerRef.current && mapInstanceRef.current) {
          try {
            vehicleMarkerRef.current.setLatLng(nextCoord);
            vehicleMarkerRef.current.setTooltipContent(`Tesla Model 3 (${speed} ${speedUnit})`);
          } catch {
            // ignore
          }
        }
        setCurrentCoord(nextCoord);
        return nextIdx;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, mapLoaded, selectedDestination, speed, speedUnit]);

  // Map Controls (Zoom In, Zoom Out, Recenter to Vehicle)
  const handleZoomIn = () => {
    try {
      if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
    } catch {
      // ignore
    }
  };

  const handleZoomOut = () => {
    try {
      if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
    } catch {
      // ignore
    }
  };

  const handleRecenter = () => {
    try {
      if (mapInstanceRef.current && vehicleMarkerRef.current) {
        mapInstanceRef.current.setView(currentCoord, 14, { animate: true });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.mapCardWrap}>
      {/* Map Header with Waypoint Selector */}
      <div className={styles.mapHeaderBar}>
        <div className={styles.mapHeaderLeft}>
          <div className={styles.gpsSignalGroup}>
            <span className={styles.gpsPulseDot} />
            <span className={styles.gpsTitle}>Leaflet GPS Navigation</span>
          </div>
          <span className={styles.gpsLockedBadge}>5G RTK Precision</span>
        </div>

        <div className={styles.mapHeaderRight}>
          <button
            className={styles.destinationDropdownBtn}
            onClick={() => setShowPicker(!showPicker)}
            title="Switch Destination Route"
          >
            <span className={styles.destPinIcon}>📍</span>
            <span className={styles.destNameText}>{selectedDestination.name}</span>
            <span className={styles.dropdownChevron}>{showPicker ? '▴' : '▾'}</span>
          </button>
        </div>
      </div>

      {/* Destination Dropdown Menu */}
      {showPicker && (
        <div className={styles.destinationDropdownList}>
          {LEAFLET_DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              className={`${styles.destOptionItem} ${dest.id === selectedDestination.id ? styles.destOptionActive : ''}`}
              onClick={() => {
                onSelectDestination(dest);
                setShowPicker(false);
              }}
            >
              <div className={styles.optionDetails}>
                <span className={styles.optionTitle}>{dest.name}</span>
                <span className={styles.optionSub}>
                  via {dest.highway} • {dest.dist} • {dest.eta}
                </span>
              </div>
              {dest.id === selectedDestination.id && (
                <span className={styles.optionActiveCheck}>✓ Active</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Leaflet Map DOM Canvas */}
      <div className={styles.mapCanvasWrapper}>
        <div ref={mapContainerRef} className={styles.mapContainer} />

        {/* Live HUD Floating Overlay on Map */}
        <div className={styles.mapHudOverlay}>
          <div className={styles.hudWaypointBadge}>
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>Next:</span> {selectedDestination.highway}
          </div>
          <div className={styles.hudStatsBadge}>
            {selectedDestination.dist} • ETA {selectedDestination.eta}
          </div>
        </div>

        {/* Leaflet Custom Floating Zoom & Recenter Controls */}
        <div className={styles.mapControlsCluster}>
          <button
            className={styles.controlBtn}
            onClick={handleRecenter}
            title="Recenter on Vehicle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            </svg>
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};
