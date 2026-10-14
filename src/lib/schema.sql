-- ============================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM - PLACEX
-- Complete Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  roll_number TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  branch TEXT CHECK (branch IN ('CS', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE', 'OTHER')),
  current_year INTEGER CHECK (current_year BETWEEN 1 AND 4),
  cgpa DECIMAL(3,2) CHECK (cgpa >= 0 AND cgpa <= 10),
  resume_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coordinator', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  industry TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PLACEMENT DRIVES TABLE
-- ============================================
CREATE TABLE placement_drives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  drive_date DATE NOT NULL,
  application_deadline DATE NOT NULL,
  eligibility_criteria JSONB DEFAULT '{"min_cgpa": 0, "allowed_branches": [], "no_backlogs": false}'::jsonb,
  package_lpa DECIMAL(5,2),
  role TEXT,
  location TEXT,
  bond_details TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. APPLICATIONS TABLE (Join Table)
-- ============================================
CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  drive_id UUID REFERENCES placement_drives(id) ON DELETE CASCADE,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'selected', 'offered')),
  round_details JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, drive_id)
);

-- ============================================
-- 5. PLACEMENTS TABLE (Final Offers)
-- ============================================
CREATE TABLE placements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  drive_id UUID REFERENCES placement_drives(id) ON DELETE SET NULL,
  package_lpa DECIMAL(5,2),
  offer_letter_url TEXT,
  offer_date DATE,
  joining_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. NOTIFICATIONS TABLE (Optional but useful)
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_roll_number ON profiles(roll_number);
CREATE INDEX idx_profiles_branch ON profiles(branch);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Placement drives indexes
CREATE INDEX idx_drives_company ON placement_drives(company_id);
CREATE INDEX idx_drives_date ON placement_drives(drive_date);
CREATE INDEX idx_drives_status ON placement_drives(status);
CREATE INDEX idx_drives_deadline ON placement_drives(application_deadline);

