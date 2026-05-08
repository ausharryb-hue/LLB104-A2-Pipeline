import dagre from 'dagre'

const NODE_WIDTH = 240
const NODE_HEIGHT = 100

export function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80, marginx: 40, marginy: 40 })

  nodes.forEach((node) => {
    const w = node.type === 'root' ? 320 : NODE_WIDTH
    const h = node.type === 'root' ? 120 : NODE_HEIGHT
    g.setNode(node.id, { width: w, height: h })
  })

  edges.forEach((edge) => { g.setEdge(edge.source, edge.target) })

  dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const n = g.node(node.id)
      const w = node.type === 'root' ? 320 : NODE_WIDTH
      const h = node.type === 'root' ? 120 : NODE_HEIGHT
      return { ...node, position: { x: n.x - w / 2, y: n.y - h / 2 } }
    }),
    edges,
  }
}