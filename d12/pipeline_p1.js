[
  {
    '$project': {
      'input': {
        '$map': {
          'input': '$input', 
          'as': 'line', 
          'in': {
            '$map': {
              'input': { '$range': [ 0, { '$strLenBytes': '$$line' } ] }, 
              'as': 'i', 
              'in': { '$substrBytes': [ '$$line', '$$i', 1 ] }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'coords': {
        '$reduce': {
          'input': { '$range': [ 0, { '$size': '$input' } ] }, 
          'initialValue': [ {}, {} ], 
          'in': {
            '$let': {
              'vars': {
                'ys': [
                  { '$indexOfArray': [ { '$arrayElemAt': [ '$input', '$$this' ] }, 'S' ] },
                  { '$indexOfArray': [ { '$arrayElemAt': [ '$input', '$$this' ] }, 'E' ] }
                ]
              }, 
              'in': {
                '$map': {
                  'input': { '$range': [ 0, 2 ] }, 
                  'as': 'i', 
                  'in': {
                    '$cond': [
                      { '$eq': [ { '$arrayElemAt': [ '$$ys', '$$i' ] }, -1 ] },
                      { '$arrayElemAt': [ '$$value', '$$i' ] },
                      [ '$$this', { '$arrayElemAt': [ '$$ys', '$$i' ] } ]
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  }, {
    '$project': {
      'start': { '$arrayElemAt': [ '$coords', 0 ] }, 
      'end': { '$arrayElemAt': [ '$coords', 1 ] }
    }
  }, {
    '$graphLookup': {
      'from': 'd12_graph', 
      'startWith': '$start', 
      'connectFromField': 'to', 
      'connectToField': 'from', 
      'as': 'bfs', 
      'depthField': 'depth'
    }
  }, {
    '$addFields': {
      'bfs': {
        '$filter': {
          'input': '$bfs', 
          'cond': { '$eq': [ '$$this.from', '$end' ] }
        }
      }
    }
  }
]
