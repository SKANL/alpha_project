import type { APIRoute } from "astro";
import { ClientService } from "../../../../services/ClientService";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export const GET: APIRoute = async ({ params, locals, cookies }) => {
  const { supabase, user } = await createSupabaseServerClient({ cookies });

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientId = params.id;

  if (!clientId) {
    return new Response(JSON.stringify({ error: "Client ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const expediente = await ClientService.getClientExpediente(supabase, clientId, user.id);
    return new Response(JSON.stringify(expediente), {
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
