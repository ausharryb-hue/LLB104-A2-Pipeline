import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import './app.css'

import RootNode from './nodes/RootNode'
import AreaNode from './nodes/AreaNode'
import LeafNode from './nodes/LeafNode'
import { getLayoutedElements } from './utils/layout'

const nodeTypes = { root: RootNode, area: AreaNode, leaf: LeafNode }

const STORAGE_KEY = 'llb104-essay-tree'

function uid() {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const defaultNodes = [
  {
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: 'Double-click to enter your central argument' },
  },
]

const defaultEdges = []

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveState(nodes, edges) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
  } catch {}
}

const edgeDefaults = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#6b6375' },
  style: { stroke: '#6b6375', strokeWidth: 2 },
}

export default function App() {
  const saved = useMemo(() => loadState(), [])

  const [nodes, setNodes, onNodesChange] = useNodesState(saved?.nodes ?? defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(saved?.edges ?? defaultEdges)
  const [title, setTitle] = useState('LLB104 — Essay Pipeline')
  const [editingTitle, setEditingTitle] = useState(false)

  // Live refs so callbacks always see current state without re-creating
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])

  useEffect(() => { saveState(nodes, edges) }, [nodes, edges])

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

    const newNode = {
      id: childId,
      type: childType,
      position: { x: 0, y: 0 },
      data: { label, status: 'todo' },
    }
    const newEdge = {
      id: `e-${parentId}-${childId}`,
      source: parentId,
      target: childId,
      ...edgeDefaults,
    }

    const nextNodes = [...nodesRef.current, newNode]
    const nextEdges = [...edgesRef.current, newEdge]
    const { nodes: ln, edges: le } = getLayoutedElements(nextNodes, nextEdges)
    setNodes(ln)
    setEdges(le)
  }, [setNodes, setEdges])

  const deleteNode = useCallback((id) => {
    const curNodes = nodesRef.current
    const curEdges = edgesRef.current

    const descendants = new Set([id])
    let changed = true
    while (changed) {
      changed = false
      curEdges.forEach(e => {
        if (descendants.has(e.source) && !descendants.has(e.target)) {
          descendants.add(e.target)
          changed = true
        }
      })
    }

    const nextNodes = curNodes.filter(n => !descendants.has(n.id))
    const nextEdges = curEdges.filter(
      e => !descendants.has(e.source) && !descendants.has(e.target)
    )
    const { nodes: ln, edges: le } = getLayoutedElements(nextNodes, nextEdges)
    setNodes(ln)
    setEdges(le)
  }, [setNodes, setEdges])

  const nodesWithHandlers = useMemo(() =>
    nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onLabelChange: (label) => updateNodeData(node.id, { label }),
        onStatusChange: (status) => updateNodeData(node.id, { status }),
        onAddChild: () => addChild(node.id, node.type),
        onDelete: () => deleteNode(node.id),
      },
    })),
    [nodes, updateNodeData, addChild, deleteNode]
  )

  return (
    <div className="app">
      <header className="header">
        {editingTitle ? (
          <input
            className="title-edit"
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
          />
        ) : (
          <h1 className="title" onDoubleClick={() => setEditingTitle(true)}>{title}</h1>
        )}
        <div className="header-actions">
          <button className="btn-layout" onClick={relayout}>Auto Layout</button>
          <button
            className="btn-layout"
            onClick={() => {
              if (confirm('Reset the tree? This cannot be undone.')) {
                setNodes(defaultNodes)
                setEdges(defaultEdges)
              }
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <div className="canvas">
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#2a2a3a" gap={24} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'root') return '#c9a84c'
              if (n.type === 'area') return '#4a7fb5'
              const s = n.data?.status || 'todo'
              return s === 'done' ? '#4a9e6b' : s === 'in-progress' ? '#b07d3a' : '#5a5a7a'
            }}
            maskColor="rgba(15,17,23,0.7)"
            style={{ background: '#1a1c26' }}
          />
        </ReactFlow>
      </div>

      <footer className="footer">
        <span>
          Double-click a node to edit &nbsp;·&nbsp;
          Click <strong>+ Branch</strong> or <strong>+ Point</strong> to expand &nbsp;·&nbsp;
          Click the status badge on a point to cycle To Do → In Progress → Done
        </span>
      </footer>
    </div>
  )
}
