import type { APIRoute } from "astro";
import { PortalService } from "../../../services/PortalService";
import type { DocumentType } from "../../../lib/types";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const document_type = formData.get("document_type") as DocumentType;
  const file = formData.get("file") as File;

  if (!token || !document_type || !file) {
    return new Response(
      JSON.stringify({ error: "Token, document type, and file are required" }),
      { status: 400 }
    );
  }

  try {
    const document = await PortalService.uploadDocument(token, document_type, file);
    return new Response(JSON.stringify(document), {
      status: 201,
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
