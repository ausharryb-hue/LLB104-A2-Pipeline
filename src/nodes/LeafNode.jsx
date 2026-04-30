import { useCallback, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

const STATUS_CYCLE = ['todo', 'in-progress', 'done']
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }

export default function LeafNode({ data, selected }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft.trim()) data.onLabelChange(draft.trim())
    else setDraft(data.label)
  }, [draft, data])

  const cycleStatus = (e) => {
    e.stopPropagation()
    const idx = STATUS_CYCLE.indexOf(data.status || 'todo')
    data.onStatusChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length])
  }

  return (
    <div
      className={`node node-leaf node-leaf--${data.status || 'todo'}${selected ? ' selected' : ''}`}
      onDoubleClick={() => { setEditing(true); setDraft(data.label) }}
    >
      <Handle type="target" position={Position.Top} />
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
        <button className="btn-status" onClick={cycleStatus}>
          {STATUS_LABELS[data.status || 'todo']}
        </button>
        <button className="btn-delete" onClick={data.onDelete} title="Delete">✕</button>
      </div>
    </div>
  )
}
