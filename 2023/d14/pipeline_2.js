[
  { $project: {
      lines: { $split: ["$data", "\n"], },
      field: { $map: {
          input: { $split: ["$data", "\n"], },
          as: "line",
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$line", }, ], },
              in: { $substr: ["$$line", "$$this", 1], }, }, }, }, }, }, },
  { $addFields: { n: { $size: "$field", }, }, },
  { $addFields: {
      field: { $concatArrays: [
          [ { $reduce: {
                input: { $range: [ 0, { $add: ["$n", 2], }, ], },
                initialValue: "",
                in: { $concat: ["$$value", "#"], }, }, }, ],
          { $map: {
              input: { $range: [ { $add: ["$n", -1], }, -1, -1, ], },
              as: "y",
              in: { $concat: [
                  { $reduce: {
                      input: { $range: [0, "$n"], },
                      initialValue: "#",
                      in: { $concat: [
                          "$$value",
                          { $arrayElemAt: [ { $arrayElemAt: [ "$field", "$$this", ], }, "$$y", ], }, ], }, }, },
                  "#",
                ], }, }, },
          [ { $reduce: {
                input: { $range: [ 0, { $add: ["$n", 2], }, ], },
                initialValue: "",
                in: { $concat: ["$$value", "#"], }, }, }, ], ], },
      n: { $add: ["$n", 2], }, }, },
  { $addFields: {
      cycles: { $reduce: {
          input: { $range: [0, 200], },
          initialValue: ["$field"],
          in: { $concatArrays: [ "$$value",
              [ { $reduce: {
                    input: { $range: [0, 4], },
                    initialValue: { $last: "$$value", },
                    in: { $let: {
                        vars: {
                          drop: { $map: {
                              input: "$$value",
                              as: "row",
                              in: { $reduce: {
                                  input: { $regexFindAll: { input: "$$row", regex: /#[^#]*/, }, },
                                  initialValue: "",
                                  in: { $let: {
                                      vars: {
                                        rocks: { $size: { $regexFindAll: { input: "$$this.match", regex: /O/, }, }, },
                                      },
                                      in: { $concat: [
                                          "$$value",
                                          "#",
                                          { $reduce:
                                              { input: { $range: [ 0, "$$rocks", ], },
                                                initialValue: "",
                                                in: { $concat: [ "$$value", "O", ], }, }, },
                                          { $reduce:
                                              { input: { $range: [ 0, { $add: [ { $subtract: [ { $strLenBytes: "$$this.match", }, "$$rocks", ], }, -1, ], }, ], },
                                                initialValue: "",
                                                in: { $concat: [ "$$value", ".", ], }, }, }, ], }, }, }, }, }, }, }, },
                        in: { $map: {
                            input: { $range: [0, "$n"], },
                            as: "y",
                            in: { $reduce: {
                                input: { $range: [ { $add: [ "$n", -1, ], }, -1, -1, ], },
                                initialValue: "",
                                in: { $concat: [
                                    "$$value",
                                    { $substr: [ { $arrayElemAt: [ "$$drop", "$$this", ], }, "$$y", 1, ], }, ], }, }, }, }, }, }, }, }, }, ], ], }, }, }, }, },
  { $addFields: {
      loads: { $map: {
          input: "$cycles",
          in: { $sum: { $map: {
                input: "$$this",
                in: { $sum: { $map: {
                      input: { $regexFindAll: { input: "$$this", regex: /O/, }, },
                      in: { $add: [ { $subtract: [ "$n", "$$this.idx", ], }, -1, ], }, }, }, }, }, }, }, }, },
      loops: { $map: {
          input: { $range: [ 0, { $size: "$cycles", }, ], },
          as: "i",
          in: { $reduce: {
              input: { $range: [0, "$$i"], },
              initialValue: ["$$i"],
              in: { $cond: {
                  if: { $allElementsTrue: { $map: {
                        input: { $range: [0, "$n"], },
                        as: "j",
                        in: { $eq: [
                            { $arrayElemAt: [ { $arrayElemAt: [ "$cycles", "$$i", ], }, "$$j", ], },
                            { $arrayElemAt: [ { $arrayElemAt: [ "$cycles", "$$this", ], }, "$$j", ], }, ], }, }, }, },
                  then: { $concatArrays: [ "$$value", ["$$this"], ], },
                  else: "$$value", }, }, }, }, }, }, }, },
  { $addFields: {
      finalLoad: { $let: {
          vars: {
            loop: { $first: { $filter: { input: "$loops", cond: { $eq: [ { $size: "$$this", }, 2, ], }, limit: 1, }, }, },
          },
          in: { $let: {
              vars: {
                prefix: { $arrayElemAt: ["$$loop", 1], },
                size: { $subtract: [ { $arrayElemAt: ["$$loop", 0], }, { $arrayElemAt: ["$$loop", 1], }, ], }, },
              in: { $arrayElemAt: [
                  "$loads",
                  { $add: [
                      "$$prefix",
                      { $mod: [ { $subtract: [ 1000000000, "$$prefix", ], }, "$$size", ], }, ], }, ], }, }, }, }, }, }, },
]
