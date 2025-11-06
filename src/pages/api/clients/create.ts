import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const {
    client_name,
    case_name,
    contract_template_id,
    questionnaire_template_id,
    required_documents,
  } = body;

  if (!client_name || !case_name || !contract_template_id || !questionnaire_template_id) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  // Generate magic link token
  const magic_link_token = crypto.randomBytes(32).toString("hex");

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      client_name,
      case_name,
      contract_template_id,
      questionnaire_template_id,
      required_documents: required_documents || [],
      magic_link_token,
      status: "pending",
      link_used: false,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // Return client with magic link
  const magic_link = `${new URL(request.url).origin}/welcome/${magic_link_token}`;

  return new Response(
    JSON.stringify({ ...client, magic_link }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
