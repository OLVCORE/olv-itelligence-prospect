/**
 * PhantomBuster Integration - LinkedIn Automation
 * Docs: https://phantombuster.com/api-docs
 */

interface PhantomLaunchParams {
  agentId: string
  argument?: any
}

export async function phantomLaunchAgent(params: PhantomLaunchParams): Promise<any> {
  const apiKey = process.env.PHANTOM_BUSTER_API_KEY
  
  if (!apiKey) {
    throw new Error('PHANTOM_BUSTER_API_KEY não configurado')
  }

  console.log('[PhantomBuster] 🤖 Lançando agent:', params.agentId)

  try {
    const response = await fetch('https://api.phantombuster.com/api/v2/agents/launch', {
      method: 'POST',
      headers: {
        'X-Phantombuster-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: params.agentId,
        argument: params.argument || {}
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`PhantomBuster HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[PhantomBuster] ✅ Agent lançado:', data.containerId)
    
    return data
  } catch (error: any) {
    console.error('[PhantomBuster] ❌ Erro:', error.message)
    throw error
  }
}

export async function phantomGetOutput(containerId: string): Promise<any> {
  const apiKey = process.env.PHANTOM_BUSTER_API_KEY
  
  if (!apiKey) {
    throw new Error('PHANTOM_BUSTER_API_KEY não configurado')
  }

  console.log('[PhantomBuster] 📥 Buscando output:', containerId)

  try {
    const response = await fetch(
      `https://api.phantombuster.com/api/v2/containers/fetch-output?id=${containerId}`,
      {
        headers: { 'X-Phantombuster-Key': apiKey },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`PhantomBuster HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[PhantomBuster] ✅ Output recebido')
    
    return data
  } catch (error: any) {
    console.error('[PhantomBuster] ❌ Erro:', error.message)
    throw error
  }
}

