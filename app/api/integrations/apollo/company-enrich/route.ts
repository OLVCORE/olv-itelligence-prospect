import { NextRequest, NextResponse } from 'next/server';
import { apolloCompanyEnrich } from '@/lib/integrations/apollo';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data = await apolloCompanyEnrich(body);
    try {
      const sb = supabaseAdmin();
      await sb.from('Firmographics').insert({
        companyId: body.companyId ?? null,
        source: 'apollo',
        employeesRange: data?.companies?.[0]?.estimated_num_employees ?? null,
        revenueRange: data?.companies?.[0]?.estimated_annual_revenue ?? null,
        techTags: data?.companies?.[0]?.tech_tags ?? null,
        fetchedAt: new Date().toISOString()
      });
    } catch {}
    return NextResponse.json({ ok: true, data });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message||e) }, { status: 500 });
  }
}
