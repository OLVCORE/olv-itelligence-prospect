"use client"

import React, { useEffect, useState, useCallback } from "react"
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState
} from "reactflow"
import "reactflow/dist/style.css"
import { createYDoc, destroyYDoc, YDocInstance } from "@/lib/yProvider"

interface CanvasBoardProps {
  roomId: string
  mode: "canva" | "powerbi"
}

const nodeTypes: NodeTypes = {
  // Custom node types can be added here
}

export default function CanvasBoard({ roomId, mode }: CanvasBoardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [yDoc, setYDoc] = useState<YDocInstance | null>(null)

  useEffect(() => {
    const instance = createYDoc(roomId)
    setYDoc(instance)

    const updateFromYjs = () => {
      const nodesData = instance.nodes.toArray() as Node[]
      const edgesData = instance.edges.toArray() as Edge[]
      setNodes(nodesData)
      setEdges(edgesData)
    }

    instance.nodes.observeDeep(updateFromYjs)
    instance.edges.observeDeep(updateFromYjs)
    
    updateFromYjs()

    return () => {
      destroyYDoc(instance)
    }
  }, [roomId, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges)
      setEdges(newEdges)
      
      if (yDoc) {
        yDoc.edges.delete(0, yDoc.edges.length)
        yDoc.edges.push(newEdges)
      }
    },
    [edges, setEdges, yDoc]
  )

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      
      if (yDoc) {
        const currentNodes = nodes.map(node => {
          const change = changes.find((c: any) => c.id === node.id)
          if (change?.position) {
            return { ...node, position: change.position }
          }
          return node
        })
        
        yDoc.nodes.delete(0, yDoc.nodes.length)
        yDoc.nodes.push(currentNodes)
      }
    },
    [nodes, onNodesChange, yDoc]
  )

  const containerClass = mode === "powerbi" 
    ? "bg-neutral-900 text-white" 
    : "bg-white"

  return (
    <div 
      className={`${containerClass} rounded-xl border`} 
      style={{ height: "calc(100vh - 200px)" }}
    >
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color={mode === "powerbi" ? "#444" : "#aaa"} gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={mode === "powerbi" ? "#1f2937" : "#e5e7eb"}
          maskColor={mode === "powerbi" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.2)"}
        />
      </ReactFlow>
    </div>
  )
}

