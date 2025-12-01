import type { APIRoute } from 'astro';
// Nota: requiere instalar `@paypal/checkout-server-sdk`
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
    const amount = body?.amount || '7999.00';

    const client = paypalClient();
    const createRequest = new paypal.orders.OrdersCreateRequest();
    createRequest.prefer('return=representation');
    createRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'MXN',
            value: String(amount)
          }
        }
      ]
    });

    const response = await client.execute(createRequest);
    return new Response(JSON.stringify({ id: response.result.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('create-order error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
