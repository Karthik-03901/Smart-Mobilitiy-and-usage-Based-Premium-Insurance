import { createClient } from '@supabase/supabase-js';

// Environment variables or validated credentials
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbwbgcrihjakszgxxepn.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid2JnY3JpaGpha3N6Z3h4ZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjg4NTYsImV4cCI6MjEwNzY0NDg1Nn0.LrstFxuakocp9suvE4v8MCJ4HCK70nOHCvUcAx6YW_o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Health check to verify connection to Supabase
 */
export async function checkSupabaseHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return { ok: false, message: msg };
  }
}

/**
 * Sync or log a driving trip to Supabase
 */
export async function recordTripToSupabase(trip: {
  distance: number;
  duration: number;
  score: number;
  impact: number;
  userId?: string;
  date?: Date;
}) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          distance: trip.distance,
          duration: trip.duration,
          score: trip.score,
          impact: trip.impact,
          created_at: trip.date ? trip.date.toISOString() : new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase trips table notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Fetch recent trips from Supabase database
 */
export async function fetchTripsFromSupabase(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Supabase trips fetch notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data: data || [] };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Sync consent preferences to Supabase
 */
export async function syncConsentToSupabase(consentId: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('user_consents')
      .upsert([
        {
          consent_id: consentId,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase consents table notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export interface DriverProfileData {
  userId?: string;
  driverName: string;
  email: string;
  licenseId: string;
  vehicleNo: string;
  phone?: string;
  vehicleModel?: string;
  policyNumber?: string;
  createdAt?: string;
}

/**
 * Save or update driver profile to Supabase database
 */
export async function saveDriverProfileToSupabase(profile: DriverProfileData) {
  try {
    const payload = {
      user_id: profile.userId || null,
      driver_name: profile.driverName,
      email: profile.email.toLowerCase(),
      license_id: profile.licenseId,
      vehicle_no: profile.vehicleNo,
      phone: profile.phone || '+91 98765 43210',
      vehicle_model: profile.vehicleModel || 'Honda City 2022',
      policy_number: profile.policyNumber || `DF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('drivers')
      .upsert([payload], { onConflict: 'email' })
      .select();

    if (error) {
      console.warn('Supabase drivers table notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Fetch driver profile from Supabase
 */
export async function getDriverProfileFromSupabase(email: string) {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}
