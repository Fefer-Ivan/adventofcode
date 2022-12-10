[
  {
    '$addFields': {
      'signal': {
        '$reduce': {
          'input': '$commands', 
          'initialValue': {
            'values': [], 
            'x': 1
          }, 
          'in': {
            '$switch': {
              'branches': [
                {
                  'case': { '$eq': [ '$$this.command', 'noop' ] }, 
                  'then': {
                      'x': '$$value.x',
                      'values': { '$concatArrays': [ '$$value.values', [ '$$value.x' ] ] }
                  }
                }, {
                  'case': { '$eq': [ '$$this.command', 'addx' ] }, 
                  'then': {
                    'x': { '$add': [ '$$value.x', '$$this.argument' ] }, 
                    'values': {'$concatArrays': ['$$value.values', ['$$value.x', '$$value.x']]}
                  }
                }
              ]
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'screen': {
        '$map': {
          'input': { '$range': [ 0, 240 ] }, 
          'as': 'i', 
          'in': {
            '$cond': [
              {
                '$lte': [
                  {
                    '$abs': {
                      '$subtract': [
                        { '$mod': [ '$$i', 40 ] },
                        { '$arrayElemAt': [ '$signal.values', '$$i' ] }
                      ]
                    }
                  }, 1
                ]
              }, '#', '.'
            ]
          }
        }
      }
    }
  }, {
    '$addFields': {
      'screen': {
        '$map': {
          'input': { '$range': [ 0, 240, 40 ] }, 
          'as': 'row', 
          'in': {
            '$reduce': {
              'input': { '$slice': [ '$screen', '$$row', 40 ] }, 
              'initialValue': '', 
              'in': { '$concat': [ '$$value', '$$this' ] }
            }
          }
        }
      }
    }
  }
]
