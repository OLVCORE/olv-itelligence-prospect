import { NextRequest, NextResponse } from 'next/server';
import { apolloPeopleSearch } from '@/lib/integrations/apollo';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    console.log('[Apollo People] Buscando pessoas:', body.q_organization_domains || body.q_keywords);
    
    const data = await apolloPeopleSearch(body);

    // Persistência opcional (aditiva) em Person
    try {
      if (body.companyId) {
        const sb = supabaseAdmin;
        const people = data?.people || data?.contacts || [];
        
        for (const p of people) {
          await sb.from('Person').upsert({
            id: undefined,
            companyId: body.companyId,
            name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            role: p.title ?? null,
            department: p.department ?? null,
            seniority: p.seniority ?? null,
            email: p.email ?? null,
            linkedinUrl: p.linkedin_url ?? null,
            skills: p.skills || [],
            source: 'apollo',
            updatedAt: new Date().toISOString()
          }, { onConflict: 'companyId,email' });
        }
        
        console.log(`[Apollo People] ✅ ${people.length} pessoas salvas`);
      }
    } catch (err: any) {
      console.warn('[Apollo People] Erro ao salvar pessoas:', err.message);
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('[Apollo People] Erro:', error.message);
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'APOLLO_ERROR',
        message: error.message
      }
    }, { status: 502 });
  }
}
