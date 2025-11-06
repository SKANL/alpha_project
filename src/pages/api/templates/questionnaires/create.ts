import type { APIRoute } from "astro";
import { supabase } from "../../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { name, questions } = await request.json();

  if (!name || !questions || !Array.isArray(questions)) {
    return new Response(
      JSON.stringify({ error: "Name and questions array are required" }),
      { status: 400 }
    );
  }

  // Create questionnaire
  const { data: questionnaire, error: qError } = await supabase
    .from("questionnaire_templates")
    .insert({
      user_id: user.id,
      name,
    })
    .select()
    .single();

  if (qError) {
    return new Response(JSON.stringify({ error: qError.message }), {
      status: 500,
    });
  }

  // Create questions
  const questionRecords = questions.map((text: string, index: number) => ({
    questionnaire_id: questionnaire.id,
    question_text: text,
    order_index: index,
  }));

  const { data: createdQuestions, error: questionsError } = await supabase
    .from("questions")
    .insert(questionRecords)
    .select();

  if (questionsError) {
    return new Response(JSON.stringify({ error: questionsError.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ ...questionnaire, questions: createdQuestions }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
