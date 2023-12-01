[
  {
    '$project': {
      'content': {
        '$map': {
          'input': {
            '$range': [
              0, {
                '$strLenBytes': '$content'
              }
            ]
          }, 
          'as': 'index', 
          'in': {
            '$indexOfBytes': [
              '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', {
                '$substrBytes': [
                  '$content', '$$index', 1
                ]
              }
            ]
          }
        }
      }, 
      'halfLength': {
        '$divide': [
          {
            '$strLenBytes': '$content'
          }, 2
        ]
      }
    }
  }, {
    '$project': {
      'left': {
        '$slice': [
          '$content', '$halfLength'
        ]
      }, 
      'right': {
        '$slice': [
          '$content', '$halfLength', '$halfLength'
        ]
      }
    }
  }, {
    '$addFields': {
      'intersection': {
        '$setIntersection': [
          '$left', '$right'
        ]
      }
    }
  }, {
    '$group': {
      '_id': null, 
      'total': {
        '$sum': {
          '$reduce': {
            'input': '$intersection', 
            'initialValue': 0, 
            'in': {
              '$add': [
                '$$value', '$$this'
              ]
            }
          }
        }
      }
    }
  }
]
