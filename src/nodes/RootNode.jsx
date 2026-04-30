import { useCallback, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

export default function RootNode({ data, selected }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft.trim()) data.onLabelChange(draft.trim())
    else setDraft(data.label)
  }, [draft, data])

  return (
    <div
      className={`node node-root${selected ? ' selected' : ''}`}
      onDoubleClick={() => { setEditing(true); setDraft(data.label) }}
    >
      <div className="node-tag">Central Argument</div>
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
        <button className="btn-add" onClick={data.onAddChild} title="Add branch">+ Branch</button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
