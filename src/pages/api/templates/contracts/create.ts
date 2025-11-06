import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

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

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  if (!name || !file) {
    return new Response(
      JSON.stringify({ error: "Name and file are required" }),
      { status: 400 }
    );
  }

  // Upload contract file
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `contracts/${fileName}`;

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

  // Create template record
  const { data: template, error } = await supabase
    .from("contract_templates")
    .insert({
      user_id: user.id,
      name,
      file_url: urlData.publicUrl,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(template), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
