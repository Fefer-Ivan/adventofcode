const pipeline2 = [
  {
    '$project': { 'lines': { '$split': [ '$data', '\n' ] } }
  }, {
    '$project': {
      'lines': 1,
      'gears': {
        '$map': {
          'input': '$lines',
          'as': 'line',
          'in': {
            '$setUnion': [
              {
                '$map': {
                  'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('\\*') } },
                  'as': 'match',
                  'in': {
                    '$range': [ { '$subtract': [ '$$match.idx', 1 ] }, { '$add': [ '$$match.idx', 2 ] } ]
                  }
                }
              }
            ]
          }
        }
      },
      'numbers': {
        '$map': {
          'input': '$lines',
          'as': 'line',
          'in': {
            '$map': {
              'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('\\d+') } },
              'as': 'match',
              'in': {
                'range': {
                  '$range': [ '$$match.idx', { '$add': [ '$$match.idx', { '$strLenBytes': '$$match.match' } ] } ]
                },
                'num': {
                  '$toInt': '$$match.match'
                }
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'numbers': { '$concatArrays': [ [ [] ], '$numbers', [ [] ] ] },
      'gears': { '$concatArrays': [ [ [] ], '$gears' ] }
    }
  }, {
    '$project': {
      'lines': 1,
      'numbers': 1,
      'gears': {
        '$map': {
          'input': { '$range': [ 1, { '$size': '$gears' } ] },
          'as': 'i',
          'in': {
            '$let': {
              'vars': {
                'nearNumbers': {
                  '$setUnion': [
                    { '$arrayElemAt': [ '$numbers', { '$subtract': [ '$$i', 1 ] } ] }, {
                      '$arrayElemAt': [ '$numbers', '$$i' ] }, {
                      '$arrayElemAt': [ '$numbers', { '$add': [ '$$i', 1 ] } ] }
                  ]
                }
              },
              'in': {
                '$map': {
                  'input': { '$arrayElemAt': [ '$gears', '$$i' ] },
                  'as': 'gear',
                  'in': {
                    '$filter': {
                      'input': '$$nearNumbers',
                      'as': 'number',
                      'cond': {
                        '$lt': [ 0, { '$size': { '$setIntersection': [ '$$number.range', '$$gear' ] } } ]
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
      'sum': {
        '$sum': {
          '$map': {
            'input': '$gears',
            'as': 'g',
            'in': {
              '$sum': {
                '$map': {
                  'input': {
                    '$map': {
                      'input': {
                        '$filter': {
                          'input': '$$g',
                          'as': 'gear',
                          'cond': { '$eq': [ { '$size': '$$gear' }, 2 ] }
                        }
                      },
                      'as': 'gear',
                      'in': '$$gear.num'
                    }
                  },
                  'as': 'gear',
                  'in': {
                    '$multiply': [
                      { '$arrayElemAt': [ '$$gear', 0 ] }, {
                        '$arrayElemAt': [ '$$gear', 1 ] }
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
];
