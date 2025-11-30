import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    const { url, locals, redirect } = context;

    // Paths that don't require authentication
    const publicPaths = ["/auth/signin", "/auth/register", "/api/auth", "/portal"];
    const isPublic = publicPaths.some((path) => url.pathname.startsWith(path));

    if (!accessToken || !refreshToken) {
        if (!isPublic) {
            return redirect("/auth/signin");
        }
        return next();
    }

    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
    });

    if (error || !data.user) {
        // Clear invalid cookies
        context.cookies.delete("sb-access-token", { path: "/" });
        context.cookies.delete("sb-refresh-token", { path: "/" });

        if (!isPublic) {
            return redirect("/auth/signin");
        }
        return next();
    }

    // Inject user and session into locals for global access
    locals.user = data.user;
    locals.session = data.session;

    // Redirect authenticated users away from auth pages
    if (url.pathname === "/auth/signin" || url.pathname === "/auth/register") {
        return redirect("/dashboard");
    }

    return next();
});
