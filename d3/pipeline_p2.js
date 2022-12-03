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
      }
    }
  }, {
    '$group': {
      '_id': {
        '$floor': {
          '$divide': [
            '$_id', 3
          ]
        }
      }, 
      'contents': {
        '$push': '$content'
      }
    }
  }, {
    '$project': {
      'badge': {
        '$reduce': {
          'input': '$contents', 
          'initialValue': {
            '$range': [
              0, 100
            ]
          }, 
          'in': {
            '$setIntersection': [
              '$$value', '$$this'
            ]
          }
        }
      }
    }
  }, {
    '$group': {
      '_id': null, 
      'total': {
        '$sum': {
          '$arrayElemAt': [
            '$badge', 0
          ]
        }
      }
    }
  }
]
