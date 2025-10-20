import { NextRequest, NextResponse } from 'next/server';
import { hunterFind } from '@/lib/integrations/hunter';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { domain, full_name, companyId } = await req.json();
  
  if (!domain) {
    return NextResponse.json({
      ok: false,
      error: { code: 'MISSING_DOMAIN', message: 'domain é obrigatório' }
    }, { status: 400 });
  }

  try {
    console.log(`[Hunter Find] Buscando email: ${full_name || domain}`);
    
    const data = await hunterFind(domain, full_name);

    // Persistência opcional (aditiva)
    try {
      if (companyId && data?.data?.email) {
        const sb = supabaseAdmin;
        
        await sb.from('Person').upsert({
          id: undefined,
          companyId,
          name: full_name ?? null,
          email: data.data.email,
          source: 'hunter',
          updatedAt: new Date().toISOString()
        }, { onConflict: 'companyId,email' });
        
        console.log(`[Hunter Find] ✅ Email salvo: ${data.data.email}`);
      }
    } catch (err: any) {
      console.warn('[Hunter Find] Erro ao salvar email:', err.message);
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('[Hunter Find] Erro:', error.message);
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'HUNTER_ERROR',
        message: error.message
      }
    }, { status: 502 });
  }
}
