[
  {
    '$addFields': {
      'locations': {
        '$reduce': {
          'input': '$maps', 
          'initialValue': '$seeds', 
          'in': {
            '$map': {
              'input': '$$value', 
              'as': 'seed', 
              'in': {
                '$let': {
                  'vars': {
                    'mappings': {
                      '$filter': {
                        'input': '$$this', 
                        'as': 'map', 
                        'cond': {
                          '$and': [
                            { '$lte': [ '$$map.from', '$$seed' ] }, {
                              '$lt': [ '$$seed', { '$add': [ '$$map.from', '$$map.length' ] } ] }
                          ]
                        }
                      }
                    }
                  }, 
                  'in': {
                    '$cond': {
                      'if': { '$eq': [ { '$size': '$$mappings' }, 1 ] }, 
                      'then': {
                        '$let': {
                          'vars': { 'map': { '$arrayElemAt': [ '$$mappings', 0 ] } }, 
                          'in': { '$add': [ '$$map.to', { '$subtract': [ '$$seed', '$$map.from' ] } ] }
                        }
                      }, 
                      'else': '$$seed'
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
      'location': { '$first': { '$sortArray': { 'input': '$locations', 'sortBy': 1 } } }
    }
  }
]
