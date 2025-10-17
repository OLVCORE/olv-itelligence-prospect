import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/seed
 * 
 * Executar seed do banco de dados no Vercel
 */
export async function POST() {
  try {
    console.log('[API /seed] Iniciando seed do banco...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('[API /seed] ✅ Conexão estabelecida')
    
    // Verificar se já existe dados
    const existingUsers = await prisma.user.count()
    const existingProjects = await prisma.project.count()
    const existingCompanies = await prisma.company.count()
    
    console.log(`[API /seed] Dados existentes: ${existingUsers} usuários, ${existingProjects} projetos, ${existingCompanies} empresas`)
    
    if (existingUsers > 0 && existingProjects > 0) {
      console.log('[API /seed] ✅ Banco já populado')
      return NextResponse.json({
        success: true,
        message: 'Banco já populado',
        counts: {
          users: existingUsers,
          projects: existingProjects,
          companies: existingCompanies
        }
      })
    }
    
    // Criar organização
    const organization = await prisma.organization.create({
      data: {
        name: 'OLV Intelligence Demo'
      }
    })
    console.log('[API /seed] ✅ Organização criada')
    
    // Criar projeto
    const project = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: 'Projeto Demo',
        description: 'Projeto de demonstração do sistema OLV'
      }
    })
    console.log('[API /seed] ✅ Projeto criado')
    
    // Criar usuários
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@olv.com',
          name: 'Administrador',
          password: 'admin123',
          role: 'ADMIN'
        }
      }),
      prisma.user.create({
        data: {
          email: 'editor@olv.com',
          name: 'Editor',
          password: 'editor123',
          role: 'EDITOR'
        }
      }),
      prisma.user.create({
        data: {
          email: 'viewer@olv.com',
          name: 'Visualizador',
          password: 'viewer123',
          role: 'VIEWER'
        }
      })
    ])
    console.log('[API /seed] ✅ Usuários criados')
    
    // Criar empresas demo
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          projectId: project.id,
          name: 'TechCorp Soluções Ltda',
          cnpj: '12.345.678/0001-90',
          domain: 'techcorp.com.br',
          cnae: '6201-5/00',
          industry: 'Tecnologia',
          size: 'médio',
          financial: JSON.stringify({
            receita: 5000000,
            porte: 'MÉDIO',
            risco: 'BAIXO',
            faturamento: 5000000
          }),
          location: JSON.stringify({
            cidade: 'São Paulo',
            estado: 'SP',
            pais: 'Brasil'
          })
        }
      }),
      prisma.company.create({
        data: {
          projectId: project.id,
          name: 'Inovação Digital S.A.',
          cnpj: '98.765.432/0001-10',
          domain: 'inovacaodigital.com.br',
          cnae: '6202-3/00',
          industry: 'Tecnologia',
          size: 'grande',
          financial: JSON.stringify({
            receita: 15000000,
            porte: 'GRANDE',
            risco: 'BAIXO',
            faturamento: 15000000
          }),
          location: JSON.stringify({
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            pais: 'Brasil'
          })
        }
      }),
      prisma.company.create({
        data: {
          projectId: project.id,
          name: 'Consultoria Empresarial Ltda',
          cnpj: '11.222.333/0001-44',
          domain: 'consultoriaempresarial.com.br',
          cnae: '7020-4/00',
          industry: 'Consultoria',
          size: 'pequeno',
          financial: JSON.stringify({
            receita: 800000,
            porte: 'PEQUENO',
            risco: 'MÉDIO',
            faturamento: 800000
          }),
          location: JSON.stringify({
            cidade: 'Belo Horizonte',
            estado: 'MG',
            pais: 'Brasil'
          })
        }
      })
    ])
    console.log('[API /seed] ✅ Empresas criadas')
    
    return NextResponse.json({
      success: true,
      message: 'Seed executado com sucesso',
      counts: {
        organizations: 1,
        projects: 1,
        users: users.length,
        companies: companies.length
      }
    })
    
  } catch (error: any) {
    console.error('[API /seed] ❌ Erro:', error)
    console.error('[API /seed] Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Erro ao executar seed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
