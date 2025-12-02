import type { APIRoute } from "astro";
import { AuthService } from "../../../services/AuthService";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ redirect, cookies }) => {
  // Create a fresh client for the request
  const { supabase } = await createSupabaseServerClient({ cookies });

  await AuthService.signOut(supabase);

  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  return redirect("/auth/signin");
};