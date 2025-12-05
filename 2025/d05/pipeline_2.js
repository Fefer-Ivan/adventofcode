const pipeline2 = [
  {
    $project: {
      input: {
        $let: {
          vars: { split: { $split: ["$data", "\n\n"] } },
          in: { ranges: {
              $sortArray: {
                input: { $map: {
                    input: { $split: [ { $first: "$$split" }, "\n" ] },
                    in: { $let: {
                        vars: { range: { $split: [ "$$this", "-" ] } },
                        in: {
                          from: { $toLong: { $first: "$$range" } },
                          to: { $toLong: { $last: "$$range" } } } } } } },
                sortBy: { from: 1, to: 1 } } } } } } }
  },
  {
    $addFields: {
      relevantValues: { $sortArray: {
          input: { $reduce: {
              input: "$input.ranges",
              initialValue: [],
              in: { $setUnion: [
                  "$$value",
                  [ "$$this.from",
                    { $add: ["$$this.from", 1] },
                    "$$this.to",
                    { $add: ["$$this.to", 1] }
                  ]
                ] } } },
          sortBy: 1 } } }
  },
  {
    $project: {
      total: { $reduce: {
          input: { $range: [ 0, { $subtract: [ { $size: "$relevantValues" }, 1 ] } ] },
          initialValue: 0,
          in: { $let: {
              vars: {
                currentValue: { $arrayElemAt: [ "$relevantValues", "$$this" ] },
                nextValue: { $arrayElemAt: [ "$relevantValues", { $add: ["$$this", 1] } ] }
              },
              in: { $add: [
                  "$$value",
                  { $multiply: [
                      { $subtract: [ "$$nextValue", "$$currentValue" ] },
                      { $size: { $filter: {
                            input: "$input.ranges",
                            as: "range",
                            limit: 1,
                            cond: { $and: [
                                { $lte: [ "$$range.from", "$$currentValue" ] },
                                { $gte: [ "$$range.to", "$$currentValue" ] } ] } } } } ] } ] } } } } } }
  }
];
