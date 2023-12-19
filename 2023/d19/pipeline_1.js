[
  { $project: {
      pipelines: { $first: { $split: ["$data", "\n\n"], }, },
      parts: { $last: { $split: ["$data", "\n\n"], }, }, }, },
  { $project: {
      pipelines: { $map: {
          input: { $split: ["$pipelines", "\n"], },
          in: { $let: {
              vars: {
                match: { $regexFind: { input: "$$this", regex: /([a-z]+){(.+,)([A-Za-z]+)}/, }, }, },
              in: {
                name: { $first: "$$match.captures", },
                pipeline: { $concatArrays: [
                    { $map: {
                        input: { $filter: {
                            input: { $split: [ { $arrayElemAt: [ "$$match.captures", 1, ], }, ",", ], },
                            cond: { $gt: [ { $strLenBytes: "$$this", }, 0, ], }, }, },
                        in: { $let: {
                            vars: {
                              match: { $regexFind: { input: "$$this", regex: /([a-z])+([<>])(\d+):([A-Za-z]+)/, }, }, },
                            in: {
                              k: { $let: {
                                  vars: { char: { $first: "$$match.captures", }, },
                                  in: { $switch: {
                                      branches: [
                                        { case: { $eq: [ "$$char", "x", ], }, then: 0, },
                                        { case: { $eq: [ "$$char", "m", ], }, then: 1, },
                                        { case: { $eq: [ "$$char", "a", ], }, then: 2, },
                                        { case: { $eq: [ "$$char", "s", ], }, then: 3, }, ], }, }, }, },
                              v: { $toInt: { $arrayElemAt: [ "$$match.captures", 2, ], }, },
                              cmp: { $cond: {
                                  if: { $eq: [ { $arrayElemAt: [ "$$match.captures", 1, ], }, "<", ], },
                                  then: -1,
                                  else: 1,
                                }, },
                              to: { $last: "$$match.captures", }, }, }, }, }, },
                    [ { k: 0, v: 0, cmp: 1, to: { $last: "$$match.captures", }, }, ], ], }, }, }, }, }, },
      parts: { $map: {
          input: { $split: ["$parts", "\n"], },
          in: { $map: {
              input: { $regexFindAll: { input: "$$this", regex: /([a-z])=(\d+)/, }, },
              in: { $toInt: { $last: "$$this.captures", }, }, }, }, }, }, }, },
  { $addFields: {
      verdict: { $map: {
          input: "$parts",
          as: "part",
          in: {
            sum: { $sum: "$$part", },
            verdict: { $reduce: {
                input: { $range: [ 0, { $size: "$pipelines", }, ], },
                initialValue: "in",
                in: { $cond: {
                    if: { $in: [ "$$value", ["A", "R"], ], },
                    then: "$$value",
                    else: { $let: {
                        vars: {
                          pipeline: { $first: { $filter: { input: "$pipelines", cond: { $eq: [ "$$this.name", "$$value", ], }, }, }, }, },
                        in: { $getField: {
                            input: { $first: { $filter: {
                                  input: "$$pipeline.pipeline",
                                  cond: { $eq: [
                                      { $cmp: [ { $arrayElemAt: [ "$$part", "$$this.k", ], }, "$$this.v", ], },
                                      "$$this.cmp",
                                    ], },
                                  limit: 1,
                                }, }, },
                            field: "to",
                          }, }, }, }, }, }, }, }, }, }, }, }, },
  { $addFields: {
      sum: { $sum: { $map: {
            input: { $filter: { input: "$verdict", cond: { $eq: ["$$this.verdict", "A"], }, }, },
            in: "$$this.sum", }, }, }, }, },
]
