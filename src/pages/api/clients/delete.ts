import type { APIRoute } from "astro";
import { ClientService } from "../../../services/ClientService";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const DELETE: APIRoute = async ({ request, locals, cookies }) => {
  const { supabase, user } = await createSupabaseServerClient({ cookies });

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Client ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ClientService.deleteClient(supabase, id, user.id);

    return new Response(JSON.stringify({ success: true }), {
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
