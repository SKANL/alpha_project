import type { APIRoute } from "astro";
import { PortalService } from "../../../services/PortalService";

export const POST: APIRoute = async ({ request }) => {
  const { token } = await request.json();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token is required" }), {
      status: 400,
    });
  }

  try {
    const client = await PortalService.completeProcess(token);
    return new Response(JSON.stringify(client), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
