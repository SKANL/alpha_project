import { createClient } from "@supabase/supabase-js";

// In Astro, Supabase client runs in both server and browser contexts
// We must use PUBLIC_ prefix for variables that need to be accessible in the browser
// The Supabase anon key is safe to expose to the client (hence "anon")
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        "Missing required environment variables: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be defined in .env file"
    );
}

if (!supabaseUrl.startsWith("https://")) {
    throw new Error("PUBLIC_SUPABASE_URL must be a valid HTTPS URL");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);