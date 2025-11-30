// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { AuthService } from "../../../services/AuthService";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  await AuthService.signOut();
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  return redirect("/auth/signin");
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await AuthService.signOut();
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  return redirect("/auth/signin");
};