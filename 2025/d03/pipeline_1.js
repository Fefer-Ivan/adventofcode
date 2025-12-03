const pipeline1 = [
  {
    $project: {
      banks: { $map: {
          input: { $split: ["$data", "\n"] },
          as: "bank",
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$bank" } ] },
              as: "i",
              in: { $toLong: { $substrBytes: [ "$$bank", "$$i", 1 ] } } } } } } }
  },
  {
    $addFields: {
      jolts: { $map: {
          input: "$banks",
          as: "bank",
          in: { $reduce: {
              input: { $range: [ 0, { $size: "$$bank" } ] },
              initialValue: 0,
              in: { $let: {
                  vars: { i: "$$this" },
                  in: { $reduce: {
                      input: { $range: [ { $add: ["$$i", 1] }, { $size: "$$bank" } ] },
                      initialValue: "$$value",
                      in: { $max: [
                          "$$value",
                          { $add: [
                              { $arrayElemAt: [ "$$bank", "$$this" ] },
                              { $multiply: [ { $arrayElemAt: [ "$$bank", "$$i" ] }, 10 ] } ] } ] } } } } } } } } } }
  },
  {
    $project: { total: { $sum: "$jolts" } }
  }
];
