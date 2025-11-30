import type { APIRoute } from "astro";
import { PortalService } from "../../../services/PortalService";
import type { SubmitAnswersData } from "../../../lib/types";

export const POST: APIRoute = async ({ request }) => {
  const { token, answers }: { token: string } & SubmitAnswersData = await request.json();

  if (!token || !answers || !Array.isArray(answers)) {
    return new Response(
      JSON.stringify({ error: "Token and answers array are required" }),
      { status: 400 }
    );
  }

  try {
    const savedAnswers = await PortalService.submitAnswers(token, answers);
    return new Response(JSON.stringify(savedAnswers), {
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
