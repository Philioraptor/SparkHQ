import { NextResponse } from 'next/server';
import crypto from 'crypto';

async function storeOrder(payload: {
  order_id: string;
  payment_id: string;
  email?: string;
  token: string;
}): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/pack_orders`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        order_id: payload.order_id,
        payment_id: payload.payment_id,
        email: payload.email ?? null,
        token: payload.token,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('[Delivery] Order store failed', e);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName = 'Developer Prompt & Workflow Pack',
      customerEmail,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing required Razorpay payment signature verification fields' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "NwwUimezuw4S58AVZrHlynGg";

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay Signature Mismatch]');
      return NextResponse.json({ success: false, error: 'Payment signature verification failed. Mismatch detected.' }, { status: 400 });
    }

    // Payment verified — create a one-time-ish download token and store the order
    const token = crypto.randomBytes(24).toString('hex'); // 48 hex chars, unguessable
    const stored = await storeOrder({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      email: customerEmail,
      token,
    });

    if (!stored) {
      console.error(`[Delivery] Order NOT stored for ${razorpay_order_id} — buyer cannot download yet`);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully!',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      planName,
      token: stored ? token : null,
      deliveryStatus: stored ? 'ready' : 'error',
    });
  } catch (error: any) {
    console.error('[Razorpay Signature Verification Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Signature verification failed' }, { status: 500 });
  }
}
