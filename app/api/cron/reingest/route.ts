import { NextRequest, NextResponse } from 'next/server';
import { runScheduledReingest } from '@/lib/jobs/reingest';

export const runtime = 'nodejs';

/**
 * GET/POST /api/cron/reingest
 * - Chamado pelo Vercel Cron (GET)
 * - Pode ser disparado manualmente (POST)
 */
export async function GET(){ 
  const out = await runScheduledReingest({ batchLimit: 10, concurrency: 2, delayMs: 800, verifyEmails: false });
  return NextResponse.json({ ok:true, ...out });
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const batchLimit = body?.batchLimit ?? 10;
  const concurrency = body?.concurrency ?? 2;
  const delayMs = body?.delayMs ?? 800;
  const verifyEmails = !!body?.verifyEmails;
  const out = await runScheduledReingest({ batchLimit, concurrency, delayMs, verifyEmails });
  return NextResponse.json({ ok:true, ...out });
}
