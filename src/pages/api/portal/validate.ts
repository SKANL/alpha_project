import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Token is required" }), {
      status: 400,
    });
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("magic_link_token", token)
    .single();

  if (clientError || !client) {
    return new Response(JSON.stringify({ error: "Invalid or expired link" }), {
      status: 404,
    });
  }

  // Check if link was already used
  if (client.link_used) {
    return new Response(JSON.stringify({ error: "Link already used" }), {
      status: 403,
    });
  }

  // Get contract template
  const { data: contractTemplate } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("id", client.contract_template_id)
    .single();

  // Get questionnaire with questions
  const { data: questionnaire } = await supabase
    .from("questionnaire_templates")
    .select(`
      *,
      questions (
        id,
        question_text,
        order_index
      )
    `)
    .eq("id", client.questionnaire_template_id)
    .single();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", client.user_id)
    .single();

  const portalData = {
    client,
    contract_template: contractTemplate,
    questionnaire,
    profile,
  };

  return new Response(JSON.stringify(portalData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
