import type { APIRoute } from 'astro';
import paypal from '@paypal/checkout-server-sdk';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'Ab6xDxKjzq0DrVOYM6DaMXoNKTzvq4Wt2W8zH5PZW5Gtnlzl6KNsez1vLtlU2rFZypH0P21Sj6WwnUsE';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EIANihrwedfqYGpCpVp-lX2QVQca1WTshzxZ9itz8MDm6JZeOqXLaa5FSGgtYQMeRiZwkhpHZzVy1Bhi';

function paypalClient() {
  const environment = new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  return new paypal.core.PayPalHttpClient(environment);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const orderID = body?.orderID;
    if (!orderID) return new Response(JSON.stringify({ error: 'orderID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const client = paypalClient();
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({});

    const capture = await client.execute(captureRequest);
    return new Response(JSON.stringify(capture.result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('capture-order error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
