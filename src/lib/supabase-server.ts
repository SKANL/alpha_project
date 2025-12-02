import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

export const createSupabaseServerClient = async (context: { cookies: AstroCookies }): Promise<{ supabase: SupabaseClient, user: any | null, session: any | null }> => {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables");
    }

    // Create a new client instance for this request
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false, // We handle persistence via cookies manually
            autoRefreshToken: false,
        },
    });

    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    let user = null;
    let session = null;

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken.value,
            refresh_token: refreshToken.value,
        });

        if (!error && data.session) {
            user = data.user;
            session = data.session;
        }
    }

    return { supabase, user, session };
};
