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
      className={`node node-area${selected ? ' selected' : ''}`}
      onDoubleClick={() => { setEditing(true); setDraft(data.label) }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="node-tag">Area</div>
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
        <button className="btn-add" onClick={data.onAddChild} title="Add sub-point">+ Point</button>
        <button className="btn-delete" onClick={data.onDelete} title="Delete">✕</button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
