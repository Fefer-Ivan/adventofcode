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
      'visibleSlices': {
        '$let': {
          'vars': {
            'n': { '$size': '$input' }, 
            'm': { '$size': { '$arrayElemAt': [ '$input', 0 ] } }
          }, 
          'in': {
            '$map': {
              'input': { '$range': [ 1, { '$subtract': [ '$$n', 1 ] } ] }, 
              'as': 'x', 
              'in': {
                '$map': {
                  'input': { '$range': [ 1, { '$subtract': [ '$$m', 1 ] } ] }, 
                  'as': 'y', 
                  'in': {
                    'h': { '$arrayElemAt': [ { '$arrayElemAt': [ '$input', '$$x' ] }, '$$y' ] }, 
                    'view': [
                      {
                        '$reverseArray': {
                          '$slice': [ { '$arrayElemAt': [ '$input', '$$x' ] }, '$$y' ]
                        }
                      }, {
                        '$slice': [ { '$arrayElemAt': [ '$input', '$$x' ] }, { '$add': [ '$$y', 1 ] }, '$$m' ]
                      }, {
                        '$reverseArray': {
                          '$slice': [ { '$arrayElemAt': [ '$transInput', '$$y' ] }, '$$x' ]
                        }
                      }, {
                        '$slice': [ { '$arrayElemAt': [ '$transInput', '$$y' ] }, { '$add': [ '$$x', 1 ] }, '$$n' ]
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
  }, {
    '$addFields': {
      'visibleCount': {
        '$map': {
          'input': '$visibleSlices', 
          'as': 'line', 
          'in': {
            '$map': {
              'input': '$$line', 
              'as': 'cur', 
              'in': {
                '$reduce': {
                  'input': '$$cur.view', 
                  'initialValue': 1, 
                  'in': {
                    '$multiply': [
                      '$$value', {
                        '$let': {
                          'vars': {
                            'blocks': {
                              '$filter': {
                                'input': '$$this', 
                                'as': 'tree', 
                                'cond': { '$gte': [ '$$tree', '$$cur.h' ] }
                              }
                            }
                          }, 
                          'in': {
                            '$cond': [
                              {
                                '$eq': [ { '$size': '$$blocks' }, 0 ]
                              }, {
                                '$size': '$$this'
                              }, {
                                '$add': [
                                  1, { '$indexOfArray': [ '$$this', { '$arrayElemAt': [ '$$blocks', 0 ] } ] }
                                ]
                              }
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
        }
      }
    }
  }, {
    '$project': {
      'bestView': {
        '$reduce': {
          'input': '$visibleCount', 
          'initialValue': 0, 
          'in': {
            '$reduce': {
              'input': '$$this', 
              'initialValue': '$$value', 
              'in': { '$max': [ '$$value', '$$this' ] }
            }
          }
        }
      }
    }
  }
]
