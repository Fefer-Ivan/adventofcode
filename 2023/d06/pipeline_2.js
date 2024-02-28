const pipeline2 = [
  {
    '$project': {
      'race': {
        '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'as': 'line', 
          'in': {
            '$toLong': {
              '$reduce': {
                'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('\\\d+') } }, 
                'initialValue': '', 
                'in': { '$concat': [ '$$value', '$$this.match' ]
                }
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'bounds': {
        '$let': {
          'vars': {
            't': { '$arrayElemAt': [ '$race', 0 ] }, 
            'd': { '$arrayElemAt': [ '$race', 1 ] }
          }, 
          'in': {
            '$let': {
              'vars': {
                'delta': { '$subtract': [ { '$pow': [ '$$t', 2 ] }, { '$multiply': [ 4, '$$d' ] } ] }
              }, 
              'in': {
                '$cond': {
                  'if': { '$lt': [ '$$delta', 0 ] }, 
                  'then': [ 0, 0 ], 
                  'else': [
                    {
                      '$ceil': {
                        '$add': [
                          { '$divide': [ { '$subtract': [ { '$multiply': [ { '$sqrt': '$$delta' }, -1 ] }, '$$t' ] }, -2 ]
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
  }, {
    '$addFields': {
      'ways': {
        '$add': [
          1, {
            '$subtract': [
              { '$arrayElemAt': [ '$bounds', 0 ] }, {
                '$arrayElemAt': [ '$bounds', 1 ] }
            ]
          }
        ]
      }
    }
  }
];
