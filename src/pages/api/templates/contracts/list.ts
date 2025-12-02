import type { APIRoute } from "astro";
import { TemplateService } from "../../../../services/TemplateService";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export const GET: APIRoute = async ({ locals, cookies }) => {
  const { supabase, user } = await createSupabaseServerClient({ cookies });

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const templates = await TemplateService.getContractTemplates(supabase, user.id);
    return new Response(JSON.stringify(templates), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
