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

  const { error } = await AuthService.signUp(supabase, email, password);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  return redirect("/auth/signin");
};