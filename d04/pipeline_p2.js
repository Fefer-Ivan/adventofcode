[
  {
    '$match': {
      '$expr': {
        '$or': [
          {
            '$lte': [
              {
                '$max': [
                  '$x1', '$x2'
                ]
              }, {
                '$min': [
                  '$y1', '$y2'
                ]
              }
            ]
          }
        ]
      }
    }
  }, {
    '$count': 'total'
  }
]
