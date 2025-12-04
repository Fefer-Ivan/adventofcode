const pipeline2 = [
  {
    $project: {
      initialRolls: { $map: {
          input: { $split: ["$data", "\n"] },
          as: "line",
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$line" } ] },
              as: "i",
              in: { $eq: [ "@", { $substr: ["$$line", "$$i", 1] } ] } } } } } }
  },
  {
    $addFields: {
      rows: { $size: "$initialRolls" },
      cols: { $size: { $first: "$initialRolls" } }
    }
  },
  {
    $addFields: {
      result: { $reduce: {
          input: { $range: [0, 100] },
          initialValue: "$initialRolls",
          in: { $map: {
              input: { $range: [0, "$rows"] },
              as: "i",
              in: { $map: {
                  input: { $range: [0, "$cols"] },
                  as: "j",
                  in: { $let: {
                      vars: {
                        adjacentRolls: { $sum: { $map: {
                              input: [ { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 } ],
                              as: "diff",
                              in: { $let: {
                                  vars: {
                                    x: { $add: [ "$$i", "$$diff.x" ] },
                                    y: { $add: [ "$$j", "$$diff.y" ] }
                                  },
                                  in: { $cond: {
                                      if: { $and: [
                                          { $lte: [ 0, "$$x" ] }, { $lt: [ "$$x", "$rows" ] },
                                          { $lte: [ 0, "$$y" ] }, { $lt: [ "$$y", "$cols" ] } ]
                                      },
                                      then: { $toInt: { $arrayElemAt: [ { $arrayElemAt: [ "$$value", "$$x" ] }, "$$y" ] } },
                                      else: 0 } } } } } } }
                      },
                      in: { $and: [
                          { $gte: [ "$$adjacentRolls", 4 ] },
                          { $arrayElemAt: [ { $arrayElemAt: [ "$$value", "$$i" ] }, "$$j" ] } ] } } } } } } } } } }
  },
  {
    $project: {
      total: { $let: {
          vars: {
            initialCount: { $sum: { $map: {
                  input: "$initialRolls",
                  in: { $sum: { $map: {
                        input: "$$this",
                        in: { $toInt: "$$this" } } } } } }
            },
            resultCount: { $sum: { $map: {
                  input: "$result",
                  in: { $sum: { $map: {
                        input: "$$this",
                        in: { $toInt: "$$this" } } } } } } }
          },
          in: { $subtract: [ "$$initialCount", "$$resultCount" ] } } } }
  }
];
