import type { APIRoute } from "astro";
import { ProfileService } from "../../../services/ProfileService";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await request.formData();
    const firm_name = formData.get("firm_name")?.toString();
    const calendar_link = formData.get("calendar_link")?.toString();
    const logoFile = formData.get("logo") as File | null;

    let firm_logo_url = undefined;

    // Handle logo upload if present
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      firm_logo_url = publicUrl;
    }

    const updateData: any = {
      firm_name,
      calendar_link,
      updated_at: new Date().toISOString(),
    };

    if (firm_logo_url) {
      updateData.firm_logo_url = firm_logo_url;
    }

    const updatedProfile = await ProfileService.updateProfile(user.id, updateData);

    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
