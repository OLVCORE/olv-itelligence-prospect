import { NextRequest, NextResponse } from 'next/server';
import { fetchDigitalPresence } from '@/lib/services/digital-presence';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * PRESENÇA DIGITAL COMPLETA
 * 
 * Busca:
 * - Website oficial
 * - Instagram, LinkedIn, Facebook, YouTube, Twitter
 * - Jusbrasil (processos e menções)
 * - Marketplaces B2B
 * 
 * Retorna dados validados com score de confiança.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { companyName, cnpj, fantasia, website, socios, companyId } = await req.json();
    
    if (!companyName || !cnpj) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_PARAMS', message: 'companyName e cnpj são obrigatórios' }
      }, { status: 400 });
    }

    console.log(`[Digital Presence API] 🔍 Iniciando busca para: ${companyName}`);

    const presenceData = await fetchDigitalPresence(
      companyName,
      cnpj,
      fantasia,
      website,
      socios
    );

    // ========================================
    // PERSISTIR DADOS (ADITIVO, SEGURO)
    // ========================================
    
    try {
      if (companyId) {
        const sb = supabaseAdmin();
        
        // 1) Salvar redes sociais como TechSignals
        const socialMediaEntries = Object.entries(presenceData.redesSociais || {});
        
        for (const [platform, data] of socialMediaEntries) {
          if (data && typeof data === 'object' && 'url' in data) {
            await sb.from('TechSignals').insert({
              companyId,
              kind: 'social_media',
              key: platform, // 'instagram', 'linkedin', etc.
              value: JSON.stringify(data), // { url, confidence, validationScore, reasons }
              confidence: data.confidence || 50,
              source: 'google_cse_digital_presence',
              url: data.url,
              fetchedAt: new Date().toISOString()
            });
          }
        }
        
        console.log(`[Digital Presence API] ✅ ${socialMediaEntries.length} redes sociais salvas`);

        // 2) Salvar Jusbrasil como TechSignal
        if (presenceData.jusbrasil) {
          await sb.from('TechSignals').insert({
            companyId,
            kind: 'jusbrasil',
            key: 'legal_mentions',
            value: JSON.stringify(presenceData.jusbrasil),
            confidence: presenceData.jusbrasil.confidence || 70,
            source: 'google_cse_jusbrasil',
            url: presenceData.jusbrasil.url || null,
            fetchedAt: new Date().toISOString()
          });
          
          console.log(`[Digital Presence API] ✅ Jusbrasil salvo`);
        }

        // 3) Salvar Marketplaces como TechSignals
        for (const marketplace of presenceData.marketplaces || []) {
          await sb.from('TechSignals').insert({
            companyId,
            kind: 'marketplace',
            key: marketplace.platform || 'marketplace_b2b',
            value: JSON.stringify(marketplace),
            confidence: marketplace.confidence || 60,
            source: 'google_cse_marketplaces',
            url: marketplace.url,
            fetchedAt: new Date().toISOString()
          });
        }
        
        console.log(`[Digital Presence API] ✅ ${presenceData.marketplaces?.length || 0} marketplaces salvos`);

        // 4) Atualizar Company com website oficial (se encontrado)
        if (presenceData.website?.url) {
          await sb.from('Company').update({
            domain: presenceData.website.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
            updatedAt: new Date().toISOString()
          }).eq('id', companyId);
          
          console.log(`[Digital Presence API] ✅ Website oficial atualizado: ${presenceData.website.url}`);
        }
      }
    } catch (err: any) {
      console.warn('[Digital Presence API] ⚠️ Erro ao persistir dados:', err.message);
      // Não falhar aqui, dados já foram coletados
    }

    const latency = Date.now() - startTime;
    console.log(`[Digital Presence API] ✅ Concluído em ${latency}ms`);

    return NextResponse.json({
      ok: true,
      data: presenceData,
      latency
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[Digital Presence API] ❌ Erro em ${latency}ms:`, error.message);

    return NextResponse.json({
      ok: false,
      error: {
        code: 'DIGITAL_PRESENCE_ERROR',
        message: error.message
      }
    }, { status: 500 });
  }
}

