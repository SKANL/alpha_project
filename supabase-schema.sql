-- ============================================
-- LAWYER CLIENT MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Sistema de Gestión de Clientes para Despachos de Abogados
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for firm assets (logos, contracts, documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('firm-assets', 'firm-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILES TABLE
-- Stores firm/lawyer profile information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    firm_name TEXT NOT NULL DEFAULT 'Mi Despacho',
    firm_logo_url TEXT,
    calendar_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTRACT TEMPLATES TABLE
-- Stores reusable contract templates
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONNAIRE TEMPLATES TABLE
-- Stores reusable questionnaire templates
CREATE TABLE IF NOT EXISTS questionnaire_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
-- Stores questions for each questionnaire template
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id UUID REFERENCES questionnaire_templates(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLIENTS TABLE
-- Stores client information and welcome room data
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    case_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    magic_link_token TEXT NOT NULL UNIQUE,
    contract_template_id UUID REFERENCES contract_templates(id) ON DELETE RESTRICT NOT NULL,
    questionnaire_template_id UUID REFERENCES questionnaire_templates(id) ON DELETE RESTRICT NOT NULL,
    required_documents TEXT[] DEFAULT '{}',
    contract_signed_url TEXT,
    signature_data TEXT,
    signature_timestamp TIMESTAMPTZ,
    signature_ip TEXT,
    signature_hash TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    link_used BOOLEAN DEFAULT FALSE
);

-- 6. CLIENT DOCUMENTS TABLE
-- Stores documents uploaded by clients
CREATE TABLE IF NOT EXISTS client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CLIENT ANSWERS TABLE
-- Stores client answers to questionnaire questions
CREATE TABLE IF NOT EXISTS client_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_templates_user_id ON contract_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_user_id ON questionnaire_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_magic_link_token ON clients(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_answers_client_id ON client_answers(client_id);
CREATE INDEX IF NOT EXISTS idx_client_answers_question_id ON client_answers(question_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_answers ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- CONTRACT TEMPLATES POLICIES
CREATE POLICY "Users can view their own contract templates"
    ON contract_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contract templates"
    ON contract_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract templates"
    ON contract_templates FOR DELETE
    USING (auth.uid() = user_id);

-- QUESTIONNAIRE TEMPLATES POLICIES
CREATE POLICY "Users can view their own questionnaire templates"
    ON questionnaire_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire templates"
    ON questionnaire_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questionnaire templates"
    ON questionnaire_templates FOR DELETE
    USING (auth.uid() = user_id);

-- QUESTIONS POLICIES
CREATE POLICY "Users can view questions from their questionnaires"
    ON questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions to their questionnaires"
    ON questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete questions from their questionnaires"
    ON questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM questionnaire_templates
            WHERE questionnaire_templates.id = questions.questionnaire_id
            AND questionnaire_templates.user_id = auth.uid()
        )
    );

-- CLIENTS POLICIES
CREATE POLICY "Users can view their own clients"
    ON clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
    ON clients FOR DELETE
    USING (auth.uid() = user_id);

-- Allow public read/update for clients by magic link (for portal)
CREATE POLICY "Public can view client by magic link"
    ON clients FOR SELECT
    USING (true);

CREATE POLICY "Public can update client by magic link"
    ON clients FOR UPDATE
    USING (true);

-- CLIENT DOCUMENTS POLICIES
CREATE POLICY "Users can view documents from their clients"
    ON client_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_documents.client_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can insert client documents"
    ON client_documents FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete documents from their clients"
    ON client_documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_documents.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- CLIENT ANSWERS POLICIES
CREATE POLICY "Users can view answers from their clients"
    ON client_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_answers.client_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can insert client answers"
    ON client_answers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete answers from their clients"
    ON client_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = client_answers.client_id
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'firm-assets' AND auth.role() = 'authenticated');

-- Allow public to read files (for client portal)
CREATE POLICY "Public can read files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'firm-assets');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'firm-assets' AND auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, firm_name)
    VALUES (NEW.id, 'Mi Despacho');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- You can uncomment these to add sample templates for testing
-- Note: Replace 'your-user-id' with an actual user ID from auth.users

/*
-- Sample contract template
INSERT INTO contract_templates (user_id, name, file_url)
VALUES (
    'your-user-id',
    'Contrato de Servicios Profesionales',
    'https://example.com/sample-contract.pdf'
);

-- Sample questionnaire template
INSERT INTO questionnaire_templates (user_id, name)
VALUES (
    'your-user-id',
    'Cuestionario General'
);

-- Sample questions (use the questionnaire ID from above)
INSERT INTO questions (questionnaire_id, question_text, order_index)
VALUES
    ('questionnaire-id', '¿Cuál es el motivo de tu consulta?', 0),
    ('questionnaire-id', 'Relata los hechos cronológicamente', 1),
    ('questionnaire-id', '¿Qué esperas lograr con este proceso?', 2);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the setup:

-- 1. Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 
    'contract_templates', 
    'questionnaire_templates', 
    'questions', 
    'clients', 
    'client_documents', 
    'client_answers'
);

-- 2. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 
    'contract_templates', 
    'questionnaire_templates', 
    'questions', 
    'clients', 
    'client_documents', 
    'client_answers'
);

-- 3. Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT SETUP STEPS:

1. Run this entire script in your Supabase SQL Editor

2. Create the storage bucket 'firm-assets':
   - Go to Storage in Supabase Dashboard
   - Create a new bucket called 'firm-assets'
   - Make it public

3. Configure your .env file with:
   - SUPABASE_URL=your-project-url
   - SUPABASE_ANON_KEY=your-anon-key

4. Test the system:
   - Register a new user
   - Verify profile is auto-created
   - Create templates
   - Create a client welcome room
   - Test the magic link

5. Security Considerations:
   - The portal endpoints allow public access by design (magic link)
   - Consider adding rate limiting in production
   - Add IP tracking for signature evidence
   - Implement webhook notifications for completed clients

6. Future Enhancements:
   - Add subscription management (Stripe/MercadoPago)
   - Add email notifications
   - Add document OCR/validation
   - Add multi-language support
   - Add analytics dashboard
*/
