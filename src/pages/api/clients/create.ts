import type { APIRoute } from "astro";
import { ClientService } from "../../../services/ClientService";
import type { CreateClientDTO } from "../../../lib/types";

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

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

    const newClient = await ClientService.createClient(user.id, clientData);

    return new Response(JSON.stringify(newClient), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
