import { NextResponse } from 'next/server';
import { ensureDefaultAlerts, runAlertsSweep } from '@/lib/jobs/alerts';
export const runtime = 'nodejs';
export async function GET(){
  await ensureDefaultAlerts();
  const out = await runAlertsSweep();
  return NextResponse.json({ ok:true, ...out });
}
export async function POST(){
  await ensureDefaultAlerts();
  const out = await runAlertsSweep();
  return NextResponse.json({ ok:true, ...out });
}
