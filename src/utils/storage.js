const STORAGE_KEY = 'llb104-pipelines'

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function defaultRootNode() {
  return {
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: 'Double-click to enter your central argument' },
  }
}

export function createPipeline(name = 'New Pipeline') {
  return { id: uid(), name, nodes: [defaultRootNode()], edges: [] }
}

export function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data.pipelines) && data.pipelines.length) return data
    }
  } catch {}
  const first = createPipeline('Pipeline 1')
  return { pipelines: [first], activeId: first.id }
}

export function saveAll(pipelines, activeId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pipelines, activeId }))
  } catch {}
}
