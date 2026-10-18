'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import styles from './ProfilePage.module.css';

const MOCK_USER = {
  name: 'Asha Kumar',
  email: 'asha.kumar@drivefair.in',
  phone: '+91 98765 43210',
  vehicle: 'Honda City 2022',
  plateNumber: 'KA-01-HH-1234',
  vehicleType: 'Sedan',
  fuelType: 'Petrol',
  policyNumber: 'DF-2024-001923',
  policyStart: '01 April 2024',
  policyEnd: '31 March 2025',
  coverageType: 'Comprehensive',
  ncbDiscount: '20%',
  joinedDate: 'March 2024',
  totalTrips: 156,
  totalDistance: 2847,
  avgScore: 84,
  totalSaved: 3120,
};

const BADGES = [
  { icon: '★', label: 'Safe Driver',      color: '#10b981', earned: true  },
  { icon: '▲', label: 'Eco Champion',     color: '#6366f1', earned: true  },
  { icon: '●', label: 'Night Owl',        color: '#0ea5e9', earned: false },
  { icon: '■', label: 'Smooth Braker',    color: '#f59e0b', earned: true  },
  { icon: '◆', label: '1000km Club',      color: '#8b5cf6', earned: true  },
  { icon: '▼', label: 'Speed Free',       color: '#ec4899', earned: false },
];

