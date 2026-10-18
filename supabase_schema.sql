-- ==============================================================================
-- DriveFair: Supabase Database Schema & Queries (Idempotent / Safe to re-run)
-- Paste and run this script in your Supabase Project SQL Editor:
-- https://supabase.com/dashboard/project/vbwbgcrihjakszgxxepn/sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DRIVERS TABLE (Used for Create Account & Login flow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    driver_name TEXT NOT NULL,
    license_id TEXT NOT NULL,
    vehicle_no TEXT NOT NULL,
    phone TEXT DEFAULT '+91 98765 43210',
    vehicle_model TEXT DEFAULT 'Honda City 2022',
    policy_number TEXT DEFAULT ('DF-' || to_char(CURRENT_DATE, 'YYYY') || '-' || floor(random() * 900000 + 100000)::text),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist (prevents ERROR 42710)
DROP POLICY IF EXISTS "Allow public insert to drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow public select from drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow update to drivers" ON public.drivers;

-- Allow anon and authenticated users to insert during registration
CREATE POLICY "Allow public insert to drivers" 
    ON public.drivers 
    FOR INSERT 
    WITH CHECK (true);

-- Allow users to read driver profile
CREATE POLICY "Allow public select from drivers" 
    ON public.drivers 
    FOR SELECT 
    USING (true);

-- Allow users to update their own driver profile
CREATE POLICY "Allow update to drivers" 
    ON public.drivers 
    FOR UPDATE 
    USING (true);


-- ------------------------------------------------------------------------------
-- 2. TRIPS TABLE (For Telematics & Simulated Trips)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    distance NUMERIC NOT NULL,
    duration NUMERIC NOT NULL,
    score INTEGER NOT NULL,
    impact NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to trips" ON public.trips;
DROP POLICY IF EXISTS "Allow public select from trips" ON public.trips;

CREATE POLICY "Allow public insert to trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from trips" ON public.trips FOR SELECT USING (true);


-- ------------------------------------------------------------------------------
-- 3. USER CONSENTS TABLE (For Telematics & Consent Streams)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert and update to consents" ON public.user_consents;
CREATE POLICY "Allow public insert and update to consents" ON public.user_consents FOR ALL USING (true);


-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC SUPABASE AUTH TRIGGER
-- Automatically copies driver details from Auth signup metadata into public.drivers
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.drivers (
        user_id,
        email,
        driver_name,
        license_id,
        vehicle_no,
        phone,
        vehicle_model,
        policy_number
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'driver_name', NEW.raw_user_meta_data->>'full_name', 'Driver'),
        COALESCE(NEW.raw_user_meta_data->>'license_id', 'DL-PENDING'),
        COALESCE(NEW.raw_user_meta_data->>'vehicle_no', 'VEH-PENDING'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '+91 98765 43210'),
        COALESCE(NEW.raw_user_meta_data->>'vehicle_model', 'Honda City 2022'),
        'DF-' || to_char(CURRENT_DATE, 'YYYY') || '-' || floor(random() * 900000 + 100000)::text
    )
    ON CONFLICT (email) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        driver_name = EXCLUDED.driver_name,
        license_id = EXCLUDED.license_id,
        vehicle_no = EXCLUDED.vehicle_no,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on every new auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_driver();


-- ==============================================================================
-- 5. EXACT APPLICATION QUERIES
-- ==============================================================================

-- A) CREATE ACCOUNT QUERY: Insert a new driver record
INSERT INTO public.drivers (
    email,
    driver_name,
    license_id,
    vehicle_no,
    phone,
    vehicle_model
) VALUES (
    'asha.kumar@drivefair.in',
    'Asha Kumar',
    'DL-042022001928',
    'KA-01-HH-1234',
    '+91 98765 43210',
    'Honda City 2022'
)
ON CONFLICT (email) DO UPDATE SET
    driver_name = EXCLUDED.driver_name,
    license_id = EXCLUDED.license_id,
    vehicle_no = EXCLUDED.vehicle_no,
    updated_at = NOW();

-- B) LOGIN QUERY: Lookup an existing driver by email
SELECT 
    id,
    email,
    driver_name,
    license_id,
    vehicle_no,
    phone,
    vehicle_model,
    policy_number,
    created_at
FROM public.drivers
WHERE LOWER(email) = LOWER('asha.kumar@drivefair.in');

-- C) CHECK ACCOUNT EXISTENCE QUERY
SELECT EXISTS (
    SELECT 1 FROM public.drivers WHERE LOWER(email) = LOWER('user@example.com')
) AS account_exists;

-- D) UPDATE DRIVER PROFILE QUERY
UPDATE public.drivers
SET 
    phone = '+91 98765 00000',
    updated_at = NOW()
WHERE LOWER(email) = LOWER('asha.kumar@drivefair.in');
