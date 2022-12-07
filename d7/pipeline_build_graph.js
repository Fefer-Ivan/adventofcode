[
  {
    '$sort': {'_id': 1}
  }, {
    '$group': {
      '_id': null, 
      'commands': {'$push': '$$ROOT'}
    }
  }, {
    '$addFields': {
      'directories': {
        '$reduce': {
          'input': '$commands', 
          'initialValue': {'curDir': [], 'allDirs': []}, 
          'in': {
            '$switch': {
              'branches': [
                {
                  'case': {'$eq': ['$$this.command', 'cd']}, 
                  'then': {
                    '$switch': {
                      'default': {
                        'curDir': {'$concatArrays': ['$$value.curDir', ['$$this.argument']]}, 
                        'allDirs': '$$value.allDirs'
                      }, 
                      'branches': [
                        {
                          'case': {'$eq': ['$$this.argument', '/']}, 
                          'then': {
                            'curDir': [], 
                            'allDirs': '$$value.allDirs'
                          }
                        }, {
                          'case': { '$eq': ['$$this.argument', '..']}, 
                          'then': {
                            'curDir': {
                              '$slice': [
                                '$$value.curDir',
                                {'$subtract': [{'$size': '$$value.curDir'}, 1]}
                              ]
                            }, 
                            'allDirs': '$$value.allDirs'
                          }
                        }
                      ]
                    }
                  }
                }, {
                  'case': {'$eq': ['$$this.command', 'ls']}, 
                  'then': {
                    'curDir': '$$value.curDir', 
                    'allDirs': {'$concatArrays': [
                        '$$value.allDirs',
                        [{'name': '$$value.curDir', 'content': '$$this.output'}]
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }, {
    '$unwind': {'path': '$directories.allDirs'}
  }, {
    '$replaceRoot': {'newRoot': '$directories.allDirs'}
  }, {
    '$addFields': {
      'name': {
        '$reduce': {
          'input': '$name', 
          'initialValue': '/', 
          'in': {'$concat': ['$$value', '$$this', '/']}
        }
      }
    }
  }, {
    '$addFields': {
      'content': {
        '$map': {
          'input': '$content', 
          'in': {
            '$mergeObjects': ['$$this', {'name': {'$concat': ['$name', '$$this.name', '/']}}]
          }
        }
      }
    }
  }, {
    '$addFields': {
      'fileSize': {
        '$reduce': {
          'input': {'$filter': {'input': '$content', 'cond': {'$eq': ['$$this.type', 'file']}}}, 
          'initialValue': 0, 
          'in': {'$add': ['$$value', '$$this.size']}
        }
      }
    }
  }, {
    '$out': 'p7_graph'
  }
]