export const ProfilePage: React.FC = () => {
  const {
    recentTrips,
    currentPremium,
    standardPremium,
    showToast,
    logout,
    navigateTo,
    currentUser,
    updateUserProfile,
  } = useApp();

  const user = {
    name: currentUser?.driverName || 'Asha Kumar',
    email: currentUser?.email || 'asha.kumar@drivefair.in',
    phone: currentUser?.phone || '+91 98765 43210',
    licenseId: currentUser?.licenseId || 'DL-042022001928',
    vehicle: currentUser?.vehicleModel || 'Honda City 2022',
    plateNumber: currentUser?.vehicleNo || 'KA-01-HH-1234',
    vehicleType: currentUser?.vehicleType || 'Sedan',
    fuelType: currentUser?.fuelType || 'Petrol',
    policyNumber: currentUser?.policyNumber || 'DF-2024-001923',
    policyStart: currentUser?.policyStart || '01 April 2024',
    policyEnd: currentUser?.policyEnd || '31 March 2025',
    coverageType: currentUser?.coverageType || 'Comprehensive Telematics',
    ncbDiscount: currentUser?.ncbDiscount || '20%',
    joinedDate: currentUser?.joinedDate || 'March 2024',
    totalTrips: currentUser?.totalTrips ?? (recentTrips.length + 25),
    totalDistance: currentUser?.totalDistance ?? 2847,
    avgScore: currentUser?.avgScore ?? 84,
    totalSaved: currentUser?.totalSaved ?? 3120,
  };

  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(user.phone);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifApp, setNotifApp] = useState(true);

  const handleSave = () => {
    setEditMode(false);
    updateUserProfile({ phone });
    showToast('Profile updated successfully.', 'success');
  };

  const handleDeleteData = () => {
    showToast('Data deletion request submitted. You will receive confirmation within 72 hours.', 'info');
  };

  const handleExportData = () => {
    showToast('Exporting all your data... Download will start shortly.', 'success');
  };

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'DF';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.avatarBadge}>{user.avgScore}</div>
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{user.name}</h1>
          <p className={styles.profileEmail}>{user.email}</p>
          <div className={styles.profileMeta}>
            <span className={styles.metaPill}>Member since {user.joinedDate}</span>
            <span className={styles.metaPill}>Policy: {user.policyNumber}</span>
            <span className={`${styles.metaPill} ${styles.metaActive}`}>Active</span>
          </div>
        </div>
        <div className={styles.profileActions}>
          {!editMode ? (
            <button className={styles.editBtn} onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>
              <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row — full width */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Trips', val: user.totalTrips, unit: 'trips', prefix: '' },
          { label: 'Distance Driven', val: user.totalDistance, unit: 'km', prefix: '' },
          { label: 'Avg Trip Score', val: user.avgScore, unit: '/100', prefix: '' },
          { label: 'Total Saved', val: user.totalSaved, unit: '', prefix: '₹' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statNum}>
              {s.prefix}
              {s.val.toLocaleString('en-IN')}
              {s.unit && <span className={styles.statUnit}>{s.unit}</span>}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Personal Info + Vehicle */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Personal Information</h3>
          <div className={styles.fields}>
            {[
              { label: 'Full Name', val: user.name },
              { label: 'Email Address', val: user.email },
              { label: 'Driver License ID', val: user.licenseId },
              { label: 'Member Since', val: user.joinedDate },
            ].map((f) => (
              <div key={f.label} className={styles.field}>
                <label className={styles.fieldLabel}>{f.label}</label>
                <div className={styles.fieldVal}>{f.val}</div>
              </div>
            ))}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone Number</label>
              {editMode ? (
                <input
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              ) : (
                <div className={styles.fieldVal}>{phone}</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Vehicle Details</h3>
          <div className={styles.vehicleCard}>
            <div className={styles.vehicleIcon}>🚗</div>
            <div>
              <div className={styles.vehicleName}>{user.vehicle}</div>
              <div className={styles.vehiclePlate}>{user.plateNumber}</div>
            </div>
          </div>
          <div className={styles.fields}>
            {[
              { label: 'Vehicle Type', val: user.vehicleType },
              { label: 'Fuel Type', val: user.fuelType },
              { label: 'Coverage', val: user.coverageType },
            ].map(f => (
              <div key={f.label} className={styles.field}>
                <label className={styles.fieldLabel}>{f.label}</label>
                <div className={styles.fieldVal}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Policy + Badges */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Policy Details</h3>
          <div className={styles.fields}>
            {[
              { label: 'Policy Number',   val: user.policyNumber, saving: false },
              { label: 'Coverage Type',   val: user.coverageType, saving: false },
              { label: 'Policy Start',    val: user.policyStart,  saving: false },
              { label: 'Policy End',      val: user.policyEnd,    saving: false },
              { label: 'NCB Discount',    val: user.ncbDiscount,  saving: false },
              { label: 'Monthly Premium', val: `₹${currentPremium.toLocaleString('en-IN')}`, saving: false },
              { label: 'Standard Rate',   val: `₹${standardPremium.toLocaleString('en-IN')}`, saving: false },
              { label: 'Your Savings',    val: `₹${(standardPremium - currentPremium).toLocaleString('en-IN')}/mo`, saving: true },
            ].map(f => (
              <div key={f.label} className={styles.field}>
                <label className={styles.fieldLabel}>{f.label}</label>
                <div className={`${styles.fieldVal} ${f.saving ? styles.saving : ''}`}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Achievement Badges</h3>
          <div className={styles.badgesGrid}>
            {BADGES.map(b => (
              <div key={b.label} className={`${styles.badge} ${b.earned ? '' : styles.badgeLocked}`}>
                <div className={styles.badgeIcon} style={b.earned ? { background: `${b.color}18`, color: b.color } : {}}>
                  {b.earned ? b.icon : '?'}
                </div>
                <div className={styles.badgeLabel}>{b.label}</div>
                <div className={styles.badgeStatus}>{b.earned ? 'Earned' : 'Locked'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Notifications + Privacy */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Notification Preferences</h3>
          <div className={styles.toggleList}>
            {[
              { label: 'Email alerts',        sub: 'Trip scores and premium changes', val: notifEmail, set: setNotifEmail },
              { label: 'SMS notifications',   sub: 'Critical alerts only',           val: notifSms,   set: setNotifSms   },
              { label: 'In-app notifications',sub: 'Real-time trip events',          val: notifApp,   set: setNotifApp   },
            ].map(n => (
              <div key={n.label} className={styles.toggleItem}>
                <div>
                  <div className={styles.toggleLabel}>{n.label}</div>
                  <div className={styles.toggleSub}>{n.sub}</div>
                </div>
                <button
                  className={`${styles.toggle} ${n.val ? styles.toggleOn : ''}`}
                  onClick={() => { n.set(!n.val); showToast(`${n.label} ${!n.val ? 'enabled' : 'disabled'}.`, 'success'); }}
                  role="switch" aria-checked={n.val}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Data &amp; Privacy</h3>
          <p className={styles.privacyText}>You have full control over your data. Export a copy or request deletion at any time.</p>
          <div className={styles.privacyActions}>
            <button className={styles.outlineBtn} onClick={handleExportData}>Export My Data</button>
            <button className={styles.outlineBtn} onClick={() => navigateTo('consent')}>Manage Consent</button>
            <button className={`${styles.outlineBtn} ${styles.dangerBtn}`} onClick={handleDeleteData}>Request Data Deletion</button>
          </div>
        </div>
      </div>

      {/* Row 4: Appearance & Account */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Appearance &amp; Theme</h3>
          <div className={styles.toggleItem}>
            <div>
              <div className={styles.toggleLabel}>Dual Mode Display</div>
              <div className={styles.toggleSub}>Toggle between Light and Dark interface theme</div>
            </div>
            <ThemeToggle size="md" id="profile-theme-toggle" />
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Account &amp; Session</h3>
          <p className={styles.privacyText}>Signed in as {user.name} ({user.email})</p>
          <button
            className={styles.signOutBtn}
            onClick={() => { logout(); showToast('Signed out successfully.', 'info'); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

  );
};
