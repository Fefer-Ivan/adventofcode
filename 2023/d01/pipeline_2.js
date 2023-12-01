[
  {
    '$project': {
      'data': 1, 
      'lines': {
        '$map': {
          'input': { '$split': [ '$data', '\n' ] }, 
          'as': 'line', 
          'in': {
            '$map': {
              'input': [
                {
                  '$regexFind': {
                    'input': '$$line', 
                    'regex': new RegExp('.*?(one|two|three|four|five|six|seven|eight|nine|[0-9])')
                  }
                }, {
                  '$regexFind': {
                    'input': '$$line', 
                    'regex': new RegExp('.*(one|two|three|four|five|six|seven|eight|nine|[0-9])')
                  }
                }
              ], 
              'as': 'match', 
              'in': {
                '$reduce': {
                  'input': [
                    { 'from': 'one', 'to': '1' }, {
                      'from': 'two', 'to': '2' }, {
                      'from': 'three', 'to': '3' }, {
                      'from': 'four', 'to': '4' }, {
                      'from': 'five', 'to': '5' }, {
                      'from': 'six', 'to': '6' }, {
                      'from': 'seven', 'to': '7' }, {
                      'from': 'eight', 'to': '8' }, {
                      'from': 'nine', 'to': '9' }
                  ], 
                  'initialValue': { '$arrayElemAt': [ '$$match.captures', 0 ] }, 
                  'in': {
                    '$replaceAll': {
                      'input': '$$value', 
                      'find': '$$this.from', 
                      'replacement': '$$this.to'
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
    '$project': {
      'callibrations': {
        '$sum': {
          '$map': {
            'input': '$lines', 
            'as': 'line', 
            'in': {
              '$toInt': {
                '$concat': [
                  { '$arrayElemAt': [ '$$line', 0 ] }, {
                    '$arrayElemAt': [ '$$line', { '$subtract': [ { '$size': '$$line' }, 1 ] } ] }
                ]
              }
            }
          }
        }
      }
    }
  }
]
