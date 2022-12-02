[
  {
    '$project': {
      'p1': {
        '$indexOfArray': [
          [
            'A', 'B', 'C'
          ], '$p1'
        ]
      }, 
      'p2': {
        '$indexOfArray': [
          [
            'X', 'Y', 'Z'
          ], '$p2'
        ]
      }
    }
  }, {
    '$addFields': {
      'outcome': {
        '$mod': [
          {
            '$add': [
              3, {
                '$subtract': [
                  '$p2', '$p1'
                ]
              }
            ]
          }, 3
        ]
      }
    }
  }, {
    '$addFields': {
      'outcome': {
        '$cond': [
          {
            '$eq': [
              '$outcome', 2
            ]
          }, -1, '$outcome'
        ]
      }
    }
  }, {
    '$addFields': {
      'score': {
        '$add': [
          '$p2', 1, {
            '$multiply': [
              3, {
                '$add': [
                  '$outcome', 1
                ]
              }
            ]
          }
        ]
      }
    }
  }, {
    '$group': {
      '_id': null, 
      'total_score': {
        '$sum': '$score'
      }
    }
  }
]
