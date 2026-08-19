import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PACK_BUCKET = process.env.PACK_BUCKET || 'pack';
const PACK_FILE = process.env.PACK_FILE || 'developer-prompt-workflow-pack.pdf';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Developer Pack <pack@sparkhq.ai>';

async function fetchPackPdf(): Promise<Buffer | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${PACK_BUCKET}/${PACK_FILE}`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.error('[Delivery] PDF fetch failed', e);
    return null;
  }
}

async function sendDeliveryEmail(email: string, pdf: Buffer): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !email) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: 'Your Developer Prompt & Workflow Pack — download attached',
        text:
          'Hi!\n\nThanks for grabbing the Developer Prompt & Workflow Pack.\n\nYour file is attached — save it. Every prompt works in any capable LLM (Claude, ChatGPT, Cursor): paste your error, get one actionable fix.\n\nIf one prompt doesn\'t save you a debugging session in the first week, reply to this email for a full refund. No questions.\n\n— Dhruv',
        attachments: [{ filename: PACK_FILE, content: pdf.toString('base64') }],
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('[Delivery] Email send failed', e);
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

    // Payment verified — deliver the pack
    let emailStatus = 'skipped';
    if (customerEmail) {
      const pdf = await fetchPackPdf();
      if (pdf) {
        emailStatus = (await sendDeliveryEmail(customerEmail, pdf)) ? 'sent' : 'failed';
      } else {
        emailStatus = 'failed_pdf';
      }
    }
    if (emailStatus !== 'sent') {
      console.warn(`[Delivery] emailStatus=${emailStatus} for order ${razorpay_order_id} (${customerEmail || 'no email'})`);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully!',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      planName,
      emailStatus,
    });
  } catch (error: any) {
    console.error('[Razorpay Signature Verification Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Signature verification failed' }, { status: 500 });
  }
}
