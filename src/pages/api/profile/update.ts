import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data, error: authError } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  const user = data?.user;

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await request.formData();
  const firm_name = formData.get("firm_name") as string;
  const calendar_link = formData.get("calendar_link") as string;
  const logo_file = formData.get("logo") as File | null;

  let firm_logo_url: string | undefined;

  // Upload logo if provided
  if (logo_file && logo_file.size > 0) {
    const fileExt = logo_file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("firm-assets")
      .upload(filePath, logo_file, {
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
      });
    }

    const { data: urlData } = supabase.storage
      .from("firm-assets")
      .getPublicUrl(filePath);

    firm_logo_url = urlData.publicUrl;
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (firm_name) updateData.firm_name = firm_name;
  if (calendar_link) updateData.calendar_link = calendar_link;
  if (firm_logo_url) updateData.firm_logo_url = firm_logo_url;

  try {
    // Use upsert to ensure profile is created or updated atomically.
    const payload = { user_id: user.id, ...updateData };
    const { data: upserted, error: upsertError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .maybeSingle();

    if (upsertError) {
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(upserted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Unexpected runtime error -> return message for debugging
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
    });
  }
};
