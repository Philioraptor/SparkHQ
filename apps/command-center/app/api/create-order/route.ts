import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getPlan } from '@/lib/plans';

export async function POST(request: Request) {
  try {
    const { planId, currency = 'INR', customerEmail } = await request.json();

    // Server-enforced pricing: look up the plan, never trust client amounts.
    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Choose combo, prompt-pack or n8n-pack.' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TMBqGRFBGmtaMH";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "NwwUimezuw4S58AVZrHlynGg";

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, error: 'Razorpay API credentials missing on server' }, { status: 401 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

    const order = await razorpay.orders.create({
      amount: plan.price,
      currency,
      receipt,
      notes: {
        planId,
        planName: plan.label,
        platform: 'SparkHQ Command Center',
        ...(customerEmail ? { customerEmail } : {})
      }
    });

    console.log('[Razorpay Order Created]', order.id, plan.label, 'Amount:', order.amount);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      planName: plan.label,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId
    });
  } catch (error: any) {
    console.error('[Razorpay Create Order Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Razorpay API Order Creation Failed' }, { status: 500 });
  }
}
