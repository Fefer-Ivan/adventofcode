[
  {
    '$project': {
      '_id': 0, 
      'line': { '$split': [ '$data', '\n' ] }
    }
  }, {
    '$unwind': { 'path': '$line' }
  }, {
    '$project': {
      'gameId': {
        '$regexFind': {
          'input': { '$arrayElemAt': [ { '$split': [ '$line', ':' ] }, 0 ] }, 
          'regex': new RegExp('Game (\d+)')
        }
      }, 
      'draws': {
        '$split': [ { '$arrayElemAt': [ { '$split': [ '$line', ':' ] }, 1 ] }, ';' ]
      }
    }
  }, {
    '$project': {
      'gameId': { '$toInt': { '$arrayElemAt': [ '$gameId.captures', 0 ] } }, 
      'draws': { '$map': {
          'input': '$draws', 
          'as': 'draw', 
          'in': {
            '$map': {
              'input': { '$split': [ '$$draw', ',' ] }, 
              'as': 'cube', 
              'in': {
                '$regexFind': { 'input': '$$cube', 'regex': new RegExp('(\d+) ([a-z]+)') }
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'draws': {
        '$map': {
          'input': '$draws', 
          'as': 'draw', 
          'in': {
            '$arrayToObject': {
              '$map': {
                'input': '$$draw', 
                'as': 'cube', 
                'in': [
                  { '$arrayElemAt': [ '$$cube.captures', 1 ] }, {
                    '$toInt': { '$arrayElemAt': [ '$$cube.captures', 0 ] } }
                ]
              }
            }
          }
        }
      }
    }
  }, {
    '$unwind': { 'path': '$draws' }
  }, {
    '$group': {
      '_id': '$gameId', 
      'maxBlue': { '$max': '$draws.blue' }, 
      'maxGreen': { '$max': '$draws.green' }, 
      'maxRed': { '$max': '$draws.red' }
    }
  }, {
    '$match': {
      'maxRed': { '$lte': 12 }, 
      'maxGreen': { '$lte': 13 }, 
      'maxBlue': { '$lte': 14 }
    }
  }, {
    '$group': {
      '_id': null, 
      'idSum': { '$sum': '$_id' }
    }
  }
]
