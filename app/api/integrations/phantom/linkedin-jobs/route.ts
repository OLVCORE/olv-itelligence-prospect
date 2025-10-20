import { NextResponse } from 'next/server'
import { phantomLaunchAgent } from '@/lib/integrations/phantom'

export async function POST(req: Request) {
  try {
    const { agentId, companyLinkedinUrl } = await req.json()

    if (!agentId) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_AGENT_ID', message: 'agentId é obrigatório' }
      }, { status: 400 })
    }

    const data = await phantomLaunchAgent({
      agentId,
      argument: {
        companyUrl: companyLinkedinUrl,
        numberOfJobs: 50
      }
    })

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Phantom] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'PHANTOM_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

