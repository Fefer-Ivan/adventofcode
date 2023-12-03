[
  {
    '$project': { 'lines': { '$split': [ '$data', '\n' ] } }
  }, {
    '$project': {
      'lines': 1, 
      'symbolIdxs': {
        '$map': {
          'input': '$lines', 
          'as': 'line', 
          'in': {
            '$setUnion': [
              {
                '$map': {
                  'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('[^.0-9]') } }, 
                  'as': 'match', 
                  'in': '$$match.idx'
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
              'input': { '$regexFindAll': { 'input': '$$line', 'regex': new RegExp('\d+') } }, 
              'as': 'match', 
              'in': {
                'symbolLf': { '$subtract': [ '$$match.idx', 1 ] }, 
                'symbolRg': { '$add': [ '$$match.idx', { '$strLenBytes': '$$match.match' }, 1 ] }, 
                'num': { '$toInt': '$$match.match' }
              }
            }
          }
        }
      }
    }
  }, {
    '$addFields': {
      'symbolIdxs': {
        '$concatArrays': [ [ [] ], '$symbolIdxs', [ [] ] ]
      }, 
      'numbers': {
        '$concatArrays': [ [ [] ], '$numbers' ]
      }
    }
  }, {
    '$project': {
      'lines': 1, 
      'symbolIdxs': 1, 
      'numbers': {
        '$map': {
          'input': { '$range': [ 1, { '$size': '$numbers' } ] }, 
          'as': 'i', 
          'in': {
            '$let': {
              'vars': {
                'symbols': {
                  '$setUnion': [
                    { '$arrayElemAt': [ '$symbolIdxs', { '$subtract': [ '$$i', 1 ] } ] }, {
                      '$arrayElemAt': [ '$symbolIdxs', '$$i' ] }, {
                      '$arrayElemAt': [ '$symbolIdxs', { '$add': [ '$$i', 1 ] } ] }
                  ]
                }
              }, 
              'in': '$$symbols', 
              'in': {
                'symbols': '$$symbols', 
                'numbers': {
                  '$filter': {
                    'input': { '$arrayElemAt': [ '$numbers', '$$i' ] }, 
                    'as': 'number', 
                    'cond': {
                      '$lt': [
                        0, {
                          '$size': {
                            '$setIntersection': [
                              '$$symbols', { '$range': [ '$$number.symbolLf', '$$number.symbolRg' ] }
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
  }, {
    '$project': {
      'sum': {
        '$sum': {
          '$map': {
            'input': '$numbers', 
            'as': 'n', 
            'in': {
              '$sum': { '$map': { 'input': '$$n.numbers', 'as': 'number', 'in': '$$number.num' } }
            }
          }
        }
      }
    }
  }
]
