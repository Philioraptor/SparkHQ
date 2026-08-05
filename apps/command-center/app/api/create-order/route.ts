import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, planName = 'Pro Founder Plan', currency = 'INR' } = await request.json();

    const amountInPaise = Number(amount);

    if (!amountInPaise || isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ success: false, error: 'Amount must be at least 100 paise (₹1)' }, { status: 400 });
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
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        planName,
        platform: 'SparkHQ AI C-Suite'
      }
    });

    console.log('[Razorpay Live Order Created]', order.id, 'Amount:', order.amount);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId
    });
  } catch (error: any) {
    console.error('[Razorpay Create Order Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Razorpay API Order Creation Failed' }, { status: 500 });
  }
}
