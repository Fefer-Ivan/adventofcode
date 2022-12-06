[
  {
    '$project': {
      '_id': 0, 
      'substring': {
        '$map': {
          'input': {'$range': [0, {'$subtract': [{'$strLenBytes': '$signal'}, 13]}], 
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
    '$unwind': {
      'path': '$substring', 
      'includeArrayIndex': 'subindex'
    }
  }, {
    '$group': {
      '_id': '$index', 
      'uniqueCharacters': {
        '$addToSet': '$substring'
      }
    }
  }, {
    '$match': {
      '$expr': {
        '$eq': [{'$size':'$uniqueCharacters'}, 14]
      }
    }
  }, {
    '$sort': {'_id': 1}
  }, {
    '$limit': 1
  }, {
    '$project': {'_id': {'$add': ['$_id', 14]}}
  }
]

