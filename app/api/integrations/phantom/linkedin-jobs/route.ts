import { NextRequest, NextResponse } from 'next/server';
import { phantomRun } from '@/lib/integrations/phantom';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { agentId, companyLinkedinUrl, companyId } = await req.json();
  
  if (!agentId || !companyLinkedinUrl) {
    return NextResponse.json({
      ok: false,
      error: { code: 'MISSING_PARAMS', message: 'agentId e companyLinkedinUrl são obrigatórios' }
    }, { status: 400 });
  }

  try {
    console.log(`[PhantomBuster] Lançando agente ${agentId}: ${companyLinkedinUrl}`);
    
    const data = await phantomRun(agentId, { companyLinkedinUrl });

    // Persistência opcional (aditiva) dos sinais de jobs
    try {
      if (companyId) {
        const sb = supabaseAdmin;
        const jobs = data?.container?.output?.data ?? data?.data ?? [];
        
        for (const j of jobs) {
          await sb.from('TechSignals').insert({
            companyId,
            kind: 'linkedin_job',
            key: j.title ?? null,
            value: j.description ?? null,
            confidence: 60,
            source: 'phantom_linkedin_jobs',
            url: j.link ?? companyLinkedinUrl,
            fetchedAt: new Date().toISOString()
          });
        }
        
        console.log(`[PhantomBuster] ✅ ${jobs.length} jobs salvos`);
      }
    } catch (err: any) {
      console.warn('[PhantomBuster] Erro ao salvar jobs:', err.message);
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('[PhantomBuster] Erro:', error.message);
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'PHANTOM_ERROR',
        message: error.message
      }
    }, { status: 502 });
  }
}
