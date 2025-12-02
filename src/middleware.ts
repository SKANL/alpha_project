import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase-server";

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, locals, redirect, cookies } = context;

    // Paths that don't require authentication
    const publicPaths = ["/auth/signin", "/auth/register", "/api/auth", "/portal"];
    const isPublic = publicPaths.some((path) => url.pathname.startsWith(path)) || url.pathname === "/";

    // Debug logging (optionally enable via env var)
    const DEBUG_AUTH = process.env.DEBUG_AUTH === "true";

    try {
        // Create a safe, request-scoped Supabase client
        const { supabase, user, session } = await createSupabaseServerClient({ cookies });

        // Inject into locals
        locals.user = user;
        locals.session = session;
        // We could also inject the client if we wanted to avoid recreating it, 
        // but for now we'll just use the user/session in locals and recreate client in pages/api if needed
        // or we could add 'supabase' to locals if we updated env.d.ts. 
        // For this refactor, we will recreate it in pages to be explicit, or we can add it to locals.
        // Let's stick to just user/session in locals for now to match existing types.

        if (DEBUG_AUTH) {
            console.log(`[Auth] Path: ${url.pathname}, isPublic: ${isPublic}, User: ${user?.id}`);
        }

        if (!user) {
            if (!isPublic) {
                if (DEBUG_AUTH) console.log(`[Auth] Redirecting to signin (no user)`);
                return redirect("/auth/signin");
            }
        } else {
            // Redirect authenticated users away from auth pages
            if (url.pathname === "/auth/signin" || url.pathname === "/auth/register") {
                if (DEBUG_AUTH) console.log(`[Auth] Redirecting authenticated user to dashboard`);
                return redirect("/dashboard");
            }
        }

        return next();

    } catch (err) {
        console.error("[Auth] Unexpected error in middleware:", err);

        // Clear cookies on error if it seems like a session issue
        if (!isPublic) {
            return redirect("/auth/signin");
        }
        return next();
    }
});
