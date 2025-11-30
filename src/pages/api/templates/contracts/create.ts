import type { APIRoute } from "astro";
import { TemplateService } from "../../../../services/TemplateService";

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
    const name = formData.get("name")?.toString();
    const file = formData.get("file") as File;

    if (!name || !file) {
      return new Response(JSON.stringify({ error: "Name and file are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const template = await TemplateService.createContractTemplate(user.id, name, file);

    return new Response(JSON.stringify(template), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
