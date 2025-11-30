import type { APIRoute } from "astro";
import { PortalService } from "../../../services/PortalService";

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Token is required" }), {
      status: 400,
    });
  }

  try {
    const portalData = await PortalService.validateToken(token);
    return new Response(JSON.stringify(portalData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Invalid or expired link" ? 404 : 403,
    });
  }
};
