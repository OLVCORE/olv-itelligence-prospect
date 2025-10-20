import { NextRequest, NextResponse } from 'next/server';
import { serperSearch } from '@/lib/integrations/serper';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { q, num } = await req.json();
  if (!q) return NextResponse.json({ ok: false, error: 'q obrigatório' }, { status: 400 });
  try {
    const data = await serperSearch(q, num ?? 5);
    return NextResponse.json({ ok: true, data });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message||e) }, { status: 500 });
  }
}
