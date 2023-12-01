[
  {
    '$project': {
      'monkeys': {
        '$map': {
          'input': '$monkeys', 
          'as': 'm', 
          'in': { '$mergeObjects': [ '$$m', { 'count': 0 } ] }
        }
      }, 
      'globalMod': {
        '$reduce': {
          'input': '$monkeys', 
          'initialValue': 1, 
          'in': { '$multiply': [ '$$value', '$$this.test' ] }
        }
      }
    }
  }, {
    '$project': {
      'monkeys': {
        '$reduce': {
          'input': { '$range': [ 0, 20 ] }, 
          'initialValue': '$monkeys', 
          'in': {
            '$reduce': {
              'input': { '$range': [ 0, { '$size': '$$value' } ] }, 
              'initialValue': '$$value', 
              'in': {
                '$let': {
                  'vars': {
                    'cur': { '$arrayElemAt': [ '$$value', '$$this' ] }
                  }, 
                  'in': {
                    '$reduce': {
                      'input': '$$cur.items', 
                      'initialValue': '$$value', 
                      'in': {
                        '$let': {
                          'vars': {
                            'lhs': { '$cond': [
                                { '$eq': [ 'old', '$$cur.op.lhs' ] },
                                '$$this',
                                { '$toInt': '$$cur.op.lhs' }
                              ]
                            }, 
                            'rhs': {
                              '$cond': [
                                { '$eq': [ 'old', '$$cur.op.rhs' ] },
                                '$$this',
                                { '$toInt': '$$cur.op.rhs' }
                              ]
                            }
                          }, 
                          'in': {
                            '$let': {
                              'vars': {
                                'newWorry': {'$floor': {
                                  '$divie': [
                                    {
                                      '$switch': {
                                        'branches': [
                                          {
                                            'case': { '$eq': [ '$$cur.op.operator', '+' ] }, 
                                            'then': {
                                              '$add': [ '$$lhs', '$$rhs' ]
                                            }
                                          }, {
                                            'case': {
                                              '$eq': [ '$$cur.op.operator', '*' ]
                                            }, 
                                            'then': {
                                              '$multiply': [ '$$lhs', '$$rhs' ]
                                            }
                                          }
                                        ]
                                      }
                                    }, 3 
                                  ]
                                }}
                              }, 
                              'in': {
                                '$let': {
                                  'vars': {
                                    'dest': {
                                      '$arrayElemAt': [
                                        '$$cur.dest',
                                        {
                                          '$toInt': {'$eq': [{'$mod': ['$$newWorry', '$$cur.test']}, 0]}
                                        }
                                      ]
                                    }
                                  }, 
                                  'in': {
                                    '$map': {
                                      'input': '$$value', 
                                      'as': 'm', 
                                      'in': {
                                        '$switch': {
                                          'default': '$$m', 
                                          'branches': [
                                            {
                                              'case': { '$eq': [ '$$m._id', '$$cur._id' ] }, 
                                              'then': {
                                                '$mergeObjects': [
                                                  '$$m', {
                                                    'items': [], 
                                                    'count': { '$add': [ '$$m.count', 1 ] }
                                                  }
                                                ]
                                              }
                                            }, {
                                              'case': {
                                                '$eq': [ '$$m._id', '$$dest' ]
                                              }, 
                                              'then': {
                                                '$mergeObjects': [
                                                  '$$m', {
                                                    'items': {'$concatArrays': ['$$m.items', ['$$newWorry']]}
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
              }
            }
          }
        }
      }
    }
  }, {
    '$unwind': {
      'path': '$monkeys'
    }
  }, {
    '$group': {
      '_id': null, 
      'monkeyBusiness': {
        '$topN': {
          'n': 2, 
          'sortBy': { 'monkeys.count': -1 }, 
          'output': '$monkeys.count'
        }
      }
    }
  }, {
    '$project': {
      'monkeyBusiness': {
        '$multiply': [
            { '$arrayElemAt': [ '$monkeyBusiness', 0 ] },
            { '$arrayElemAt': [ '$monkeyBusiness', 1 ] }
        ]
      }
    }
  }
]
