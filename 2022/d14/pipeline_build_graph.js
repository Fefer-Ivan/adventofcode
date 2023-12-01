[
  {
    '$addFields': {
      'allPoints': {
        '$reduce': {
          'input': {
            '$range': [ 0, { '$subtract': [ { '$size': '$points' }, 1 ] } ]
          },
          'initialValue': [],
          'in': {
            '$concatArrays': [
              '$$value', {
                '$let': {
                  'vars': {
                    'from': { '$arrayElemAt': [ '$points', '$$this' ] },
                    'to': { '$arrayElemAt': [ '$points', { '$add': [ '$$this', 1 ] } ] }
                  },
                  'in': {
                    '$let': {
                      'vars': {
                        'sx': { '$min': [ '$$from.x', '$$to.x' ] },
                        'fx': { '$add': [ { '$max': [ '$$from.x', '$$to.x' ] }, 1 ] },
                        'sy': { '$min': [ '$$from.y', '$$to.y' ] },
                        'fy': { '$add': [ { '$max': [ '$$from.y', '$$to.y' ] }, 1 ] }
                      },
                      'in': {
                        '$reduce': {
                          'input': { '$range': [ '$$sx', '$$fx' ] },
                          'initialValue': [],
                          'in': {
                            '$concatArrays': [
                              '$$value', {
                                '$map': {
                                  'input': { '$range': [ '$$sy', '$$fy' ] },
                                  'as': 'y',
                                  'in': { 'x': '$$this', 'y': '$$y' }
                                }
                              }
                            ]
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
  }, {
    '$unwind': { 'path': '$allPoints' }
  }, {
    '$group': {
      '_id': null,
      'occupied': { '$addToSet': '$allPoints' },
      'maxY': { '$max': { '$add': [ '$allPoints.y', 1 ] } }
    }
  }, {
    '$addFields': {
      'graph': {
        '$map': {
          'input': { '$range': [ 0, { '$add': [ '$maxY', 1 ] } ] },
          'as': 'y',
          'in': {
            '$map': {
              'input': {'$range': [{'$subtract': [500, '$$y']}, {'$add': [500, '$$y', 1]}]},
              'as': 'x',
              'in': {
                '$let': {
                  'vars': {
                    'point': { 'x': '$$x', 'y': '$$y' }
                  },
                  'in': {
                    '$cond': [
                      { '$in': [ '$$point', '$occupied' ] },
                      null,
                      {
                        'point': '$$point',
                        'deps': {
                          '$map': {
                            'input': { '$range': [ -1, 2 ] },
                            'as': 'd',
                            'in': {
                              'x': { '$add': [ '$$x', '$$d' ] },
                              'y': { '$add': [ '$$y', 1 ] }
                            }
                          }
                        },
                        'reverse_deps': {
                          '$map': {
                            'input': { '$range': [ -1, 2 ] },
                            'as': 'd',
                            'in': {
                              'x': { '$add': [ '$$x', '$$d' ] },
                              'y': { '$subtract': [ '$$y', 1 ] }
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
        }
      }
    }
  }, {
    '$project': {
      '_id': 0,
      'graph': {
        '$reduce': {
          'input': '$graph',
          'initialValue': [],
          'in': { '$concatArrays': [ '$$value', '$$this' ] }
        }
      }
    }
  }, {
    '$unwind': { 'path': '$graph' }
  }, {
    '$out': 'd14_graph'
  }
]
