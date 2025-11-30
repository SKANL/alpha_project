import type { APIRoute } from "astro";
import { PortalService } from "../../../services/PortalService";
import type { SignContractData } from "../../../lib/types";

export const POST: APIRoute = async ({ request }) => {
  const { token, signature_data, ip_address }: SignContractData & { token: string } = await request.json();

  if (!token || !signature_data) {
    return new Response(
      JSON.stringify({ error: "Token and signature data are required" }),
      { status: 400 }
    );
  }

  try {
    const updatedClient = await PortalService.signContract(token, signature_data, ip_address);
    return new Response(JSON.stringify(updatedClient), {
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
