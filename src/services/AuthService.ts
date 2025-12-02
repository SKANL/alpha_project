import type { SupabaseClient, AuthResponse, Session } from "@supabase/supabase-js";

export class AuthService {
    /**
     * Sign in with email and password.
     */
    static async signIn(client: SupabaseClient, email: string, password: string): Promise<AuthResponse> {
        return await client.auth.signInWithPassword({
            email,
            password,
        });
    }

    /**
     * Sign up with email and password.
     */
    static async signUp(client: SupabaseClient, email: string, password: string): Promise<AuthResponse> {
        return await client.auth.signUp({
            email,
            password,
        });
    }

    /**
     * Sign out the current user.
     */
    static async signOut(client: SupabaseClient): Promise<{ error: any }> {
        return await client.auth.signOut();
    }

    /**
     * Set the session using access and refresh tokens.
     */
    static async setSession(client: SupabaseClient, accessToken: string, refreshToken: string): Promise<{ data: { session: Session | null; user: any | null }; error: any }> {
        return await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }
}
