import { useCallback, useEffect, useRef, useState } from 'react'
import './app.css'

import TabBar from './components/TabBar'
import PipelineFlow from './components/PipelineFlow'
import { loadAll, saveAll, createPipeline } from './utils/storage'

export default function App() {
  const [data, setData] = useState(() => loadAll())
  const flowStateRef = useRef(null)

  const activePipeline = data.pipelines.find(p => p.id === data.activeId)

  useEffect(() => {
    saveAll(data.pipelines, data.activeId)
  }, [data])

  function snapshotCurrent(pipelines, activeId) {
    if (!flowStateRef.current) return pipelines
    const nodes = flowStateRef.current.getNodes()
    const edges = flowStateRef.current.getEdges()
    return pipelines.map(p => p.id === activeId ? { ...p, nodes, edges } : p)
  }

  const handleSwitch = useCallback((newId) => {
    setData(prev => {
      const snapped = snapshotCurrent(prev.pipelines, prev.activeId)
      return { pipelines: snapped, activeId: newId }
    })
  }, [])

  const handleAdd = useCallback(() => {
    const p = createPipeline(`Pipeline ${data.pipelines.length + 1}`)
    setData(prev => {
      const snapped = snapshotCurrent(prev.pipelines, prev.activeId)
      return { pipelines: [...snapped, p], activeId: p.id }
    })
  }, [data.pipelines.length])

  const handleRename = useCallback((id, name) => {
    setData(prev => ({
      ...prev,
      pipelines: prev.pipelines.map(p => p.id === id ? { ...p, name } : p),
    }))
  }, [])

  const handleDelete = useCallback((id) => {
    setData(prev => {
      if (prev.pipelines.length <= 1) return prev
      const next = prev.pipelines.filter(p => p.id !== id)
      const activeId = prev.activeId === id ? next[0].id : prev.activeId
      return { pipelines: next, activeId }
    })
  }, [])

  const handleUpdate = useCallback((nodes, edges) => {
    setData(prev => ({
      ...prev,
      pipelines: prev.pipelines.map(p =>
        p.id === prev.activeId ? { ...p, nodes, edges } : p
      ),
    }))
  }, [])

  const handleStateReady = useCallback((state) => {
    flowStateRef.current = state
  }, [])

  return (
    <div className="app">
      <header className="header">
        <span className="header-title">Essay Pipeline</span>
        <span className="header-hint">Double-click any node to edit · Double-click a tab to rename</span>
      </header>

      <TabBar
        pipelines={data.pipelines}
        activeId={data.activeId}
        onSwitch={handleSwitch}
        onAdd={handleAdd}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {activePipeline && (
        <PipelineFlow
          key={data.activeId}
          initialNodes={activePipeline.nodes}
          initialEdges={activePipeline.edges}
          onUpdate={handleUpdate}
          onStateReady={handleStateReady}
        />
      )}
    </div>
  )
}