import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { token, answers } = await request.json();

  if (!token || !answers || !Array.isArray(answers)) {
    return new Response(
      JSON.stringify({ error: "Token and answers array are required" }),
      { status: 400 }
    );
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("magic_link_token", token)
    .single();

  if (clientError || !client) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 404,
    });
  }

  // Insert answers
  const answerRecords = answers.map((answer: any) => ({
    client_id: client.id,
    question_id: answer.question_id,
    answer_text: answer.answer_text,
  }));

  const { data: savedAnswers, error: answersError } = await supabase
    .from("client_answers")
    .insert(answerRecords)
    .select();

  if (answersError) {
    return new Response(JSON.stringify({ error: answersError.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(savedAnswers), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
