const pipeline2 = [
  { $project: {
      ranges: { $sortArray: {
          input: { $map: {
              input: { $split: ["$data", ","] },
              in: { $map: {
                  input: { $split: ["$$this", "-"] },
                  in: { $toLong: "$$this" }
                } } } },
          sortBy: 1
        } } }
  },
  {
    $addFields: {
      allIDs: { $map: {
          input: { $range: [1, 100000] },
          as: "number",
          in: { $map: {
              input: { $range: [2, 10] },
              as: "repeats",
              in: { $let: {
                  vars: {
                    string: { $reduce: {
                        input: { $range: [0, "$$repeats"] },
                        initialValue: "",
                        in: { $concat: [ "$$value", { $toString: "$$number" } ] } } } },
                  in: { $cond: {
                      if: { $lte: [ { $strLenBytes: "$$string" }, 10 ] },
                      then: { $toLong: "$$string" },
                      else: NumberLong(11)
                    } } } } } } } } }
  },
  {
    $addFields: {
      funnyIDs: { $reduce: {
          input: "$allIDs",
          initialValue: [],
          in: { $setUnion: [
              "$$value",
              { $filter: {
                  input: "$$this",
                  as: "funnyID",
                  cond: { $reduce: {
                      input: "$ranges",
                      initialValue: false,
                      in: { $or: [
                          "$$value",
                          { $and: [
                              { $lte: [ { $first: "$$this" }, "$$funnyID" ] },
                              { $lte: [ "$$funnyID", { $last: "$$this" } ] } ] } ] } } } } } ] } } } }
  },
  {
    $addFields: {
      sum: { $sum: "$funnyIDs" } }
  }
]; 
