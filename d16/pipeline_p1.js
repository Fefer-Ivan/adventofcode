[
  {
    '$graphLookup': {
      'from': 'd16_graph', 
      'startWith': '$_id', 
      'connectFromField': 'tunnels', 
      'connectToField': '_id', 
      'as': 'bfs', 
      'maxDepth': 30, 
      'depthField': 'depth'
    }
  }, {
    '$addFields': {
      'bfs': { '$sortArray': { 'input': '$bfs', 'sortBy': { '_id': 1 } } }
    }
  }, {
    '$group': {
      '_id': null, 
      'graph': { '$push': '$$ROOT' }
    }
  }, {
    '$addFields': {
      'useful': {
        '$filter': {
          'input': '$graph', 
          'as': 'v', 
          'cond': { '$gt': [ '$$v.rate', 0 ] }
        }
      }
    }
  }, {
    '$addFields': {
      'pressure': {
        '$reduce': {
          'input': { '$range': [ 0, 31 ] }, 
          'initialValue': [], 
          'in': {
            '$concatArrays': [
              '$$value', {
                '$map': {
                  'input': { '$range': [ 0, { '$size': '$graph' } ] }, 
                  'as': 'vi', 
                  'in': {
                    '$let': {
                      'vars': {
                        'v': { '$arrayElemAt': [ '$graph', '$$vi' ] }, 
                        'd': '$$value', 
                        'time': '$$this'
                      }, 
                      'in': {
                        '$map': {
                          'input': {
                            '$range': [ 0, { '$pow': [ 2, { '$size': '$useful' } ] } ]
                          }, 
                          'as': 'mask', 
                          'in': {
                            '$reduce': {
                              'input': {
                                '$map': {
                                  'input': {
                                    '$filter': {
                                      'input': { '$range': [ 0, { '$size': '$useful' } ] }, 
                                      'as': 'ui', 
                                      'cond': {
                                        '$gt': [
                                          {
                                            '$mod': [
                                              {'$floor': {'$divide': ['$$mask', {'$pow': [2, '$$ui']}]}},
                                              2
                                            ]  
                                          },
                                          0
                                        ]
                                      }
                                    }
                                  }, 
                                  'as': 'ui', 
                                  'in': {
                                    '$let': {
                                      'vars': {
                                        'us': { '$arrayElemAt': [ '$useful', '$$ui' ] }, 
                                        'newMask': {
                                          '$subtract': [ '$$mask', { '$pow': [ 2, '$$ui' ] } ]
                                        }
                                      }, 
                                      'in': {
                                        '$let': {
                                          'vars': {
                                            'u': '$$us._id', 
                                            'newTime': {
                                              '$subtract': [
                                                '$$time', {
                                                  '$add': [
                                                    1, { '$getField': {'field': 'depth', 'input': {'$arrayElemAt': ['$$v.bfs', '$$us._id']}}}
                                                  ]
                                                }
                                              ]
                                            }
                                          }, 
                                          'in': {
                                            '$cond': [
                                              { '$lt': [ '$$newTime', 0 ] },
                                              0,
                                              {
                                                '$add': [
                                                  {'$getField': {'field': 'rate', 'input':{'$arrayElemAt': ['$graph', '$$u']}}},
                                                  {'$arrayElemAt': [{'$arrayElemAt': [{'$arrayElemAt': ['$$d', '$$newTime']}, '$$u']}, '$$newMask']}
                                                ]
                                              }
                                            ]
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }, 
                              'initialValue': 0, 
                              'in': { '$max': [ '$$value', '$$this' ] }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
]
