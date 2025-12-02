import type { APIRoute } from "astro";
import { ClientService } from "../../../services/ClientService";
import type { CreateClientDTO } from "../../../lib/types";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, locals, url, cookies }) => {
  const { supabase, user } = await createSupabaseServerClient({ cookies });

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const clientData: CreateClientDTO = {
      client_name: data.client_name,
      case_name: data.case_name,
      contract_template_id: data.contract_template_id,
      questionnaire_template_id: data.questionnaire_template_id,
      required_documents: data.required_documents || [],
    };

    const newClient = await ClientService.createClient(supabase, user.id, clientData);

    // Build complete magic link using the token
    const origin = url.origin || `${url.protocol}//${url.host}`;
    const magicLink = `${origin}/portal/${newClient.magic_link_token}`;

    // Return client data with complete magic link
    return new Response(
      JSON.stringify({
        ...newClient,
        magic_link: magicLink,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[API] Error creating client:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
