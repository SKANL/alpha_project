import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const document_type = formData.get("document_type") as string;
  const file = formData.get("file") as File;

  if (!token || !document_type || !file) {
    return new Response(
      JSON.stringify({ error: "Token, document type, and file are required" }),
      { status: 400 }
    );
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("magic_link_token", token)
    .single();

  if (clientError || !client) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 404,
    });
  }

  // Upload file
  const fileExt = file.name.split(".").pop();
  const fileName = `${client.id}-${document_type}-${Date.now()}.${fileExt}`;
  const filePath = `client-files/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("firm-assets")
    .upload(filePath, file);

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 500,
    });
  }

  const { data: urlData } = supabase.storage
    .from("firm-assets")
    .getPublicUrl(filePath);

  // Create document record
  const { data: document, error: docError } = await supabase
    .from("client_documents")
    .insert({
      client_id: client.id,
      document_type,
      file_url: urlData.publicUrl,
    })
    .select()
    .single();

  if (docError) {
    return new Response(JSON.stringify({ error: docError.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(document), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
