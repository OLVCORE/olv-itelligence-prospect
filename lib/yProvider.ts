"use client"

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export interface YDocInstance {
  doc: Y.Doc
  provider: WebsocketProvider
  nodes: Y.Array<any>
  edges: Y.Array<any>
}

export function createYDoc(roomId: string): YDocInstance {
  const doc = new Y.Doc()
  
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234'
  
  const provider = new WebsocketProvider(
    wsUrl,
    roomId,
    doc,
    {
      connect: true,
    }
  )
  
  const nodes = doc.getArray('nodes')
  const edges = doc.getArray('edges')
  
  return { doc, provider, nodes, edges }
}

export function destroyYDoc(instance: YDocInstance): void {
  instance.provider.destroy()
  instance.doc.destroy()
}

