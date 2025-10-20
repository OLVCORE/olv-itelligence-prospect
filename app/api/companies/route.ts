import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    console.log('[API /companies] 🔍 Buscando empresas reais...')
    
    const { data: companies, error } = await supabaseAdmin
      .from('Company')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[API /companies] ❌ Erro ao buscar empresas:', error)
      return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 })
    }

    console.log(`[API /companies] ✅ ${companies?.length || 0} empresas encontradas`)

    return NextResponse.json({ 
      companies: companies || [],
      total: companies?.length || 0
    })
  } catch (error: any) {
    console.error('[API /companies] ❌ Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cnpj, name, tradeName } = body

    if (!cnpj) {
      return NextResponse.json({ error: "CNPJ é obrigatório" }, { status: 400 })
    }

    console.log('[API /companies] 🔍 Criando empresa:', { cnpj, name })

    // Verificar se empresa já existe
    const { data: existing } = await supabaseAdmin
      .from('Company')
      .select('id')
      .eq('cnpj', cnpj)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: "Empresa já existe",
        company: existing
      }, { status: 409 })
    }

    // Criar nova empresa
    const { data: newCompany, error } = await supabaseAdmin
      .from('Company')
      .insert({
        cnpj,
        name: name || 'Empresa sem razão social',
        tradeName: tradeName || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[API /companies] ❌ Erro ao criar empresa:', error)
      return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
    }

    console.log('[API /companies] ✅ Empresa criada:', newCompany.id)

    return NextResponse.json({ 
      company: newCompany,
      message: 'Empresa criada com sucesso'
    }, { status: 201 })

  } catch (error: any) {
    console.error('[API /companies] ❌ Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}