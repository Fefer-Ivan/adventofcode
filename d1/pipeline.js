[
  {
    '$addFields': {
      'total': {
        '$reduce': {
          'input': '$food', 
          'initialValue': 0, 
          'in': {
            '$add': [
              '$$value', '$$this'
            ]
          }
        }
      }
    }
  }, {
    '$sort': {
      'total': -1
    }
  }, {
    '$limit': 3
  }, {
    '$group': {
      '_id': null, 
      'total_top_3': {
        '$sum': '$total'
      }
    }
  }
]
