import { createClient } from "@supabase/supabase-js";

// Read values from import.meta.env (types declared in src/env.d.ts)
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);