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
    const { name, questions } = await request.json();

    if (!name || !questions || !Array.isArray(questions)) {
      return new Response(JSON.stringify({ error: "Name and questions array are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const template = await TemplateService.createQuestionnaireTemplate(user.id, name, questions);

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
