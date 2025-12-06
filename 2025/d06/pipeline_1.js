const pipeline1 = [
  {
    $project: {
      rows: { $map: {
          input: { $split: ["$data", "\n"] },
          in: { $filter: {
              input: { $split: ["$$this", " "] },
              cond: { $strLenCP: "$$this" } } } } } }
  },
  {
    $project: {
      ops: { $map: {
          input: { $range: [ 0, { $size: { $first: "$rows" } } ] },
          as: "i",
          in: {
            op: { $arrayElemAt: [ { $last: "$rows" }, "$$i" ] },
            values: { $map: {
                input: { $range: [ 0, { $add: [ { $size: "$rows" }, -1 ] } ] },
                as: "j",
                in: { $toLong: { $arrayElemAt: [ { $arrayElemAt: [ "$rows", "$$j" ] }, "$$i" ] } } } } } } } }
  },
  {
    $addFields: {
      opResults: { $sum: { $map: {
            input: "$ops",
            in: { $switch: {
                branches: [
                  { case: { $eq: ["$$this.op", "+"] }, then: { $sum: "$$this.values" } },
                  { case: { $eq: ["$$this.op", "*"] }, then: {
                      $reduce: {
                        input: "$$this.values",
                        initialValue: 1,
                        in: { $multiply: [ "$$value", "$$this" ] } } } } ] } } } } } }
  }
];
