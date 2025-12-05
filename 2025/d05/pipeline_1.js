const pipeline1 = [
  {
    $project: {
      input: { $let: {
          vars: { split: { $split: ["$data", "\n\n"] } },
          in: {
            ranges: { $sortArray: {
                input: { $map: {
                    input: { $split: [ { $first: "$$split" }, "\n" ] },
                    in: { $let: {
                        vars: { range: { $split: [ "$$this", "-" ] } },
                        in: {
                          from: { $toLong: { $first: "$$range" } },
                          to: { $toLong: { $last: "$$range" } } } } } } },
                sortBy: { from: 1, to: 1 } } },
            values: { $sortArray: {
                input: { $map: {
                    input: { $split: [ { $last: "$$split" }, "\n" ] },
                    in: { $toLong: "$$this" } } },
                sortBy: 1 } } } } } }
  },
  {
    $addFields: {
      goodValues: { $filter: {
          input: "$input.values",
          as: "value",
          cond: { $size: { $filter: {
                input: "$input.ranges",
                as: "range",
                cond: { $and: [
                    { $lte: [ "$$range.from", "$$value" ] },
                    { $gte: [ "$$range.to", "$$value" ] } ] },
                limit: 1 } } } } } }
  },
  {
    $project: { total: { $size: "$goodValues" } }
  }
];
