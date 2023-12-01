[
  {
    '$sort': {
      '_id': 1
    }
  }, {
    '$group': {
      '_id': null, 
      'commands': {
        '$push': '$$ROOT'
      }
    }
  }, {
    '$addFields': {
      'stacks': [
        [], [
          'F', 'G', 'V', 'R', 'J', 'L', 'D'
        ], [
          'S', 'J', 'H', 'V', 'B', 'M', 'P', 'T'
        ], [
          'C', 'P', 'G', 'D', 'F', 'M', 'H', 'V'
        ], [
          'Q', 'G', 'N', 'P', 'D', 'M'
        ], [
          'F', 'N', 'H', 'L', 'J'
        ], [
          'Z', 'T', 'G', 'D', 'Q', 'V', 'F', 'N'
        ], [
          'L', 'B', 'D', 'F'
        ], [
          'N', 'D', 'V', 'S', 'B', 'J', 'M'
        ], [
          'D', 'L', 'G'
        ]
      ]
    }
  }, {
    '$addFields': {
      'stacks': {
        '$reduce': {
          'input': '$commands', 
          'initialValue': '$stacks', 
          'in': {
            '$let': {
              'vars': {
                'stackFrom': {'$arrayElemAt': ['$$value', '$$this.from']}, 
                'count': {'$min': [ '$$this.count', {'$size': {'$arrayElemAt': ['$$value', '$$this.from']}}]}
              }, 
              'in': {
                '$map': {
                  'input': {'$range': [0, {'$size': '$$value'}]}, 
                  'as': 'index', 
                  'in': {
                    '$let': {
                      'vars': {
                        'currentStack': {'$arrayElemAt': ['$$value', '$$index']}
                      }, 
                      'in': {
                        '$switch': {
                          'branches': [
                            {
                              'case': {
                                '$eq': ['$$index', '$$this.from']
                              }, 
                              'then': {
                                '$cond': [
                                  {'$lt': ['$$count', {'$size': '$$currentStack'}]},
                                  {
                                    '$slice': [
                                      '$$currentStack',
                                      '$$count',
                                      {'$subtract': [{'$size': '$$currentStack'}, '$$count']}
                                    ]
                                  },
                                  []
                                ]
                              }
                            }, {
                              'case': {
                                '$eq': ['$$index', '$$this.to']
                              }, 
                              'then': {
                                '$concatArrays': [
                                  {
                                    '$reverseArray': {
                                      '$slice': ['$$stackFrom', '$$count']
                                    }
                                  }, '$$currentStack'
                                ]
                              }
                            }
                          ], 
                          'default': '$$currentStack'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, {
    '$project': {
      'stackTops': {
        '$reduce': {
          'input': '$stacks', 
          'initialValue': '', 
          'in': {
            '$concat': [
              '$$value', {
                '$cond': [
                  {
                    '$gt': [
                      {
                        '$size': '$$this'
                      }, 0
                    ]
                  }, {
                    '$arrayElemAt': [
                      '$$this', 0
                    ]
                  }, ''
                ]
              }
            ]
          }
        }
      }
    }
  }
]
