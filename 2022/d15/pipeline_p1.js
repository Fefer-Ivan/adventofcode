[
  {
    '$addFields': {
      'dist': {
        '$add': [
            { '$abs': { '$subtract': [ '$sensor.x', '$beacon.x' ] } },
            { '$abs': { '$subtract': [ '$sensor.y', '$beacon.y' ] } }
        ]
      }
    }
  }, {
    '$addFields': {
      'segment': {
        '$let': {
          'vars': {
            'dy': { '$abs': { '$subtract': [ '$sensor.y', 2000000 ] } }
          }, 
          'in': {
            '$cond': [
              { '$lte': [ '$$dy', '$dist' ] },
              {
                '$let': {
                  'vars': {
                    'dx': { '$subtract': [ '$dist', '$$dy' ] }
                  }, 
                  'in': {
                    'lf': { '$subtract': [ '$sensor.x', '$$dx' ] }, 
                    'rg': { '$add': [ '$sensor.x', '$$dx' ] }
                  }
                }
              },
              null
            ]
          }
        }
      }
    }
  }, {
    '$match': { 'segment': { '$ne': null } }
  }, {
    '$sort': { 'segment': 1 }
  }, {
    '$group': {
      '_id': null, 
      'segments': { '$push': '$segment' }, 
      'beacons': { '$addToSet': '$beacon' }
    }
  }, {
    '$addFields': {
      'beaconsOnLine': {
        '$filter': {
          'input': '$beacons', 
          'as': 'b', 
          'cond': { '$eq': [ '$$b.y', 2000000 ] }
        }
      }
    }
  }, {
    '$addFields': {
      'total': {
        '$reduce': {
          'input': '$segments', 
          'initialValue': {
            'total': {
              '$subtract': [ 0, { '$size': '$beaconsOnLine' } ]
            }, 
            'lastEnd': -100500, 
            'history': []
          }, 
          'in': {
            '$cond': [
              { '$gt': [ '$$value.lastEnd', '$$this.rg' ] },
              '$$value',
              {
                'total': {
                  '$add': [
                    '$$value.total',
                    1,
                    {
                      '$subtract': [ '$$this.rg', { '$max': [ '$$this.lf', '$$value.lastEnd' ] } ]
                    }
                  ]
                }, 
                'lastEnd': { '$add': [ '$$this.rg', 1 ] }
              }
            ]
          }
        }
      }
    }
  }
]
