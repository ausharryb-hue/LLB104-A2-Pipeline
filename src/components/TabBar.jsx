import { useState } from 'react'

export default function TabBar({ pipelines, activeId, onSwitch, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')

  function startRename(pipeline, e) {
    e.stopPropagation()
    setEditingId(pipeline.id)
    setDraft(pipeline.name)
  }

  function commitRename(id) {
    setEditingId(null)
    if (draft.trim()) onRename(id, draft.trim())
  }

  return (
    <div className="tabbar">
      <div className="tabbar-tabs">
        {pipelines.map(p => (
          <div
            key={p.id}
            className={`tab${p.id === activeId ? ' tab--active' : ''}`}
            onClick={() => onSwitch(p.id)}
          >
            {editingId === p.id ? (
              <input
                className="tab-edit"
                value={draft}
                autoFocus
                onClick={e => e.stopPropagation()}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => commitRename(p.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename(p.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <span className="tab-name" onDoubleClick={e => startRename(p, e)}>
                {p.name}
              </span>
            )}
            {pipelines.length > 1 && (
              <button
                className="tab-close"
                onClick={e => { e.stopPropagation(); onDelete(p.id) }}
                title="Delete pipeline"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="tab-add" onClick={onAdd} title="New pipeline">+</button>
    </div>
  )
}
