[
  {
    '$addFields': {
      'signal': {
        '$reduce': {
          'input': '$commands', 
          'initialValue': {
            'values': [ 1 ], 
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
      'totalSignalStrength': {
        '$reduce': {
          'input': { '$range': [ 20, 221, 40 ] }, 
          'initialValue': 0, 
          'in': {
            '$add': ['$$value', {'$multiply': ['$$this', {'$arrayElemAt': ['$signal.values', '$$this']}]}]
          }
        }
      }
    }
  }
]
