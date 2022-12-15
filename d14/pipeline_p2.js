[
  {
    '$match': { 'graph.point': { 'x': 500, 'y': 0 } }
  }, {
    '$graphLookup': {
      'from': 'd14_graph', 
      'startWith': '$graph.point', 
      'connectFromField': 'graph.deps', 
      'connectToField': 'graph.point', 
      'as': 'bfs', 
      'depthField': 'depth'
    }
  }, {
    '$unwind': { 'path': '$bfs' }
  }, {
    '$sort': {
      'bfs.depth': 1, 
      'bfs.graph.point.x': 1
    }
  }, {
    '$count': 'result'
  }
]
