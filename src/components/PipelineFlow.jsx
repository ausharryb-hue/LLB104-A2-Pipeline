import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import RootNode from '../nodes/RootNode'
import AreaNode from '../nodes/AreaNode'
import LeafNode from '../nodes/LeafNode'
import { getLayoutedElements } from '../utils/layout'
import { uid } from '../utils/storage'

const nodeTypes = { root: RootNode, area: AreaNode, leaf: LeafNode }

const edgeDefaults = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#555452' },
  style: { stroke: '#3a3a38', strokeWidth: 1.5 },
}

export default function PipelineFlow({ initialNodes, initialEdges, onUpdate, onStateReady }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])

  useEffect(() => {
    onStateReady({
      getNodes: () => nodesRef.current,
      getEdges: () => edgesRef.current,
    })
  }, [onStateReady])

  useEffect(() => { onUpdate(nodes, edges) }, [nodes, edges, onUpdate])

  const relayout = useCallback(() => {
    const { nodes: ln, edges: le } = getLayoutedElements(nodesRef.current, edgesRef.current)
    setNodes(ln)
    setEdges(le)
  }, [setNodes, setEdges])

  const updateNodeData = useCallback((id, patch) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
  }, [setNodes])

  const addChild = useCallback((parentId, parentType) => {
    const childType = parentType === 'root' ? 'area' : 'leaf'
    const childId = uid()
    const label = childType === 'area' ? 'New area' : 'New point'
    const newNode = { id: childId, type: childType, position: { x: 0, y: 0 }, data: { label } }
    const newEdge = { id: `e-${parentId}-${childId}`, source: parentId, target: childId, ...edgeDefaults }
    const { nodes: ln, edges: le } = getLayoutedElements([...nodesRef.current, newNode], [...edgesRef.current, newEdge])
    setNodes(ln)
    setEdges(le)
  }, [setNodes, setEdges])

  const deleteNode = useCallback((id) => {
    const descendants = new Set([id])
    let changed = true
    while (changed) {
      changed = false
      edgesRef.current.forEach(e => {
        if (descendants.has(e.source) && !descendants.has(e.target)) { descendants.add(e.target); changed = true }
      })
    }
    const { nodes: ln, edges: le } = getLayoutedElements(
      nodesRef.current.filter(n => !descendants.has(n.id)),
      edgesRef.current.filter(e => !descendants.has(e.source) && !descendants.has(e.target))
    )
    setNodes(ln)
    setEdges(le)
  }, [setNodes, setEdges])

  const nodesWithHandlers = useMemo(() =>
    nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onLabelChange: (label) => updateNodeData(node.id, { label }),
        onAddChild: () => addChild(node.id, node.type),
        onDelete: () => deleteNode(node.id),
      },
    })),
    [nodes, updateNodeData, addChild, deleteNode]
  )

  return (
    <div className="canvas">
      <div className="canvas-toolbar">
        <button className="btn-tool" onClick={relayout}>Auto Layout</button>
      </div>
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#252523" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => '#2e2e2c'}
          maskColor="rgba(12,12,11,0.75)"
          style={{ background: '#1a1a18', border: '1px solid #2c2c2a' }}
        />
      </ReactFlow>
    </div>
  )
}