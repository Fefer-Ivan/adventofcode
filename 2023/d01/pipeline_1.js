[
  {
    '$project': {
      'lines': {
        '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'as': 'line', 
          'in': {
            '$trim': { 'input': '$$line', 'chars': 'qwertyuiopasdfghjklzxcvbnm' }
          }
        }
      }
    }
  }, {
    '$project': {
      'callibrations': {
        '$sum': {
          '$map': {
            'input': '$lines', 
            'as': 'line', 
            'in': {
              '$toInt': {
                '$concat': [
                  { '$substr': [ '$$line', 0, 1 ] },
                  { '$substr': [ '$$line', { '$subtract': [ { '$strLenBytes': '$$line' }, 1 ] }, 1 ] }
                ]
              }
            }
          }
        }
      }
    }
  }
]
