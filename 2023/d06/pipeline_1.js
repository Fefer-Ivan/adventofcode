const pipeline1 = [
  {
    '$project': {
      'lines': {
        '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'as': 'line', 
          'in': {
            '$map': {
              'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('\\d+') } }, 
              'as': 'match', 
              'in': { '$toInt': '$$match.match' }
            }
          }
        }
      }
    }
  }, {
    '$project': {
      'races': {
        '$zip': {
          'inputs': [ { '$arrayElemAt': [ '$lines', 0 ] }, { '$arrayElemAt': [ '$lines', 1 ] } ]
        }
      }
    }
  }, {
    '$addFields': {
      'bounds': {
        '$map': {
          'input': '$races', 
          'as': 'race', 
          'in': {
            '$let': {
              'vars': {
                't': { '$arrayElemAt': [ '$$race', 0 ] }, 
                'd': { '$arrayElemAt': [ '$$race', 1 ] }
              }, 
              'in': {
                '$let': {
                  'vars': {
                    'delta': {
                      '$subtract': [ { '$pow': [ '$$t', 2 ] }, { '$multiply': [ 4, '$$d' ] } ]
                    }
                  }, 
                  'in': {
                    '$cond': {
                      'if': { '$lt': [ '$$delta', 0 ] }, 
                      'then': [ 0, 0 ], 
                      'else': [
                        { '$ceil': { '$add': [
                              {
                                '$divide': [ { '$subtract': [ { '$multiply': [ { '$sqrt': '$$delta' }, -1 ] }, '$$t' ] }, -2 ]
                              }, -1
                            ]
                          }
                        }, {
                          '$floor': {
                            '$add': [
                              { '$divide': [ { '$subtract': [ { '$sqrt': '$$delta' }, '$$t' ] }, -2 ]
                              }, 1
                            ]
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
    }
  }, {
    '$addFields': {
      'ways': {
        '$reduce': {
          'input': {
            '$map': {
              'input': '$bounds', 
              'as': 'b', 
              'in': {
                '$add': [
                  1, {
                    '$subtract': [
                      { '$arrayElemAt': [ '$$b', 0 ] }, {
                        '$arrayElemAt': [ '$$b', 1 ] }
                    ]
                  }
                ]
              }
            }
          }, 
          'initialValue': 1, 
          'in': {
            '$multiply': [
              '$$value', '$$this'
            ]
          }
        }
      }
    }
  }
];
