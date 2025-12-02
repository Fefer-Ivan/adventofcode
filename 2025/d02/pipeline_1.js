const pipeline1 = [
  {
    $project: {
      ranges: { $sortArray: {
          input: { $map: {
              input: { $split: ["$data", ","] },
              in: { $map: {
                  input: { $split: ["$$this", "-"] },
                  in: { $toLong: "$$this" } } } } },
          sortBy: 1
        } } }
  },
  {
    $addFields: {
      funnyIDs: { $filter: {
          input: { $map: {
              input: { $range: [1, 100000] },
              in: { $toLong: { $concat: [ { $toString: "$$this" }, { $toString: "$$this" } ] } } } },
          as: "funnyID",
          cond: { $reduce: {
              input: "$ranges",
              initialValue: false,
              in: { $or: [
                  "$$value",
                  { $and: [
                      { $lte: [ { $first: "$$this" }, "$$funnyID" ] },
                      { $lte: [ "$$funnyID", { $last: "$$this" } ] } ] } ] } } } } } }
  },
  {
    $addFields: { sum: { $sum: "$funnyIDs" } }
  }
];
