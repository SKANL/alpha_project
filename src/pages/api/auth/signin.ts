// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { AuthService } from "../../../services/AuthService";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  // Create a fresh client for the request
  const { supabase } = await createSupabaseServerClient({ cookies });

  const { data, error } = await AuthService.signIn(supabase, email, password);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Set cookies from the session data
  if (data.session) {
    cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
    });
    cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
    });
  }

  return redirect("/dashboard");
};