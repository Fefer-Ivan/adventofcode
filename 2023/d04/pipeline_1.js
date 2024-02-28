const pipeline1 = [
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
        '$let': {
          'vars': {
            'size': { '$size': { '$setIntersection': [
                  { '$arrayElemAt': [ '$card', 0 ] }, {
                    '$arrayElemAt': [ '$card', 1 ] }
                ]
              }
            }
          },
          'in': {
            '$cond': {
              'if': { '$eq': [ '$$size', 0 ] },
              'then': 0,
              'else': { '$pow': [ 2, { '$subtract': [ '$$size', 1 ] } ] }
            }
          }
        }
      }
    }
  }, {
    '$group': {
      '_id': '$_id',
      'totalScore': {
        '$sum': '$score'
      }
    }
  }
];
