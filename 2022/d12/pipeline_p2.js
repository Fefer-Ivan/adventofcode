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
      'end': {
        '$reduce': {
          'input': {
            '$range': [ 0, { '$size': '$input' } ]
          }, 
          'initialValue': {}, 
          'in': {
            '$let': {
              'vars': {
                'y': { '$indexOfArray': [ { '$arrayElemAt': [ '$input', '$$this' ] }, 'E' ] }
              }, 
              'in': {
                '$cond': [
                    { '$eq': [ '$$y', -1 ] },
                    '$$value',
                    { 'x': '$$this', 'y': '$$y' }
                ]
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'start': {
        '$filter': {
          'input': {
            '$reduce': {
              'input': { '$range': [ 0, { '$size': '$input' } ] }, 
              'initialValue': [], 
              'in': {
                '$concatArrays': [
                  '$$value',
                  {
                    '$map': {
                      'input': {'$range': [0, {'$size': {'$arrayElemAt': ['$input', '$$this']}}]}, 
                      'as': 'y', 
                      'in': { 'x': '$$this', 'y': '$$y' }
                    }
                  }
                ]
              }
            }
          }, 
          'cond': {
            '$eq': [
              'a',
              { '$arrayElemAt': [ { '$arrayElemAt': [ '$input', '$$this.x' ] }, '$$this.y' ] }
            ]
          }
        }
      }
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
