import { NextResponse } from 'next/server';

const PACK_BUCKET = process.env.PACK_BUCKET || 'pack';
const PACK_FILE = process.env.PACK_FILE || 'developer-prompt-workflow-pack.pdf';
const PACK_FILENAME = process.env.PACK_FILENAME || 'developer-prompt-workflow-pack.pdf';

// GET /api/download?token=<48-hex-token> → streams the pack PDF to verified buyers
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token || !/^[a-f0-9]{48}$/.test(token)) {
    return NextResponse.json({ success: false, error: 'Invalid download token' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
  }

  try {
    // 1. Is this token a real, verified order?
    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/pack_orders?token=eq.${token}&select=order_id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!lookup.ok) {
      return NextResponse.json({ success: false, error: 'Order lookup failed' }, { status: 500 });
    }
    const rows = await lookup.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired download token' }, { status: 404 });
    }

    // 2. Stream the PDF from private storage
    const pdf = await fetch(`${supabaseUrl}/storage/v1/object/${PACK_BUCKET}/${PACK_FILE}`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (!pdf.ok) {
      return NextResponse.json({ success: false, error: 'Pack file unavailable' }, { status: 500 });
    }

    const bytes = Buffer.from(await pdf.arrayBuffer());
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PACK_FILENAME}"`,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Download] Failed', e);
    return NextResponse.json({ success: false, error: 'Download failed' }, { status: 500 });
  }
}
