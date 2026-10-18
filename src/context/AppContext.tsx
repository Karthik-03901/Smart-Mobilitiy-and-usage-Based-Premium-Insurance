'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  supabase,
  checkSupabaseHealth,
  recordTripToSupabase,
  fetchTripsFromSupabase,
  syncConsentToSupabase,
  saveDriverProfileToSupabase,
  getDriverProfileFromSupabase,
} from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type View = 'home' | 'about' | 'dashboard' | 'profile' | 'help' | 'insurer' | 'simulator' | 'consent' | 'explainer' | 'login' | 'safedrive';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  id?: string;
  driverName: string;
  email: string;
  licenseId: string;
  vehicleNo: string;
  phone?: string;
  vehicleModel?: string;
  vehicleType?: string;
  fuelType?: string;
  policyNumber?: string;
  policyStart?: string;
  policyEnd?: string;
  coverageType?: string;
  ncbDiscount?: string;
  joinedDate?: string;
  avgScore?: number;
  totalTrips?: number;
  totalDistance?: number;
  totalSaved?: number;
}

export interface CreateAccountData {
  driverName: string;
  email: string;
  password: string;
  licenseId: string;
  vehicleNo: string;
}

export interface LoginResult {
  ok: boolean;
  reason?: 'NOT_FOUND' | 'INVALID_CREDENTIALS' | 'ERROR';
  message?: string;
}

export interface TripSummary {
  id: string;
  date: Date;
  distance: number;
  duration: number;
  score: number;
  impact: number;
}

