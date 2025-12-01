const pipeline1 = [
  { '$project': {
      '_id': 0, 
      'rotates': { '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'in': {
            'dir': { '$substrBytes': [ '$$this', 0, 1 ] }, 
            'count': { '$toInt': { '$substrBytes': [ '$$this', 1, 100 ] } } } } } }
  }, {
    '$project': {
      'zeroes': { '$size': { '$filter': {
            'input': {
              '$reduce': {
                'input': '$rotates', 
                'initialValue': [ 50 ], 
                'in': {
                  '$let': {
                    'vars': {
                      'newValue': { '$mod': [
                          { '$add': [
                              { '$last': '$$value'
                              }, {
                                '$cond': {
                                  'if': { '$eq': [ 'R', '$$this.dir' ] }, 
                                  'then': '$$this.count', 
                                  'else': { '$multiply': [ -1, '$$this.count' ] } }
                              }, 100
                            ]
                          }, 100 ] } }, 
                    'in': { '$concatArrays': [ '$$value', [ '$$newValue' ] ] } } } }
            }, 
            'cond': { '$eq': [ '$$this', 0 ] } } } } } }
];
