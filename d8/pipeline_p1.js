[
  {
    '$project': {
      'input': {
        '$map': {
          'input': '$input', 
          'as': 'str', 
          'in': {
            '$map': {
              'input': { '$range': [ 0, { '$strLenBytes': '$$str' } ] }, 
              'as': 'index', 
              'in': { '$toInt': { '$substrBytes': [ '$$str', '$$index', 1 ] } }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'transInput': {
        '$map': {
          'input': { '$range': [ 0, { '$size': { '$arrayElemAt': [ '$input', 0 ] } } ] }, 
          'as': 'y', 
          'in': {
            '$map': {
              'input': '$input', 
              'as': 'x', 
              'in': { '$arrayElemAt': [ '$$x', '$$y' ] }
            }
          }
        }
      }
    }
  }, {
    '$project': {
      'visibleCount': {
        '$let': {
          'vars': {
            'n': { '$size': '$input' }, 
            'm': { '$size': { '$arrayElemAt': [ '$input', 0 ] } }
          }, 
          'in': {
            '$reduce': {
              'input': { '$range': [ 1, { '$subtract': [ '$$n', 1 ] } ] }, 
              'initialValue': {
                '$subtract': [ { '$multiply': [ { '$add': [ '$$n', '$$m' ] }, 2 ] }, 4 ]
              }, 
              'in': {
                '$let': {
                  'vars': { 'x': '$$this' }, 
                  'in': {
                    '$reduce': {
                      'input': { '$range': [ 1, { '$subtract': [ '$$m', 1 ] } ] }, 
                      'initialValue': '$$value', 
                      'in': {
                        '$let': {
                          'vars': { 'y': '$$this' }, 
                          'in': {
                            '$add': [
                              '$$value', {
                                '$toInt': {
                                  '$gt': [
                                    { '$arrayElemAt': [ { '$arrayElemAt': [ '$input', '$$x' ] }, '$$y' ] },
                                    {
                                      '$min': [
                                        { '$max': {
                                            '$slice': [ { '$arrayElemAt': [ '$input', '$$x' ] }, '$$y' ]
                                          }
                                        }, {
                                          '$max': {
                                            '$slice': [ { '$arrayElemAt': [ '$input', '$$x' ] }, { '$add': [ '$$y', 1 ] }, '$$m' ]
                                          }
                                        }, {
                                          '$max': {
                                            '$slice': [ { '$arrayElemAt': [ '$transInput', '$$y' ] }, '$$x' ]
                                          }
                                        }, {
                                          '$max': {
                                            '$slice': [ { '$arrayElemAt': [ '$transInput', '$$y' ] }, { '$add': [ '$$x', 1 ] }, '$$n' ]
                                          }
                                        }
                                      ]
                                    }
                                  ]
                                }
                              }
                            ]
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
    }
  }
]
