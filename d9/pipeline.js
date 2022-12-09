[
  {
    '$project': {
      'commands': {
        '$map': {
          'input': '$commands', 
          'as': 'command', 
          'in': {
            'count': '$$command.count', 
            'dir': {
              '$switch': {
                'branches': [
                  { 'case': { '$eq': [ '$$command.dir', 'U' ] }, 'then': 0}, 
                  { 'case': { '$eq': [ '$$command.dir', 'D' ] }, 'then': 1}, 
                  { 'case': { '$eq': [ '$$command.dir', 'L' ] }, 'then': 2}, 
                  { 'case': { '$eq': [ '$$command.dir', 'R' ] }, 'then': 3}
                ]
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'initialState': [
        [[ 0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
      ]
    }
  }, {
    '$unwind': { 'path': '$initialState' }
  }, {
    '$addFields': {
      'result': {
        '$let': {
          'vars': {
            'vectors': [[0, 1], [0, -1], [1, 0], [-1, 0]]
          }, 
          'in': {
            '$reduce': {
              'input': '$commands', 
              'initialValue': { 'state': '$initialState', 'visited': [] }, 
              'in': {
                '$let': {
                  'vars': { 'command': '$$this' }, 
                  'in': {
                    '$reduce': {
                      'input': { '$range': [ 0, '$$command.count' ] }, 
                      'initialValue': '$$value', 
                      'in': {
                        '$let': {
                          'vars': { 'oldState': '$$value.state' }, 
                          'in': {
                            'state': {
                              '$reduce': {
                                'input': { '$range': [ 1, { '$size': '$$oldState' } ]
                                }, 
                                'initialValue': [
                                  {
                                    '$map': {
                                      'input': { '$range': [ 0, 2 ] }, 
                                      'as': 'i', 
                                      'in': {
                                        '$add': [
                                          {'$arrayElemAt': [{'$arrayElemAt': ['$$oldState', 0]}, '$$i']}, 
                                          {'$arrayElemAt': [{'$arrayElemAt': ['$$vectors', '$$command.dir']}, '$$i']}
                                        ]
                                      }
                                    }
                                  }
                                ], 
                                'in': {
                                  '$concatArrays': [
                                    '$$value', [
                                      {
                                        '$let': {
                                          'vars': {
                                            'prev': { '$arrayElemAt': [ '$$value', -1 ] }, 
                                            'next': { '$arrayElemAt': [ '$$oldState', '$$this' ] }
                                          }, 
                                          'in': {
                                            '$cond': [
                                              {
                                                '$or': [
                                                  {
                                                    '$gt': [
                                                      {
                                                        '$abs': {
                                                          '$subtract': [
                                                            { '$arrayElemAt': [ '$$prev', 0 ] }, 
                                                            { '$arrayElemAt': [ '$$next', 0 ] }
                                                          ]
                                                        }
                                                      }, 1
                                                    ]
                                                  }, {
                                                    '$gt': [
                                                      {
                                                        '$abs': {
                                                          '$subtract': [
                                                            { '$arrayElemAt': [ '$$prev', 1 ] },
                                                            { '$arrayElemAt': [ '$$next', 1 ] }
                                                          ]
                                                        }
                                                      }, 1
                                                    ]
                                                  }
                                                ]
                                              }, {
                                                '$map': {
                                                  'input': { '$range': [ 0, 2 ] }, 
                                                  'as': 'i', 
                                                  'in': {
                                                    '$let': {
                                                      'vars': {
                                                        'p': { '$arrayElemAt': [ '$$prev', '$$i' ] }, 
                                                        'n': { '$arrayElemAt': [ '$$next', '$$i' ] }
                                                      }, 
                                                      'in': {
                                                        '$switch': {
                                                          'branches': [
                                                            {
                                                              'case': { '$eq': [ '$$n', '$$p' ] }, 
                                                              'then': '$$n'
                                                            }, {
                                                              'case': { '$lt': [ '$$n', '$$p' ] }, 
                                                              'then': { '$add': [ '$$n', 1 ] }
                                                            }, {
                                                              'case': { '$gt': [ '$$n', '$$p' ] }, 
                                                              'then': { '$subtract': [ '$$n', 1 ] }
                                                            }
                                                          ]
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }, '$$next'
                                            ]
                                          }
                                        }
                                      }
                                    ]
                                  ]
                                }
                              }
                            }, 
                            'visited': {
                              '$concatArrays': ['$$value.visited', [{'$arrayElemAt': ['$$value.state', -1]}]]
                            }
                          }
                        }
                      }
                    }
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
      'result': {
        'visited': {
          '$concatArrays': [ '$result.visited', [ { '$arrayElemAt': [ '$result.state', -1 ] } ] ]
        }
      }
    }
  }, {
    '$unwind': { 'path': '$result.visited' }
  }, {
    '$group': {
      '_id': '$initialState', 
      'visitedSet': { '$addToSet': '$result.visited' }
    }
  }, {
    '$addFields': {
      'visitedSetSize': { '$size': '$visitedSet' }
    }
  }
]
