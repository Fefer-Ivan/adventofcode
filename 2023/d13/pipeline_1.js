[
  { $project: { sets: { $split: ["$data", "\n\n"], }, }, },
  { $unwind: { path: "$sets", }, },
  { $addFields: {
      field: { $map: {
          input: { $split: ["$sets", "\n"], },
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$this", }, ], },
              as: "i",
              in: { $substr: ["$$this", "$$i", 1], }, }, }, }, }, }, },
  { $addFields: {
      rows: { $size: "$field", },
      cols: { $size: { $first: "$field", }, }, }, },
  { $addFields: {
      zipField: { $map: {
          input: { $range: [0, "$cols"], },
          as: "y",
          in: { $map: {
              input: { $range: [0, "$rows"], },
              as: "x",
              in: { $arrayElemAt: [ { $arrayElemAt: [ "$field", "$$x", ], }, "$$y", ], }, }, }, }, }, }, },
  { $addFields: {
      reflection: { $map: {
          input: [ { f: "$field", m: 1, }, { f: "$zipField", m: 100, }, ],
          as: "input",
          in: { $map: {
              input: { $range: [ 1, { $size: { $first: "$$input.f", }, }, ], },
              as: "y",
              in: { $multiply: [
                  "$$input.m",
                  { $reduce: {
                      input: "$$input.f",
                      initialValue: "$$y",
                      in: { $let: {
                          vars: { row: "$$this", },
                          in: { $reduce: {
                              input: { $range: [ 0, "$$value", ], },
                              initialValue: "$$value",
                              in: { $let: {
                                  vars: {
                                    reflect: { $arrayElemAt: [ "$$row", { $add: [ "$$y", { $subtract: [ "$$y", "$$this", ], }, -1, ], }, ], },
                                  },
                                  in: { $cond: {
                                      if: { $or: [ { $not: "$$reflect", }, { $eq: [ "$$reflect", { $arrayElemAt: [ "$$row", "$$this", ], }, ], }, ], },
                                      then: "$$value",
                                      else: 0,
                                    }, }, }, }, }, }, }, }, }, }, ], }, }, }, }, }, }, },
  { $addFields: { reflection: { $sum: { $map: { input: "$reflection", in: { $sum: "$$this", }, }, }, }, }, },
  { $group: { _id: "$_id", totalReflections: { $sum: "$reflection", }, }, },
]
