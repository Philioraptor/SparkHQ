import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { memoryLogs } from '../v1/router/event/route';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName = 'Pro Founder Plan' } = await request.json();

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

    console.log('[Razorpay Signature Verification] Expected:', expectedSignature, 'Received:', razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay Signature Mismatch]');
      return NextResponse.json({ success: false, error: 'Payment signature verification failed. Mismatch detected.' }, { status: 400 });
    }

    // Payment Verified Successfully! Log audit entry
    memoryLogs.unshift({
      id: `log-${Date.now()}`,
      agentRole: 'BILLING',
      action: 'RAZORPAY_LIVE_PAYMENT_VERIFIED',
      details: `Live Payment ${razorpay_payment_id} verified for Order ${razorpay_order_id} (${planName})`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay Live Payment Signature Verified Successfully!',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      planName
    });
  } catch (error: any) {
    console.error('[Razorpay Signature Verification Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Signature verification failed' }, { status: 500 });
  }
}
