[
  {
    '$addFields': {
      'seeds': {
        '$sortArray': {
          'input': {
            '$map': {
              'input': { '$range': [ 0, { '$size': '$seeds' }, 2 ] }, 
              'as': 'i', 
              'in': {
                'from': { '$arrayElemAt': [ '$seeds', '$$i' ] }, 
                'to': {
                  '$add': [
                    { '$arrayElemAt': [ '$seeds', '$$i' ] }, {
                      '$arrayElemAt': [ '$seeds', { '$add': [ '$$i', 1 ] } ] }
                  ]
                }
              }
            }
          }, 
          'sortBy': { 'from': 1 }
        }
      }, 
      'maps': {
        '$map': {
          'input': '$maps', 
          'as': 'map', 
          'in': {
            '$sortArray': {
              'input': {
                '$map': {
                  'input': '$$map', 
                  'as': 'm', 
                  'in': {
                    'from': '$$m.from', 
                    'to': { '$add': [ '$$m.from', '$$m.length' ] }, 
                    'offset': { '$subtract': [ '$$m.to', '$$m.from' ] }
                  }
                }
              }, 
              'sortBy': { 'from': 1 }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'locations': {
        '$reduce': {
          'input': '$maps', 
          'initialValue': '$seeds', 
          'in': {
            '$reduce': {
              'input': {
                '$map': {
                  'input': '$$value', 
                  'as': 'seed', 
                  'in': {
                    '$reduce': {
                      'input': '$$this', 
                      'initialValue': {
                        'seed': '$$seed', 
                        'mapped': []
                      }, 
                      'in': {
                        '$switch': {
                          'branches': [
                            {
                              'case': { '$gte': [ '$$value.seed.from', '$$value.seed.to' ] }, 
                              'then': '$$value'
                            }, {
                              'case': { '$lte': [ '$$this.to', '$$value.seed.from' ] }, 
                              'then': '$$value'
                            }, {
                              'case': { '$lte': [ '$$this.from', '$$value.seed.from' ] }, 
                              'then': {
                                'seed': { 'from': '$$this.to', 'to': '$$value.seed.to' }, 
                                'mapped': {
                                  '$concatArrays': [
                                    '$$value.mapped', [
                                      {
                                        'from': { '$add': [ '$$value.seed.from', '$$this.offset' ] }, 
                                        'to': {
                                          '$add': [
                                            { '$min': [ '$$value.seed.to', '$$this.to' ] }, '$$this.offset'
                                          ]
                                        }
                                      }
                                    ]
                                  ]
                                }
                              }
                            }, {
                              'case': { '$lt': [ '$$this.from', '$$value.seed.to' ] }, 
                              'then': {
                                'seed': { 'from': '$$this.to', 'to': '$$value.seed.to' }, 
                                'mapped': {
                                  '$concatArrays': [
                                    '$$value.mapped', [
                                      { 'from': '$$value.seed.from', 'to': '$$this.from' }, {
                                        'from': { '$add': [ '$$this.from', '$$this.offset' ] }, 
                                        'to': {
                                          '$add': [ { '$min': [ '$$value.seed.to', '$$this.to' ] }, '$$this.offset' ]
                                        }
                                      }
                                    ]
                                  ]
                                }
                              }
                            }, {
                              'case': { '$lte': [ '$$value.seed.to', '$$this.from' ] }, 'then': '$$value'
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }, 
              'initialValue': [], 
              'in': {
                '$concatArrays': [
                  '$$value', '$$this.mapped', {
                    '$cond': {
                      'if': { '$lt': [ '$$this.seed.from', '$$this.seed.to' ] }, 
                      'then': [ '$$this.seed' ], 
                      'else': []
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'location': { '$first': { '$sortArray': { 'input': '$locations', 'sortBy': { 'from': 1 } } } }
    }
  }
]
