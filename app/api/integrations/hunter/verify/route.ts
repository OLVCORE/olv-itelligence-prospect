import { NextRequest, NextResponse } from 'next/server';
import { hunterVerify } from '@/lib/integrations/hunter';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { email, personId } = await req.json();
  
  if (!email) {
    return NextResponse.json({
      ok: false,
      error: { code: 'MISSING_EMAIL', message: 'email é obrigatório' }
    }, { status: 400 });
  }

  try {
    console.log(`[Hunter Verify] Verificando email: ${email}`);
    
    const data = await hunterVerify(email);

    // Persistência opcional (aditiva)
    try {
      if (personId && data?.data) {
        const sb = supabaseAdmin;
        
        await sb.from('Person').update({
          updatedAt: new Date().toISOString()
        }).eq('id', personId);
        
        console.log(`[Hunter Verify] ✅ Status: ${data.data.status}`);
      }
    } catch (err: any) {
      console.warn('[Hunter Verify] Erro ao atualizar person:', err.message);
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('[Hunter Verify] Erro:', error.message);
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'HUNTER_ERROR',
        message: error.message
      }
    }, { status: 502 });
  }
}
