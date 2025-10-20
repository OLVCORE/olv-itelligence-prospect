import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Pro: 60s, Free: 10s

/**
 * ENRIQUECIMENTO COMPLETO DE EMPRESA (ASSÍNCRONO)
 * 
 * Este endpoint executa:
 * 1. Apollo: Firmographics + TechTags
 * 2. HTTP Headers: Tech Stack básico
 * 3. Presença Digital: Instagram, LinkedIn, Facebook, YouTube
 * 4. Jusbrasil: Processos e menções legais
 * 5. Marketplaces B2B: presença em portais
 * 6. Maturity Calculator: Scores + Fit TOTVS/OLV
 * 
 * Chamado quando usuário clica "Analisar Empresa" no dashboard.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_COMPANY_ID', message: 'companyId é obrigatório' }
      }, { status: 400 });
    }

    console.log(`[Enrich] 🚀 Iniciando enriquecimento completo: ${companyId}`);

    // 1) Buscar empresa no banco
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({
        ok: false,
        error: { code: 'COMPANY_NOT_FOUND', message: 'Empresa não encontrada' }
      }, { status: 404 });
    }

    // Atualizar status para 'processing'
    await supabaseAdmin
      .from('Analysis')
      .update({
        insights: JSON.stringify({
          enrichmentStatus: 'processing',
          enrichmentStartedAt: new Date().toISOString()
        }),
        updatedAt: new Date().toISOString()
      })
      .eq('companyId', companyId);

    const enrichmentResults = {
      apollo: null as any,
      httpHeaders: null as any,
      socialMedia: null as any,
      jusbrasil: null as any,
      marketplaces: null as any,
      maturity: null as any,
      errors: [] as string[],
      timings: {} as Record<string, number>
    };

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const domain = company.domain || (company.tradeName ? `${company.tradeName.toLowerCase().replace(/\s/g, '')}.com.br` : null);

    // ========================================
    // 2) APOLLO: Firmographics + TechTags
    // ========================================
    if (domain) {
      const apolloStart = Date.now();
      try {
        console.log(`[Enrich] 🔍 Apollo: ${domain}`);
        
        const apolloRes = await fetch(`${baseUrl}/api/integrations/apollo/company-enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, companyId })
        });
        
        if (apolloRes.ok) {
          enrichmentResults.apollo = await apolloRes.json();
          console.log(`[Enrich] ✅ Apollo sucesso`);
        } else {
          enrichmentResults.errors.push(`Apollo: ${apolloRes.status}`);
        }
      } catch (err: any) {
        console.warn('[Enrich] Apollo falhou:', err.message);
        enrichmentResults.errors.push(`Apollo: ${err.message}`);
      }
      enrichmentResults.timings.apollo = Date.now() - apolloStart;
    }

    // ========================================
    // 3) HTTP HEADERS: Tech Stack Básico
    // ========================================
    if (domain) {
      const headersStart = Date.now();
      try {
        console.log(`[Enrich] 🔍 HTTP Headers: ${domain}`);
        
        const headersRes = await fetch(`${baseUrl}/api/integrations/http/headers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `https://${domain}`, companyId })
        });
        
        if (headersRes.ok) {
          enrichmentResults.httpHeaders = await headersRes.json();
          console.log(`[Enrich] ✅ HTTP Headers sucesso`);
        } else {
          enrichmentResults.errors.push(`Headers: ${headersRes.status}`);
        }
      } catch (err: any) {
        console.warn('[Enrich] HTTP Headers falhou:', err.message);
        enrichmentResults.errors.push(`Headers: ${err.message}`);
      }
      enrichmentResults.timings.httpHeaders = Date.now() - headersStart;
    }

    // ========================================
    // 4) PRESENÇA DIGITAL: Redes Sociais + Jusbrasil + Marketplaces
    // ========================================
    const presenceStart = Date.now();
    try {
      console.log(`[Enrich] 🔍 Presença Digital: ${company.name}`);
      
      const presenceRes = await fetch(`${baseUrl}/api/integrations/digital-presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          cnpj: company.cnpj,
          fantasia: company.tradeName,
          website: domain ? `https://${domain}` : null,
          socios: [], // TODO: buscar sócios da ReceitaWS (QSA)
          companyId
        })
      });
      
      if (presenceRes.ok) {
        const presenceData = await presenceRes.json();
        enrichmentResults.socialMedia = presenceData.data?.redesSociais || {};
        enrichmentResults.jusbrasil = presenceData.data?.jusbrasil || null;
        enrichmentResults.marketplaces = presenceData.data?.marketplaces || [];
        
        console.log(`[Enrich] ✅ Presença Digital sucesso:`, {
          redes: Object.keys(enrichmentResults.socialMedia).length,
          jusbrasil: !!enrichmentResults.jusbrasil,
          marketplaces: enrichmentResults.marketplaces.length
        });
      } else {
        enrichmentResults.errors.push(`DigitalPresence: ${presenceRes.status}`);
      }
    } catch (err: any) {
      console.warn('[Enrich] Presença Digital falhou:', err.message);
      enrichmentResults.errors.push(`DigitalPresence: ${err.message}`);
    }
    enrichmentResults.timings.digitalPresence = Date.now() - presenceStart;

    // ========================================
    // 7) MATURITY CALCULATOR: Scores + Fit
    // ========================================
    const maturityStart = Date.now();
    try {
      console.log(`[Enrich] 📊 Calculando maturidade: ${companyId}`);
      
      // Montar detected stack a partir dos sinais coletados
      const detectedStack = {
        erp: [],
        crm: [],
        cloud: [],
        bi: [],
        db: [],
        integrations: [],
        security: []
      };
      
      const maturityRes = await fetch(`${baseUrl}/api/maturity/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: company.projectId,
          companyId,
          vendor: 'TOTVS',
          detectedStack,
          sources: {
            apollo: enrichmentResults.apollo?.ok || false,
            httpHeaders: enrichmentResults.httpHeaders?.ok || false,
            socialMedia: false,
            jusbrasil: false,
            marketplaces: false
          }
        })
      });
      
      if (maturityRes.ok) {
        enrichmentResults.maturity = await maturityRes.json();
        console.log(`[Enrich] ✅ Maturidade calculada: overall ${enrichmentResults.maturity.scores?.overall || 0}`);
      } else {
        enrichmentResults.errors.push(`Maturity: ${maturityRes.status}`);
      }
    } catch (err: any) {
      console.warn('[Enrich] Maturity calculator falhou:', err.message);
      enrichmentResults.errors.push(`Maturity: ${err.message}`);
    }
    enrichmentResults.timings.maturity = Date.now() - maturityStart;

    // ========================================
    // 8) ATUALIZAR ANÁLISE NO BANCO
    // ========================================
    const totalLatency = Date.now() - startTime;
    
    await supabaseAdmin
      .from('Analysis')
      .update({
        score: enrichmentResults.maturity?.scores?.overall || 50,
        insights: JSON.stringify({
          enrichmentStatus: 'completed',
          enrichmentCompletedAt: new Date().toISOString(),
          enrichmentLatency: totalLatency,
          enrichmentTimings: enrichmentResults.timings,
          enrichmentErrors: enrichmentResults.errors,
          maturityScores: enrichmentResults.maturity?.scores || null,
          vendorFit: enrichmentResults.maturity?.fit || null,
          apollo: enrichmentResults.apollo || null,
          httpHeaders: enrichmentResults.httpHeaders || null,
          socialMedia: enrichmentResults.socialMedia || null,
          jusbrasil: enrichmentResults.jusbrasil || null,
          marketplaces: enrichmentResults.marketplaces || null
        }),
        updatedAt: new Date().toISOString()
      })
      .eq('companyId', companyId);

    console.log(`[Enrich] ✅ Enriquecimento completo em ${totalLatency}ms`);

    return NextResponse.json({
      ok: true,
      data: {
        companyId,
        enrichmentStatus: 'completed',
        latency: totalLatency,
        timings: enrichmentResults.timings,
        errors: enrichmentResults.errors,
        maturityScores: enrichmentResults.maturity?.scores || null,
        vendorFit: enrichmentResults.maturity?.fit || null
      }
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[Enrich] ❌ Erro geral em ${latency}ms:`, error.message);

    return NextResponse.json({
      ok: false,
      error: {
        code: 'ENRICHMENT_ERROR',
        message: error.message
      }
    }, { status: 500 });
  }
}