-- Applications indexes
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_drive ON applications(drive_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(application_date);

-- Placements indexes
CREATE INDEX idx_placements_student ON placements(student_id);
CREATE INDEX idx_placements_company ON placements(company_id);
CREATE INDEX idx_placements_offer_date ON placements(offer_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placement_drives_updated_at BEFORE UPDATE ON placement_drives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON placements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Function to check if a user is an admin or coordinator WITHOUT causing RLS recursion
CREATE OR REPLACE FUNCTION is_admin_or_coordinator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role IN ('admin', 'coordinator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check specifically for admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin_or_coordinator(auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- COMPANIES POLICIES
CREATE POLICY "Anyone can view companies"
    ON companies FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert companies"
    ON companies FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update companies"
    ON companies FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete companies"
    ON companies FOR DELETE
    USING (is_admin(auth.uid()));

-- PLACEMENT DRIVES POLICIES
CREATE POLICY "Anyone can view drives"
    ON placement_drives FOR SELECT
    USING (true);

CREATE POLICY "Admins and coordinators can insert drives"
    ON placement_drives FOR INSERT
    WITH CHECK (is_admin_or_coordinator(auth.uid()));

CREATE POLICY "Admins and coordinators can update drives"
    ON placement_drives FOR UPDATE
    USING (is_admin_or_coordinator(auth.uid()));

-- APPLICATIONS POLICIES
CREATE POLICY "Students can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can create applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (is_admin_or_coordinator(auth.uid()));

-- PLACEMENTS POLICIES
CREATE POLICY "Students can view their placements"
    ON placements FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all placements"
    ON placements FOR SELECT
    USING (is_admin_or_coordinator(auth.uid()));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTIONS (Helper Queries)
-- ============================================

-- Function to get placement statistics
CREATE OR REPLACE FUNCTION get_placement_stats()
RETURNS TABLE (
    total_students BIGINT,
    placed_students BIGINT,
    placement_rate DECIMAL,
    average_package DECIMAL,
    highest_package DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id)::BIGINT as total_students,
        COUNT(DISTINCT pl.student_id)::BIGINT as placed_students,
        ROUND((COUNT(DISTINCT pl.student_id)::DECIMAL / NULLIF(COUNT(DISTINCT p.id), 0) * 100), 2) as placement_rate,
        ROUND(AVG(pl.package_lpa), 2) as average_package,
        MAX(pl.package_lpa) as highest_package
    FROM profiles p
    LEFT JOIN placements pl ON p.id = pl.student_id
    WHERE p.role = 'student';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get branch-wise statistics
CREATE OR REPLACE FUNCTION get_branch_stats()
RETURNS TABLE (
    branch TEXT,
    total_students BIGINT,
    placed_students BIGINT,
    placement_rate DECIMAL,
    average_package DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.branch,
        COUNT(DISTINCT p.id)::BIGINT as total_students,
        COUNT(DISTINCT pl.student_id)::BIGINT as placed_students,
        ROUND((COUNT(DISTINCT pl.student_id)::DECIMAL / NULLIF(COUNT(DISTINCT p.id), 0) * 100), 2) as placement_rate,
        ROUND(AVG(pl.package_lpa), 2) as average_package
    FROM profiles p
    LEFT JOIN placements pl ON p.id = pl.student_id
    WHERE p.role = 'student' AND p.branch IS NOT NULL
    GROUP BY p.branch;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSERT SAMPLE DATA (Optional)
-- ============================================

-- Insert sample companies
INSERT INTO companies (name, industry, website, contact_email, description) VALUES
('Google', 'Technology', 'https://google.com', 'recruiting@google.com', 'Global technology leader specializing in internet services and products.'),
('Microsoft', 'Technology', 'https://microsoft.com', 'careers@microsoft.com', 'Leading software development and cloud computing company.'),
('Amazon', 'E-commerce', 'https://amazon.com', 'university-hiring@amazon.com', 'E-commerce and cloud computing giant.'),
('Goldman Sachs', 'Finance', 'https://goldmansachs.com', 'campus.recruiting@gs.com', 'Leading global investment banking firm.'),
('Deloitte', 'Consulting', 'https://deloitte.com', 'campus@deloitte.com', 'Professional services network providing audit, tax, consulting services.');

-- Insert sample placement drives
INSERT INTO placement_drives (company_id, title, description, drive_date, application_deadline, eligibility_criteria, package_lpa, role, location, status)
SELECT 
    id,
    'Software Engineering Internship',
    'Summer internship opportunity for 3rd and 4th year students',
    '2025-04-15',
    '2025-03-30',
    '{"min_cgpa": 7.5, "allowed_branches": ["CS", "IT", "ECE"], "no_backlogs": true}',
    25.0,
    'Software Engineer',
    'Bangalore',
    'upcoming'
FROM companies WHERE name = 'Google';

INSERT INTO placement_drives (company_id, title, description, drive_date, application_deadline, eligibility_criteria, package_lpa, role, location, status)
SELECT 
    id,
    'Cloud Engineer Role',
    'Full-time opportunity for cloud engineers',
    '2025-04-20',
    '2025-04-05',
    '{"min_cgpa": 7.0, "allowed_branches": ["CS", "IT"], "no_backlogs": false}',
    18.0,
    'Cloud Engineer',
    'Hyderabad',
    'upcoming'
FROM companies WHERE name = 'Microsoft';

INSERT INTO placement_drives (company_id, title, description, drive_date, application_deadline, eligibility_criteria, package_lpa, role, location, status)
SELECT 
    id,
    'Business Analyst',
    'Analyst role for finance and consulting',
    '2025-04-10',
    '2025-03-25',
    '{"min_cgpa": 7.0, "allowed_branches": ["CS", "IT", "ECE", "MECH"], "no_backlogs": false}',
    16.0,
    'Business Analyst',
    'Mumbai',
    'upcoming'
FROM companies WHERE name = 'Goldman Sachs';

-- ============================================
-- CREATE A TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON companies TO anon, authenticated;
GRANT SELECT ON placement_drives TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON applications TO authenticated;
GRANT SELECT ON placements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_placement_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_stats TO authenticated;

-- ============================================
-- VERIFY SETUP
-- ============================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;


-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create buckets for different storage needs
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('resumes', 'resumes', true),
    ('company-logos', 'company-logos', true),
    ('offer-letters', 'offer-letters', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR RESUMES BUCKET
-- ============================================

-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins and coordinators to view all resumes
CREATE POLICY "Admins can view all resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'coordinator')
    )
);

-- ============================================
-- STORAGE POLICIES FOR COMPANY LOGOS BUCKET
-- ============================================

-- Allow admins to upload company logos
CREATE POLICY "Admins can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'company-logos' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow anyone to view company logos (public bucket)
CREATE POLICY "Anyone can view company logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow admins to update/delete company logos
CREATE POLICY "Admins can update company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'company-logos' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'company-logos' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- ============================================
-- STORAGE POLICIES FOR OFFER LETTERS BUCKET (Private)
-- ============================================

-- Allow admins to upload offer letters
CREATE POLICY "Admins can upload offer letters"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'offer-letters' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'coordinator')
    )
);

