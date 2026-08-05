import { NextResponse } from 'next/server';
import { memoryLogs } from '@/app/api/v1/router/event/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(memoryLogs);
}
