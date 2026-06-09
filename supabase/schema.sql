-- Database Schema for CareerCompass

-- 1. Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger to automatically create a profile when a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can select their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON public.companies;

CREATE POLICY "Users can select their own companies" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own companies" ON public.companies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own companies" ON public.companies FOR DELETE USING (auth.uid() = user_id);


-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    position TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('Full Time', 'Internship', 'Part Time', 'Contract')),
    location TEXT NOT NULL,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary_range TEXT,
    job_link TEXT,
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Screening', 'Technical Test', 'Interview', 'HR Interview', 'Offered', 'Accepted', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can select their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.applications;

CREATE POLICY "Users can select their own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);


-- 4. Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Technical', 'HR', 'User', 'Coding Test'
    notes TEXT,
    location_link TEXT, -- e.g., Google Meet link or Address
    google_event_id TEXT, -- Google Calendar Event ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can select their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can insert their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can update their own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can delete their own interviews" ON public.interviews;

CREATE POLICY "Users can select their own interviews" ON public.interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interviews" ON public.interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interviews" ON public.interviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interviews" ON public.interviews FOR DELETE USING (auth.uid() = user_id);


-- 5. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('CV', 'Cover Letter', 'Certificate')),
    file_path TEXT NOT NULL, -- Storage bucket file path
    file_name TEXT NOT NULL, -- Original name of the file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can select their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Users can select their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);


-- 6. Recruitment Logs (Timeline logs)
CREATE TABLE IF NOT EXISTS public.recruitment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on recruitment logs
ALTER TABLE public.recruitment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view recruitment logs linked to their applications" ON public.recruitment_logs;
CREATE POLICY "Users can view recruitment logs linked to their applications" 
    ON public.recruitment_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE public.applications.id = public.recruitment_logs.application_id 
            AND public.applications.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert recruitment logs linked to their applications" ON public.recruitment_logs;
CREATE POLICY "Users can insert recruitment logs linked to their applications" 
    ON public.recruitment_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE public.applications.id = public.recruitment_logs.application_id 
            AND public.applications.user_id = auth.uid()
        )
    );

-- Trigger to automatically create a log when application status changes
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.recruitment_logs (application_id, status, notes)
        VALUES (
            NEW.id,
            NEW.status,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Application created.'
                ELSE 'Status updated from ' || OLD.status || ' to ' || NEW.status || '.'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_application_status_change
    AFTER INSERT OR UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();


-- 7. Storage Bucket configuration for CV and Documents
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('recruitment-documents', 'recruitment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for recruitment-documents bucket
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recruitment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can view their own documents" ON storage.objects;
CREATE POLICY "Authenticated users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recruitment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can delete their own documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'recruitment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
