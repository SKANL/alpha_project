import { supabase } from "../lib/supabase";
import type { AuthResponse, Session } from "@supabase/supabase-js";

export class AuthService {
    /**
     * Sign in with email and password.
     */
    static async signIn(email: string, password: string): Promise<AuthResponse> {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    /**
     * Sign up with email and password.
     */
    static async signUp(email: string, password: string): Promise<AuthResponse> {
        return await supabase.auth.signUp({
            email,
            password,
        });
    }

    /**
     * Sign out the current user.
     */
    static async signOut(): Promise<{ error: any }> {
        return await supabase.auth.signOut();
    }

    /**
     * Set the session using access and refresh tokens.
     */
    static async setSession(accessToken: string, refreshToken: string): Promise<{ data: { session: Session | null; user: any | null }; error: any }> {
        return await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }
}
