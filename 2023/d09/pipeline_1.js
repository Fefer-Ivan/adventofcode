[
  {
    $project: {
      history: { $map: {
          input: { $split: ["$data", "\n"], },
          in: { $map: {
              input: { $regexFindAll: { input: "$$this", regex: /[\-0-9]+/, }, },
              in: { $toInt: "$$this.match", },
            }, }, }, }, }, },
  { $unwind: { path: "$history", }, },
  {
    $addFields: {
      historyDiff: { $reduce: {
          input: { $range: [ 0, { $subtract: [ { $size: "$history", }, 1, ], }, ], },
          initialValue: ["$history"],
          in: { $let: {
              vars: { last: { $last: "$$value", }, },
              in: { $concatArrays: [
                  "$$value",
                  [
                    { $map: {
                        input: { $range: [ 0, { $subtract: [ { $size: "$$last", }, 1, ], }, ], },
                        as: "i",
                        in: { $subtract: [
                            { $arrayElemAt: [ "$$last", { $add: [ "$$i", 1, ], }, ], },
                            { $arrayElemAt: [ "$$last", "$$i", ], },
                          ], }, }, }, ], ], }, }, }, }, }, }, },
  {
    $addFields: {
      newValue: { $reduce: {
          input: { $reverseArray: "$historyDiff", },
          initialValue: 0,
          in: { $add: [ { $last: "$$this", }, "$$value", ], },
        }, }, }, },
  {
    $group: {
      _id: "$_id",
      newValuesSum: { $sum: "$newValue", },
    }, }, ]
