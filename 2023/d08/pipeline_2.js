[
  { $addFields: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      instructions: { $let: {
          vars: { instructionsLine: { $first: "$lines", }, },
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$instructionsLine", }, ], },
              as: "i",
              in: { $cond: {
                  if: { $eq: [ "L", { $substr: [ "$$instructionsLine", "$$i", 1, ], }, ], },
                  then: 0,
                  else: 1,
                }, }, }, }, }, },
      graph: { $map: {
          input: { $slice: [ "$lines", 2, { $size: "$lines", }, ], },
          as: "line",
          in: { $let: {
              vars: {
                tokens: { $map: {
                    input: { $regexFindAll: { input: "$$line", regex: /[A-Z0-9]+/, }, },
                    in: "$$this.match",
                  }, }, },
              in: {
                from: { $arrayElemAt: ["$$tokens", 0], },
                to: { $slice: ["$$tokens", 1, 2], },
              }, }, }, }, }, }, },
  { $addFields: {
      steps: { $map: {
          input: { $filter: {
              input: "$graph",
              as: "g",
              cond: { $eq: [ "A", { $substr: ["$$g.from", 2, 1], }, ],
              }, }, },
          as: "startNode",
          in: { $reduce: {
              input: { $range: [0, 20000], },
              initialValue: { current: "$$startNode.from", zNodes: [], },
              in: { $let: {
                  vars: {
                    step: "$$this",
                    node: { $first: {
                        $filter: {
                          input: "$graph",
                          limit: 1,
                          cond: { $eq: [ "$$value.current", "$$this.from", ], }, }, }, }, },
                  in: { $let: {
                      vars: {
                        nextNode: { $arrayElemAt: [ "$$node.to",
                            { $arrayElemAt: [ "$instructions",
                                { $mod: [ "$$step", { $size: "$instructions", }, ], }, ], }, ], }, },
                      in: { $cond: {
                          if: { $gte: [ { $size: "$$value.zNodes", }, 1, ], },
                          then: "$$value",
                          else: {
                            current: "$$nextNode",
                            zNodes: { $cond: {
                                if: { $eq: [ { $substr: [ "$$nextNode", 2, 1, ], }, "Z", ], },
                                then: { $concatArrays: [
                                    "$$value.zNodes",
                                    [ { node: "$$nextNode", step: { $add: [ "$$step", 1, ], }, }, ], ], },
                                else: "$$value.zNodes",
                              }, }, }, }, }, }, }, }, }, }, }, }, }, }, },
  { $addFields: {
      loops: { $map: {
          input: "$steps",
          in: { $getField: { input: { $arrayElemAt: [ "$$this.zNodes", 0, ], }, field: "step", }, }, }, }, }, },
  { $addFields: {
      lcm: { $reduce: {
          input: "$loops",
          initialValue: 1,
          in: { $let: {
              vars: {
                gcd: { $reduce: {
                    input: { $range: [0, 1000], },
                    initialValue: { a: "$$this", b: "$$value", },
                    in: { $cond: {
                        if: { $eq: ["$$value.a", 0], },
                        then: "$$value",
                        else: { a: { $mod: [ "$$value.b", "$$value.a", ], }, b: "$$value.a", }, }, }, }, }, },
              in: { $multiply: [ { $divide: [ "$$this", "$$gcd.b", ], }, "$$value", ], }, }, }, }, }, }, },
]
