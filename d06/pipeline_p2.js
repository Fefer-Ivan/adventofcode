[
  {
    '$project': {
      '_id': 0, 
      'substring': {
        '$map': {
          'input': {'$range': [0, {'$subtract': [{'$strLenBytes': '$signal'}, 13]}]}, 
          'as': 'index', 
          'in': {
            '$map': {
              'input': {'$range': ['$$index', {'$add': ['$$index', 14]}]}, 
              'as': 'subindex', 
              'in': {'$substrBytes': ['$signal', '$$subindex', 1]}
            }
          }
        }
      }
    }
  }, {
    '$unwind': {
      'path': '$substring', 
      'includeArrayIndex': 'index'
    }
  }, {
    '$addFields': {
      'uniqueCharacters': {'$setUnion': '$substring'}
    }
  }, {
    '$match': {
      '$expr': {'$eq': [{'$size': '$uniqueCharacters'}, 14]}
    }
  }, {
    '$sort': {'index': 1}
  }, {
    '$limit': 1
  }, {
    '$project': {
      'result': {'$add': ['$index', 14]}
    }
  }
]

