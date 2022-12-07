[
  {
    '$graphLookup': {
      'from': 'p7_graph', 
      'startWith': '$name', 
      'connectFromField': 'content.name', 
      'connectToField': 'name', 
      'as': 'recursiveContent'
    }
  }, {
    '$addFields': {
      'totalFileSize': {
        '$reduce': {
          'input': '$recursiveContent', 
          'initialValue': 0, 
          'in': {'$add': ['$$value', '$$this.fileSize']}
        }
      }
    }
  }, {
    '$match': {
      'totalFileSize': {
        '$gte': 2805968
      }
    }
  }, {
    '$sort': {
      'totalFileSize': 1
    }
  }, {
    '$limit': 1
  }
]
