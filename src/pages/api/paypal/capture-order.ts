import type { APIRoute } from 'astro';
import paypal from '@paypal/checkout-server-sdk';

const PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID || import.meta.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.PAYPAL_CLIENT_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PayPal credentials");
}

function paypalClient() {
  const environment = new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID as string, PAYPAL_CLIENT_SECRET as string);
  return new paypal.core.PayPalHttpClient(environment);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const orderID = body?.orderID;
    if (!orderID) return new Response(JSON.stringify({ error: 'orderID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const client = paypalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({} as any);

    const capture = await client.execute(captureRequest);
    return new Response(JSON.stringify(capture.result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('capture-order error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
