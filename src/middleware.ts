import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    const { url, locals, redirect } = context;

    // Paths that don't require authentication
    const publicPaths = ["/auth/signin", "/auth/register", "/api/auth", "/portal"];
    const isPublic = publicPaths.some((path) => url.pathname.startsWith(path)) || url.pathname === "/";

    // Debug logging (optionally enable via env var)
    // In SSR, use process.env instead of import.meta.env
    const DEBUG_AUTH = process.env.DEBUG_AUTH === "true";
    if (DEBUG_AUTH) {
        console.log(`[Auth] Path: ${url.pathname}, isPublic: ${isPublic}, hasTokens: ${!!accessToken && !!refreshToken}`);
    }

    if (!accessToken || !refreshToken) {
        if (!isPublic) {
            if (DEBUG_AUTH) {
                console.log(`[Auth] Redirecting to signin (missing tokens)`);
            }
            return redirect("/auth/signin");
        }
        return next();
    }

    try {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken.value,
            refresh_token: refreshToken.value,
        });

        if (error || !data.user) {
            // Clear invalid cookies
            context.cookies.delete("sb-access-token", { path: "/" });
            context.cookies.delete("sb-refresh-token", { path: "/" });

            if (DEBUG_AUTH) {
                console.log(`[Auth] Invalid session:`, error?.message || "No user");
            }

            if (!isPublic) {
                return redirect("/auth/signin");
            }
            return next();
        }

        // Inject user and session into locals for global access
        locals.user = data.user;
        locals.session = data.session;

        if (DEBUG_AUTH) {
            console.log(`[Auth] Valid session for user: ${data.user.id}`);
        }

        // Redirect authenticated users away from auth pages
        if (url.pathname === "/auth/signin" || url.pathname === "/auth/register") {
            if (DEBUG_AUTH) {
                console.log(`[Auth] Redirecting authenticated user to dashboard`);
            }
            return redirect("/dashboard");
        }

        return next();
    } catch (err) {
        // Catch any unexpected errors
        console.error("[Auth] Unexpected error in middleware:", err);

        // Clear cookies on error
        context.cookies.delete("sb-access-token", { path: "/" });
        context.cookies.delete("sb-refresh-token", { path: "/" });

        if (!isPublic) {
            return redirect("/auth/signin");
        }
        return next();
    }
});
