import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { Client, ClientStatus } from "../../../lib/types";

export const POST: APIRoute = async ({ request }) => {
  const { token } = await request.json();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token is required" }), {
      status: 400,
    });
  }

  // Update client status and mark link as used
  const { data: client, error } = await supabase
    .from("clients")
    .update({
      status: "completed",
      link_used: true,
      completed_at: new Date().toISOString(),
    })
    .eq("magic_link_token", token)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(client), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
