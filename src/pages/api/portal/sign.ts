import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

export const POST: APIRoute = async ({ request }) => {
  const { token, signature_data, ip_address } = await request.json();

  if (!token || !signature_data) {
    return new Response(
      JSON.stringify({ error: "Token and signature data are required" }),
      { status: 400 }
    );
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("magic_link_token", token)
    .single();

  if (clientError || !client) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 404,
    });
  }

  // Generate hash of signature for evidence
  const timestamp = new Date().toISOString();
  const hash = crypto
    .createHash("sha256")
    .update(`${signature_data}${timestamp}${ip_address}`)
    .digest("hex");

  // Update client with signature data
  const { data: updatedClient, error: updateError } = await supabase
    .from("clients")
    .update({
      signature_data,
      signature_timestamp: timestamp,
      signature_ip: ip_address,
      signature_hash: hash,
    })
    .eq("id", client.id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(updatedClient), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
