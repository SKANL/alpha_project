// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { AuthService } from "../../../services/AuthService";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { data, error } = await AuthService.signIn(email, password);

  if (error || !data.session) {
    return new Response(JSON.stringify({ error: error?.message || "No session created" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });
  return redirect("/dashboard");
};