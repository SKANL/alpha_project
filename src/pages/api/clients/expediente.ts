import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies }) => {
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

  const clientId = url.searchParams.get("id");

  if (!clientId) {
    return new Response(JSON.stringify({ error: "Client ID is required" }), {
      status: 400,
    });
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single();

  if (clientError) {
    return new Response(JSON.stringify({ error: clientError.message }), {
      status: 500,
    });
  }

  // Get documents
  const { data: documents, error: docsError } = await supabase
    .from("client_documents")
    .select("*")
    .eq("client_id", clientId);

  // Get answers with questions
  const { data: answers, error: answersError } = await supabase
    .from("client_answers")
    .select(`
      *,
      questions (
        question_text,
        order_index
      )
    `)
    .eq("client_id", clientId)
    .order("questions(order_index)");

  const expediente = {
    client,
    documents: documents || [],
    answers: answers || [],
  };

  return new Response(JSON.stringify(expediente), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
