import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

/**
 * POST /api/monitor/register
 * body: {
 *  companyId: string,
 *  vendor: 'TOTVS'|'OLV'|'CUSTOM',
 *  cadence?: '6h'|'daily'|'weekly'|'custom:cron',
 *  domain?: string,
 *  linkedinUrl?: string,
 *  phantomAgentId?: string,
 *  active?: boolean
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, vendor, cadence='daily', domain, linkedinUrl, phantomAgentId, active=true } = body || {};
  if (!companyId || !vendor) {
    return NextResponse.json({ ok:false, error:'companyId e vendor são obrigatórios' }, { status:400 });
  }
  const sb = supabaseAdmin();

  // se já existe monitor para esse par, atualiza; se não, cria
  const { data: ex } = await sb.from('CompanyMonitor').select('id').eq('companyId', companyId).maybeSingle();
  const row = {
    companyId, vendor, cadence, domain: domain||null, linkedinUrl: linkedinUrl||null,
    phantomAgentId: phantomAgentId||null, active: !!active,
    nextRunAt: new Date().toISOString()
  };
  if (ex?.id) {
    await sb.from('CompanyMonitor').update(row).eq('id', ex.id);
  } else {
    await sb.from('CompanyMonitor').insert(row);
  }

  return NextResponse.json({ ok:true });
}
