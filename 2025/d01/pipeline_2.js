const pipeline2 =[
  {
    '$project': {
      '_id': 0, 
      'rotates': { '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'in': {
            'dir': { '$substrBytes': [ '$$this', 0, 1 ] }, 
            'count': { '$toInt': { '$substrBytes': [ '$$this', 1, 100 ] } }
          } } } }
  }, {
    '$project': {
      'rotates': {
        '$map': {
          'input': '$rotates', 
          'in': {
            'dir': '$$this.dir', 
            'count': { '$mod': [ '$$this.count', 100 ] }, 
            'full_rotations': { '$floor': { '$divide': [ '$$this.count', 100 ] } }
          } } } }
  }, {
    '$project': {
      'zeroes': { '$reduce': {
          'input': '$rotates', 
          'initialValue': {
            'value': 50, 
            'zeroes': 0
          }, 
          'in': { '$let': {
              'vars': {
                'newValue': {
                  '$add': [
                    '$$value.value', {
                      '$cond': {
                        'if': { '$eq': [ 'R', '$$this.dir' ] }, 
                        'then': '$$this.count', 
                        'else': { '$multiply': [ -1, '$$this.count' ] }
                      } } ] } }, 
              'in': {
                'value': { '$mod': [ { '$add': [ { '$mod': [ '$$newValue', 100 ] }, 100 ] }, 100 ] }, 
                'zeroes': {
                  '$add': [
                    '$$value.zeroes', '$$this.full_rotations', {
                      '$cond': {
                        'if': {
                          '$and': [
                            { '$ne': [ '$$value.value', 0 ]
                            }, {
                              '$or': [
                                { '$lte': [ '$$newValue', 0 ] }, {
                                  '$gte': [ '$$newValue', 100 ] } ]
                            }
                          ] }, 
                        'then': 1, 
                        'else': 0
                      } } ] } } } } } } } }
] 
