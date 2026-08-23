import { NextResponse } from 'next/server';
import { getPlan } from '@/lib/plans';

const PACK_BUCKET = process.env.PACK_BUCKET || 'developer-prompt-workflow-pack';

// GET /api/download?token=<48-hex-token>&file=<object-name> → streams one purchased file
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const file = searchParams.get('file') || 'developer-prompt-workflow-pack.pdf';

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
      `${supabaseUrl}/rest/v1/pack_orders?token=eq.${token}&select=order_id,plan`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!lookup.ok) {
      return NextResponse.json({ success: false, error: 'Order lookup failed' }, { status: 500 });
    }
    const rows = await lookup.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired download token' }, { status: 404 });
    }

    // 2. Does this order's plan include the requested file?
    const plan = getPlan(rows[0].plan) || getPlan('prompt-pack')!;
    if (!plan.files.includes(file)) {
      return NextResponse.json({ success: false, error: 'File not included in this order' }, { status: 403 });
    }

    // 3. Stream the file from private storage
    const obj = await fetch(`${supabaseUrl}/storage/v1/object/${PACK_BUCKET}/${file}`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (!obj.ok) {
      return NextResponse.json({ success: false, error: 'Pack file unavailable' }, { status: 500 });
    }

    const bytes = Buffer.from(await obj.arrayBuffer());
    const contentType = file.endsWith('.zip') ? 'application/zip' : 'application/pdf';
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file}"`,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[Download] Failed', e);
    return NextResponse.json({ success: false, error: 'Download failed' }, { status: 500 });
  }
}
