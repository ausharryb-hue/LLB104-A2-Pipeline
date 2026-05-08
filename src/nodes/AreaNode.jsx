import { useCallback, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

export default function AreaNode({ data, selected }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft.trim()) data.onLabelChange(draft.trim())
    else setDraft(data.label)
  }, [draft, data])

  return (
    <div
      className={`node node-area${selected ? ' node--selected' : ''}`}
      onDoubleClick={() => { setEditing(true); setDraft(data.label) }}
    >
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="node-eyebrow">Area</div>
      {editing ? (
        <textarea
          className="node-edit"
          value={draft}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() } }}
        />
      ) : (
        <div className="node-label">{data.label}</div>
      )}
      <div className="node-actions">
        <button className="btn-add" onClick={data.onAddChild}>+ Add Point</button>
        <button className="btn-delete" onClick={data.onDelete}>✕</button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  )
}