const pipeline2 = [
  {
    '$project': { 'line': { '$split': [ '$data', '\n' ] } }
  }, {
    '$unwind': { 'path': '$line', 'includeArrayIndex': 'index' }
  }, {
    '$project': {
      'index': 1,
      'card': {
        '$map': {
          'input': { '$split': [ { '$arrayElemAt': [ { '$split': [ '$line', ':' ] }, 1 ] }, '|' ] },
          'as': 'numbers',
          'in': {
            '$map': {
              'input': { '$regexFindAll': { 'input': '$$numbers', 'regex': new RegExp('\\d+') } },
              'as': 'matches',
              'in': { '$toInt': '$$matches.match'
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'score': {
        '$size': {
          '$setIntersection': [
            { '$arrayElemAt': [ '$card', 0 ] }, {
              '$arrayElemAt': [ '$card', 1 ] }
          ]
        }
      }
    }
  }, {
    '$group': { '_id': '$_id', 'cards': { '$push': '$$ROOT' } }
  }, {
    '$addFields': { 'cards': { '$sortArray': { 'input': '$cards', 'sortBy': { 'index': 1 } } } }
  }, {
    '$addFields': {
      'cardCount': {
        '$sum': {
          '$reduce': {
            'input': '$cards',
            'initialValue': {
              '$map': {
                'input': { '$range': [ 0, { '$size': '$cards' } ] },
                'as': 'i',
                'in': 1
              }
            },
            'in': {
              '$map': {
                'input': { '$range': [ 0, { '$size': '$cards' } ] },
                'as': 'i',
                'in': {
                  '$cond': {
                    'if': { '$and': [
                        { '$gt': [ '$$i', '$$this.index' ] }, {
                          '$lte': [ '$$i', { '$add': [ '$$this.index', '$$this.score' ] } ] }
                      ]
                    },
                    'then': {
                      '$add': [
                        { '$arrayElemAt': [ '$$value', '$$i' ] }, {
                          '$arrayElemAt': [ '$$value', '$$this.index' ] }
                      ]
                    },
                    'else': { '$arrayElemAt': [ '$$value', '$$i' ] }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
];
