import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'OLV Intelligence API',
    time: new Date().toISOString(),
    version: '1.0.0',
    status: 'operational'
  })
}

