import { NextResponse } from 'next/server'
import { apolloCompanyEnrich } from '@/lib/integrations/apollo'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const params = await req.json()

    if (!params.domain && !params.organization_name) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_PARAMS', message: 'domain ou organization_name é obrigatório' }
      }, { status: 400 })
    }

    const data = await apolloCompanyEnrich(params)

    // UPSERT Firmographics se tiver companyId
    if (params.companyId && data.organizations && data.organizations.length > 0) {
      const org = data.organizations[0]
      
      await supabaseAdmin.from('Firmographics').upsert({
        companyId: params.companyId,
        employeesRange: org.estimated_num_employees || null,
        revenueRange: org.estimated_annual_revenue || null,
        techTags: org.keywords || [],
        source: 'apollo',
        fetchedAt: new Date().toISOString()
      }, {
        onConflict: 'companyId,source'
      })
      
      console.log('[Apollo] ✅ Firmographics salvo para:', params.companyId)
    }

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Apollo] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'APOLLO_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}


