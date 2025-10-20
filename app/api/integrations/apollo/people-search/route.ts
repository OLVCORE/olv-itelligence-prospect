import { NextRequest, NextResponse } from 'next/server';
import { apolloPeopleSearch } from '@/lib/integrations/apollo';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data = await apolloPeopleSearch(body);
    try {
      const sb = supabaseAdmin();
      const people = data?.people || data?.contacts || [];
      for (const p of people) {
        await sb.from('Person').upsert({
          id: p.id ?? undefined,
          companyId: body.companyId ?? null,
          name: p.name || [p.first_name, p.last_name].filter(Boolean).join(' '),
          role: p.title ?? null,
          department: p.department ?? null,
          email: p.email ?? null,
          source: 'apollo',
          updatedAt: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    } catch {}
    return NextResponse.json({ ok: true, data });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message||e) }, { status: 500 });
  }
}
