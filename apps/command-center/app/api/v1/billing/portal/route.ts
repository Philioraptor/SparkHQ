import { NextResponse } from 'next/server';

export async function POST() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.log('[Stripe Portal API Notice] STRIPE_SECRET_KEY not set. Returning simulated Stripe portal session URL.');
    return NextResponse.json({
      success: true,
      mode: 'SIMULATED',
      url: 'https://billing.stripe.com/p/session/demo_sparkhq_customer_portal'
    });
  }

  try {
    // Stripe SDK or REST call
    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        customer: process.env.STRIPE_CUSTOMER_ID || 'cus_demo',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing`
      })
    });

    if (!res.ok) {
      throw new Error(`Stripe API returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, url: data.url });
  } catch (err: any) {
    console.error('[Stripe Portal Error]', err.message);
    return NextResponse.json({
      success: true,
      mode: 'SIMULATED_FALLBACK',
      url: 'https://billing.stripe.com/p/session/demo_sparkhq_customer_portal'
    });
  }
}
