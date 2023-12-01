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
    '$addFields': {
      'input': {
        '$map': {
          'input': '$input', 
          'as': 'line', 
          'in': {
            '$map': {
              'input': '$$line', 
              'as': 'e', 
              'in': {
                '$switch': {
                  'default': { '$indexOfBytes': [ 'abcdefghijklmnopqrstuvwxyz', '$$e' ] }, 
                  'branches': [
                    { 'case': { '$eq': [ '$$e', 'S' ] }, 'then': 0 },
                    { 'case': { '$eq': [ '$$e', 'E' ] }, 'then': 25 }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'position': {
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
      }
    }
  }, {
    '$unwind': { 'path': '$position' }
  }, {
    '$addFields': {
      'edges': {
        'from': [ '$position.x', '$position.y' ], 
        'to': {
          '$filter': {
            'input': { '$map': {
                'input': [ [ 0, 1 ], [ 0, -1 ], [ 1, 0 ], [ -1, 0 ] ], 
                'as': 'diff', 
                'in': {
                  'nx': { '$add': [ '$position.x', { '$arrayElemAt': [ '$$diff', 0 ] } ] }, 
                  'ny': { '$add': [ '$position.y', { '$arrayElemAt': [ '$$diff', 1 ] } ] }
                }
              }
            }, 
            'cond': {
              '$and': [
                {'$lte': [0, '$$this.nx']}, {'$gt': [{'$size': '$input'}, '$$this.nx']},
                {'$lte': [0, '$$this.ny']}, {'$gt': [{'$size': {'$arrayElemAt': ['$input', '$position.x']}}, '$$this.ny']},
                {'$gte': [
                    {'$add': [{'$arrayElemAt': [{'$arrayElemAt':['$input','$position.x']}, '$position.y']}, 1]},
                    {'$arrayElemAt': [{'$arrayElemAt': ['$input', '$$this.nx']}, '$$this.ny']}
                ]}
              ]
            }
          }
        }
      }
    }
  }, {
    '$unwind': { 'path': '$edges' }
  }, {
    '$replaceRoot': { 'newRoot': '$edges' }
  }, {
    '$addFields': {
      'to': {
        '$map': {
          'input': '$to', 
          'in': [ '$$this.nx', '$$this.ny' ]
        }
      }
    }
  }, {
    '$out': 'd12_graph'
  }
]
