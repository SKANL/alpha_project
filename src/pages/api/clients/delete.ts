import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const DELETE: APIRoute = async ({ request, cookies }) => {
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

  const { id } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
    });
  }

  // Get client to delete files
  const { data: client } = await supabase
    .from("clients")
    .select("contract_signed_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // Delete documents from storage
  const { data: documents } = await supabase
    .from("client_documents")
    .select("file_url")
    .eq("client_id", id);

  if (documents && documents.length > 0) {
    const filePaths = documents.map((doc) => {
      const urlParts = doc.file_url.split("/");
      return `client-files/${urlParts[urlParts.length - 1]}`;
    });
    await supabase.storage.from("firm-assets").remove(filePaths);
  }

  // Delete signed contract from storage
  if (client?.contract_signed_url) {
    const urlParts = client.contract_signed_url.split("/");
    const filePath = `signed-contracts/${urlParts[urlParts.length - 1]}`;
    await supabase.storage.from("firm-assets").remove([filePath]);
  }

  // Delete from database (cascade will delete related records)
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
