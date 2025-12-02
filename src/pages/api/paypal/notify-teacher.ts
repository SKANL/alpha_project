import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // Aquí podrías integrar envío de email, webhook, o guardar en BD.
    // Por ahora guardamos en logs del servidor para verificación.
    console.log('notify-teacher payload:', body);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('notify-teacher error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