-- Allow students to view their own offer letters
CREATE POLICY "Students can view their own offer letters"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'offer-letters' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all offer letters
CREATE POLICY "Admins can view all offer letters"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'offer-letters' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'coordinator')
    )
);

-- ============================================
-- UPDATE PROFILES TABLE TO INCLUDE RESUME URL
-- ============================================

-- Add resume_url column if not exists (already in schema, but ensure it's there)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'resume_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN resume_url TEXT;
    END IF;
END $$;

-- ============================================
-- FUNCTION TO GENERATE STORAGE PATH
-- ============================================

-- Helper function to generate resume path
CREATE OR REPLACE FUNCTION generate_resume_path(user_id UUID, file_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || file_name;
END;
$$ LANGUAGE plpgsql;

-- Helper function to generate offer letter path
CREATE OR REPLACE FUNCTION generate_offer_path(user_id UUID, company_name TEXT, file_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || company_name || '/' || file_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER TO UPDATE RESUME URL IN PROFILE
-- ============================================

-- Create a function to update profile resume_url when file is uploaded
CREATE OR REPLACE FUNCTION update_profile_resume_url()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    file_path TEXT;
    public_url TEXT;
BEGIN
    -- Extract user_id from the file path
    user_id := (storage.foldername(NEW.name))[1]::UUID;
    file_path := NEW.name;
    public_url := storage.get_public_url('resumes', file_path);
    
    -- Update the profile's resume_url
    UPDATE profiles 
    SET resume_url = public_url, updated_at = NOW()
    WHERE id = user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for resume uploads
DROP TRIGGER IF EXISTS on_resume_upload ON storage.objects;
CREATE TRIGGER on_resume_upload
    AFTER INSERT ON storage.objects
    FOR EACH ROW
    WHEN (NEW.bucket_id = 'resumes')
    EXECUTE FUNCTION update_profile_resume_url();

-- ============================================
-- INSERT SAMPLE COMPANY LOGOS (Optional)
-- ============================================

-- Note: You'll need to manually upload images to the company-logos bucket
-- The following is just for reference on how to structure the URLs

-- Update companies with logo URLs (replace with actual URLs after uploading)
-- UPDATE companies SET logo_url = storage.get_public_url('company-logos', 'google.png') WHERE name = 'Google';
-- UPDATE companies SET logo_url = storage.get_public_url('company-logos', 'microsoft.png') WHERE name = 'Microsoft';
-- UPDATE companies SET logo_url = storage.get_public_url('company-logos', 'amazon.png') WHERE name = 'Amazon';

-- ============================================
-- VERIFY STORAGE SETUP
-- ============================================

-- Check if buckets were created
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('resumes', 'company-logos', 'offer-letters');


-- Update RLS policies for better admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()));

-- Allow admins to update application status
DROP POLICY IF EXISTS "Admins can update applications" ON applications;
CREATE POLICY "Admins can update applications"
    ON applications FOR UPDATE
    USING (is_admin(auth.uid()));

-- Allow admins to delete applications
DROP POLICY IF EXISTS "Admins can delete applications" ON applications;
CREATE POLICY "Admins can delete applications"
    ON applications FOR DELETE
    USING (is_admin(auth.uid()));