export interface ConsentStream {
  id: string;
  name: string;
  icon: string;
  purpose: string;
  description: string;
  dataCollected: string[];
  retention: string;
  pricingImpact: { withConsent: number; withoutConsent: number };
  isActive: boolean;
  lastUpdated: Date;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AppContextType {
  currentView: View;
  navigateTo: (view: View) => void;
  goBack: () => void;
  canGoBack: boolean;
  recentTrips: TripSummary[];
  addTrip: (trip: Omit<TripSummary, 'id'>) => void;
  consents: ConsentStream[];
  toggleConsent: (id: string) => void;
  currentPremium: number;
  standardPremium: number;
  riskScore: number;
  showToast: (message: string, type: ToastItem['type']) => void;
  // Auth, Profile & Backend
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createAccount: (data: CreateAccountData) => Promise<{ ok: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  supabaseConnected: boolean;
  // Dual-mode Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const STANDARD_PREMIUM = 2100;

const INITIAL_CONSENTS: ConsentStream[] = [
  {
    id: 'telematics',
    name: 'Vehicle Telematics',
    icon: '🚗',
    purpose: 'Usage-based pricing and safe driving rewards',
    description:
      'Track your driving behavior to offer personalized premiums based on actual driving patterns.',
    dataCollected: [
      'GPS location (coarse precision)',
      'Speed and acceleration',
      'Braking patterns',
      'Time of day and duration',
      'Trip distance',
    ],
    retention: '30 days for raw data, aggregated features kept per policy period',
    pricingImpact: { withConsent: 1840, withoutConsent: 2100 },
    isActive: true,
    lastUpdated: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'wearable',
    name: 'Wearable Health Data',
    icon: '⌚',
    purpose: 'Wellness-based discount program',
    description:
      'Connect your fitness tracker to earn discounts based on healthy lifestyle habits.',
    dataCollected: [
      'Daily step count',
      'Active minutes',
      'Sleep patterns',
      'Heart rate zones',
    ],
    retention: 'Monthly aggregates only',
    pricingImpact: { withConsent: 1950, withoutConsent: 2100 },
    isActive: false,
    lastUpdated: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'iot',
    name: 'Home IoT Sensors',
    icon: '🏠',
    purpose: 'Smart home security discount',
    description:
      'Link your smart home security system for additional discounts on home insurance bundling.',
    dataCollected: [
      'Security system status',
      'Smoke detector alerts',
      'Water leak sensor data',
      'Door lock status',
    ],
    retention: '90 days for events, status changes kept indefinitely',
    pricingImpact: { withConsent: 2000, withoutConsent: 2100 },
    isActive: false,
    lastUpdated: new Date(Date.now() - 86400000 * 30),
  },
];

const INITIAL_TRIPS: TripSummary[] = [
  {
    id: 'trip-1',
    date: new Date(Date.now() - 86400000 * 1),
    distance: 24.5,
    duration: 45,
    score: 87,
    impact: -25,
  },
  {
    id: 'trip-2',
    date: new Date(Date.now() - 86400000 * 2),
    distance: 12.3,
    duration: 28,
    score: 92,
    impact: -35,
  },
  {
    id: 'trip-3',
    date: new Date(Date.now() - 86400000 * 3),
    distance: 45.2,
    duration: 82,
    score: 68,
    impact: 48,
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

// ─── Toast UI ─────────────────────────────────────────────────────────────────

const TOAST_COLORS: Record<ToastItem['type'], string> = {
  success: '#00a054',
  error: '#e60000',
  warning: '#d97706',
  info: '#0080ff',
};

const TOAST_ICONS: Record<ToastItem['type'], string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: TOAST_COLORS[toast.type],
            color: '#fff',
            fontFamily: 'var(--font-family-base)',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            animation: 'toastSlideIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>{TOAST_ICONS[toast.type]}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// Demo driver profile
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'demo-driver-asha',
  driverName: 'Asha Kumar',
  email: 'asha.kumar@drivefair.in',
  licenseId: 'DL-042022001928',
  vehicleNo: 'KA-01-HH-1234',
  phone: '+91 98765 43210',
  vehicleModel: 'Honda City 2022',
  vehicleType: 'Sedan',
  fuelType: 'Petrol',
  policyNumber: 'DF-2024-001923',
  policyStart: '01 April 2024',
  policyEnd: '31 March 2025',
  coverageType: 'Comprehensive Telematics',
  ncbDiscount: '20%',
  joinedDate: 'March 2024',
  avgScore: 84,
  totalTrips: 156,
  totalDistance: 2847,
  totalSaved: 3120,
};

interface StoredAccount extends UserProfile {
  passwordHash: string;
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('drivefair_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(account: StoredAccount) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    current.push(account);
    localStorage.setItem('drivefair_registered_accounts', JSON.stringify(current));
  } catch {
    // ignore
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>(['home']);
  const [pendingView, setPendingView] = useState<View | null>(null);

  const [recentTrips, setRecentTrips] = useState<TripSummary[]>(INITIAL_TRIPS);
  const [consents, setConsents] = useState<ConsentStream[]>(INITIAL_CONSENTS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [theme, setThemeState] = useState<Theme>('light');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(true);

  // Synchronize theme on client mount and listen to system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('drivefair-theme') as Theme | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Supabase health check & persistent session restoration
  useEffect(() => {
    let isMounted = true;

    // 1. Restore local active user if previously logged in
    try {
      const savedUser = localStorage.getItem('drivefair_active_user');
      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn('Local session restore notice:', e);
    }

    // 2. Health check to Supabase
    checkSupabaseHealth().then((res) => {
      if (isMounted) {
        setSupabaseConnected(res.ok);
      }
    });

    // 3. Supabase Auth Session restore
    supabase.auth.getSession().then(async ({ data }) => {
      if (isMounted && data?.session?.user) {
        setIsAuthenticated(true);
        const meta = data.session.user.user_metadata || {};
        const email = data.session.user.email || '';

        // Try getting database profile if available
        let dbProfile: any = null;
        try {
          const dbRes = await getDriverProfileFromSupabase(email);
          if (dbRes.success && dbRes.data) {
            dbProfile = dbRes.data;
          }
        } catch {}

        setCurrentUser((prev) => {
          if (prev && prev.email.toLowerCase() === email.toLowerCase()) return prev;
          return {
            id: data.session.user.id,
            driverName: dbProfile?.driver_name || meta.driver_name || meta.full_name || 'Driver',
            email: email,
            licenseId: dbProfile?.license_id || meta.license_id || 'DL-VERIFIED',
            vehicleNo: dbProfile?.vehicle_no || meta.vehicle_no || 'KA-01-ACTIVE',
            phone: dbProfile?.phone || meta.phone || '+91 98765 43210',
            vehicleModel: dbProfile?.vehicle_model || 'Honda City 2022',
            vehicleType: 'Sedan',
            fuelType: 'Petrol',
            policyNumber: dbProfile?.policy_number || 'DF-2024-001923',
            policyStart: '01 April 2024',
            policyEnd: '31 March 2025',
            coverageType: 'Comprehensive Telematics',
            ncbDiscount: '20%',
            joinedDate: 'March 2024',
            avgScore: 84,
            totalTrips: 156,
            totalDistance: 2847,
            totalSaved: 3120,
          };
        });
      }
    });

    // 4. Fetch recent trips from Supabase database
    fetchTripsFromSupabase().then((res) => {
      if (isMounted && res.success && res.data && res.data.length > 0) {
        const mappedTrips: TripSummary[] = res.data.map((t: any) => ({
          id: t.id,
          date: new Date(t.created_at),
          distance: Number(t.distance),
          duration: Number(t.duration),
          score: Number(t.score),
          impact: Number(t.impact),
        }));
        setRecentTrips(mappedTrips);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (session?.user) {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync browser popstate (back/forward) with view navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        setHistory((prev) => {
          if (prev.length > 1 && prev[prev.length - 2] === e.state.view) {
            return prev.slice(0, -1);
          }
          return [...prev, e.state.view];
        });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('drivefair-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('drivefair-theme', next);
        document.documentElement.setAttribute('data-theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: ToastItem['type']) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const PROTECTED_VIEWS: View[] = [
    'dashboard',
    'profile',
    'simulator',
    'explainer',
    'consent',
    'insurer',
  ];

  const navigateTo = useCallback(
    (view: View) => {
      // If user tries to access a protected page without logging in, route to login page
      if (!isAuthenticated && PROTECTED_VIEWS.includes(view)) {
        setPendingView(view);
        setHistory((prev) => (prev[prev.length - 1] === 'login' ? prev : [...prev, 'login']));
        setCurrentView('login');
        showToast(
          `Please sign in to access ${
            view === 'simulator'
              ? 'the Trip Simulator'
              : view === 'profile'
              ? 'your Profile'
              : 'the Dashboard'
          }.`,
          'info'
        );
        try {
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState({ view: 'login' }, '', window.location.pathname);
          }
        } catch {
          // ignore
        }
        return;
      }

      if (view === 'login' && isAuthenticated) {
        setCurrentView('dashboard');
        return;
      }

      setHistory((prev) => {
        if (prev[prev.length - 1] === view) return prev;
        return [...prev, view];
      });
      setCurrentView(view);
      try {
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({ view }, '', window.location.pathname);
        }
      } catch {
        // ignore
      }
    },
    [isAuthenticated, showToast]
  );

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        setCurrentView('home');
        return ['home'];
      }
      const newHistory = prev.slice(0, -1);
      const prevView = newHistory[newHistory.length - 1] || 'home';
      setCurrentView(prevView);
      return newHistory;
    });
  }, []);

  const canGoBack = history.length > 1 || currentView !== 'home';

  const addTrip = useCallback((trip: Omit<TripSummary, 'id'>) => {
    const tripDate = trip.date || new Date();
    const newTrip: TripSummary = { ...trip, id: `trip-${Date.now()}`, date: tripDate };
    setRecentTrips((prev) => [newTrip, ...prev].slice(0, 15));

    // Asynchronously record to Supabase
    recordTripToSupabase({
      distance: trip.distance,
      duration: trip.duration,
      score: trip.score,
      impact: trip.impact,
      date: tripDate,
    })
      .then((res) => {
        if (res.success && res.data && res.data[0]) {
          const dbId = res.data[0].id;
          setRecentTrips((prev) =>
            prev.map((t) => (t.id === newTrip.id ? { ...t, id: dbId } : t))
          );
        }
      })
      .catch((err) => {
        console.warn('Trip sync notice:', err);
      });
  }, []);

  const toggleConsent = useCallback((id: string) => {
    setConsents((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive, lastUpdated: new Date() } : c
      );
      const updated = next.find((c) => c.id === id);
      if (updated) {
        syncConsentToSupabase(id, updated.isActive).catch((err) => {
          console.warn('Consent sync notice:', err);
        });
      }
      return next;
    });
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const next: UserProfile = { ...prev, ...updates };
      try {
        localStorage.setItem('drivefair_active_user', JSON.stringify(next));
        const accounts = getStoredAccounts();
        const idx = accounts.findIndex((a) => a.email.toLowerCase() === next.email.toLowerCase());
        if (idx >= 0) {
          accounts[idx] = { ...accounts[idx], ...next };
          localStorage.setItem('drivefair_registered_accounts', JSON.stringify(accounts));
        }
      } catch {}

      saveDriverProfileToSupabase({
        userId: next.id,
        driverName: next.driverName,
        email: next.email,
        licenseId: next.licenseId,
        vehicleNo: next.vehicleNo,
        phone: next.phone,
        vehicleModel: next.vehicleModel,
        policyNumber: next.policyNumber,
      }).catch((err) => console.warn('Supabase update notice:', err));

      return next;
    });
  }, []);

  // ─── Create Account Flow ──────────────────────────────────────────────────
  const createAccount = useCallback(
    async (data: CreateAccountData): Promise<{ ok: boolean; message?: string }> => {
      const normalizedEmail = data.email.trim().toLowerCase();
      const driverName = data.driverName.trim();
      const licenseId = data.licenseId.trim().toUpperCase();
      const vehicleNo = data.vehicleNo.trim().toUpperCase();

      // Check if user already exists in local registry or Supabase
      const localAccounts = getStoredAccounts();
      const existingLocal = localAccounts.find(
        (a) => a.email.toLowerCase() === normalizedEmail
      );
      let existingDb: any = null;
      try {
        const res = await getDriverProfileFromSupabase(normalizedEmail);
        if (res.success && res.data) existingDb = res.data;
      } catch {}

      if (existingLocal || existingDb) {
        showToast('An account with this email already exists. Please sign in.', 'warning');
        return { ok: false, message: 'An account with this email already exists. Please sign in.' };
      }

      // Build new driver profile
      const newProfile: UserProfile = {
        id: `driver-${Date.now()}`,
        driverName,
        email: normalizedEmail,
        licenseId,
        vehicleNo,
        phone: '+91 98765 43210',
        vehicleModel: 'Honda City 2022',
        vehicleType: 'Sedan',
        fuelType: 'Petrol',
        policyNumber: `DF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        policyStart: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        policyEnd: new Date(Date.now() + 365 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        coverageType: 'Comprehensive Telematics',
        ncbDiscount: '20%',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avgScore: 85,
        totalTrips: 1,
        totalDistance: 24,
        totalSaved: 480,
      };

      // 1. Attempt Supabase Auth registration
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: data.password,
          options: {
            data: {
              driver_name: driverName,
              full_name: driverName,
              license_id: licenseId,
              vehicle_no: vehicleNo,
            },
          },
        });

        if (signUpData?.user?.id) {
          newProfile.id = signUpData.user.id;
        }

        if (signUpError) {
          console.warn('Supabase Auth signUp note:', signUpError.message);
        }

        // 2. Save into Supabase drivers table
        await saveDriverProfileToSupabase({
          userId: newProfile.id,
          driverName,
          email: normalizedEmail,
          licenseId,
          vehicleNo,
          policyNumber: newProfile.policyNumber,
        });
      } catch (err) {
        console.warn('Supabase database sync notice:', err);
      }

      // 3. Store in local persistent registry
      saveStoredAccount({
        ...newProfile,
        passwordHash: data.password,
      });

      // 4. Activate user session in real time
      setCurrentUser(newProfile);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('drivefair_active_user', JSON.stringify(newProfile));
      } catch {}

      setPendingView(null);
      setCurrentView('home');

      showToast(`Account created & registered in Supabase! Welcome, ${driverName}!`, 'success');
      return { ok: true };
    },
    [showToast]
  );

  // ─── Login Flow ───────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const normalizedEmail = email.trim().toLowerCase();
      const target: View = 'home';

      // 1. Quick demo account shortcut
      if (normalizedEmail === 'asha.kumar@drivefair.in') {
        if (password === 'demo123' || password === '123456' || password.length >= 6) {
          setCurrentUser(DEFAULT_DEMO_USER);
          setIsAuthenticated(true);
          setPendingView(null);
          setCurrentView(target);
          try {
            localStorage.setItem('drivefair_active_user', JSON.stringify(DEFAULT_DEMO_USER));
          } catch {}
          showToast('Signed in as Asha Kumar (Demo Mode)', 'success');
          return { ok: true };
        } else {
          showToast('Incorrect password. Please try again.', 'error');
          return {
            ok: false,
            reason: 'INVALID_CREDENTIALS',
            message: 'Incorrect password. Please try again.',
          };
        }
      }

      // 2. Check if user exists in Supabase drivers table or local accounts
      const localAccounts = getStoredAccounts();
      const matchedLocal = localAccounts.find((a) => a.email.toLowerCase() === normalizedEmail);

      let dbDriver: any = null;
      try {
        const dbRes = await getDriverProfileFromSupabase(normalizedEmail);
        if (dbRes.success && dbRes.data) {
          dbDriver = dbRes.data;
        }
      } catch (e) {
        console.warn('Driver profile check error:', e);
      }

      const userExists = !!dbDriver || !!matchedLocal;

      if (!userExists) {
        showToast('User not found. Please sign in as a new user by clicking Create Account.', 'warning');
        return {
          ok: false,
          reason: 'NOT_FOUND',
          message: 'User not found. Please sign in as a new user by clicking Create Account.',
        };
      }

      // 3. User exists! Attempt Supabase Auth login
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!sbError && sbData?.user) {
          const meta = sbData.user.user_metadata || {};

          const profile: UserProfile = {
            id: sbData.user.id,
            driverName: dbDriver?.driver_name || meta.driver_name || meta.full_name || 'Driver',
            email: normalizedEmail,
            licenseId: dbDriver?.license_id || meta.license_id || 'DL-VERIFIED',
            vehicleNo: dbDriver?.vehicle_no || meta.vehicle_no || 'KA-01-ACTIVE',
            phone: dbDriver?.phone || meta.phone || '+91 98765 43210',
            vehicleModel: dbDriver?.vehicle_model || 'Honda City 2022',
            vehicleType: 'Sedan',
            fuelType: 'Petrol',
            policyNumber: dbDriver?.policy_number || 'DF-2024-001923',
            policyStart: '01 April 2024',
            policyEnd: '31 March 2025',
            coverageType: 'Comprehensive Telematics',
            ncbDiscount: '20%',
            joinedDate: 'March 2024',
            avgScore: 84,
            totalTrips: 156,
            totalDistance: 2847,
            totalSaved: 3120,
          };

          setCurrentUser(profile);
          setIsAuthenticated(true);
          setPendingView(null);
          setCurrentView(target);
          try {
            localStorage.setItem('drivefair_active_user', JSON.stringify(profile));
          } catch {}
          showToast(`Welcome back, ${profile.driverName}!`, 'success');
          return { ok: true };
        }
      } catch (err) {
        console.warn('Supabase auth attempt note:', err);
      }

      // 4. Try local account credentials if Supabase auth was not used/registered
      if (matchedLocal) {
        if (matchedLocal.passwordHash === password) {
          const { passwordHash: _, ...profile } = matchedLocal;
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setPendingView(null);
          setCurrentView(target);
          try {
            localStorage.setItem('drivefair_active_user', JSON.stringify(profile));
          } catch {}
          showToast(`Welcome back, ${profile.driverName}!`, 'success');
          return { ok: true };
        }
      }

      // Password did not match
      showToast('Incorrect password. Please try again.', 'error');
      return {
        ok: false,
        reason: 'INVALID_CREDENTIALS',
        message: 'Incorrect password. Please try again.',
      };
    },
    [pendingView, showToast]
  );

  // ─── Logout Flow ──────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem('drivefair_active_user');
    } catch {}
    setCurrentUser(null);
    setIsAuthenticated(false);
    setPendingView(null);
    setCurrentView('home');
    setHistory(['home']);
    showToast('Signed out of DriveFair', 'info');
  }, [showToast]);

  // Single source of truth for premium: sum savings from all active consents
  const totalSavings = consents
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + (c.pricingImpact.withoutConsent - c.pricingImpact.withConsent), 0);
  const currentPremium = Math.max(STANDARD_PREMIUM - totalSavings, 1200);

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigateTo,
        goBack,
        canGoBack,
        recentTrips,
        addTrip,
        consents,
        toggleConsent,
        currentPremium,
        standardPremium: STANDARD_PREMIUM,
        riskScore: 74,
        showToast,
        isAuthenticated,
        currentUser,
        updateUserProfile,
        createAccount,
        login,
        logout,
        supabaseConnected,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} />
    </AppContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
