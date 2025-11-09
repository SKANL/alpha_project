import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";
import type { ContractTemplate } from "../../../../lib/types";

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

  // Get template to delete file from storage
  const { data: template } = await supabase
    .from("contract_templates")
    .select("file_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (template) {
    // Extract file path from URL
    const urlParts = template.file_url.split("/");
    const filePath = `contracts/${urlParts[urlParts.length - 1]}`;

    // Delete from storage
    await supabase.storage.from("firm-assets").remove([filePath]);
  }

  // Delete from database
  const { error } = await supabase
    .from("contract_templates")
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
