const pipeline2 = [
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
              input: { $range: [11, -1, -1] },
              initialValue: {
                position: 0,
                result: ""
              },
              in: { $let: {
                  vars: {
                    pos: { $first: {
                        $sortArray: {
                          input: { $map: {
                              input: { $range: [
				"$$value.position",
				{ $subtract: [ { $size: "$$bank" }, "$$this" ] } ] },
                              as: "i",
                              in: {
                                value: { $arrayElemAt: [ "$$bank", "$$i" ] },
                                position: "$$i"
                              }
                            }
                          },
                          sortBy: { value: -1, position: 1 } } } } },
                  in: {
                    position: { $add: ["$$pos.position", 1] },
                    result: { $concat: [ "$$value.result", { $toString: "$$pos.value" } ] } } } } } } } } }
  },
  {
    $project: {
      total: { $sum: { $map: {
            input: "$jolts",
            in: { $toLong: "$$this.result" } } } } }
  }
];
