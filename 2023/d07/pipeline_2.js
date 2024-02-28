const pipeline2 = [
  {
    $project: {
      hands: {
        $map: {
          input: { $split: ["$data", "\n"], },
          as: "line",
          in: { $let: {
              vars: { tokens: { $split: ["$$line", " "], }, },
              in: {
                hand: { $arrayElemAt: ["$$tokens", 0], },
                bid: { $toInt: { $arrayElemAt: ["$$tokens", 1], }, },
              },
            },
          },
        },
      },
    },
  },
  { $unwind: { path: "$hands", }, },
  {
    $project: {
      handString: "$hands.hand",
      bid: "$hands.bid",
      hand: { $map: {
          input: { $range: [ 0, { $strLenBytes: "$hands.hand", }, ], },
          as: "i",
          in: { $let: {
              vars: { card: { $substr: [ "$hands.hand", "$$i", 1, ], }, },
              in: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$$card", "A"], }, then: 14, },
                    { case: { $eq: ["$$card", "K"], }, then: 13, },
                    { case: { $eq: ["$$card", "Q"], }, then: 12, },
                    { case: { $eq: ["$$card", "J"], }, then: 1, },
                    { case: { $eq: ["$$card", "T"], }, then: 10, },
                  ],
                  default: { $toInt: "$$card", },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      handMap: { $sortArray: {
          sortBy: { count: -1, },
          input: {
            $reduce: {
              input: { $sortArray: {
                  input: { $filter: { input: "$hand", cond: { $not: { $eq: ["$$this", 1], }, }, }, },
                  sortBy: 1,
                },
              },
              initialValue: [],
              in: { $let: {
                  vars: { i: { $subtract: [ { $size: "$$value", }, 1, ], }, },
                  in: { $cond: {
                      if: { $eq: ["$$i", -1], },
                      then: [ { value: "$$this", count: 1, }, ],
                      else: { $let: {
                          vars: { last: { $arrayElemAt: [ "$$value", "$$i", ], }, },
                          in: { $cond: {
                              if: { $eq: [ "$$this", "$$last.value", ], },
                              then: { $concatArrays: [
                                  { $slice: [ "$$value", "$$i", ], },
                                  [ { value: "$$this", count: { $add: [ "$$last.count", 1, ], }, }, ],
                                ],
                              },
                              else: { $concatArrays: [ "$$value", [ { value: "$$this", count: 1, }, ], ], },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      jokerCount: { $size: { $filter: { input: "$hand", cond: { $eq: ["$$this", 1], }, }, }, },
    },
  },
  {
    $addFields: {
      rank: { $let: {
          vars: {
            a: { $let: {
                vars: { first: { $first: "$handMap", }, },
                in: { $cond: {
                    if: { $not: "$$first", },
                    then: { value: 1, count: "$jokerCount", },
                    else: {
                      value: "$$first.value",
                      count: { $add: [ "$$first.count", "$jokerCount", ], },
                    },
                  },
                },
              },
            },
            b: { $arrayElemAt: ["$handMap", 1], },
          },
          in: { $switch: {
              branches: [
                { case: { $eq: ["$$a.count", 5], }, then: 6, },
                { case: { $eq: ["$$a.count", 4], }, then: 5, },
                { case: { $and: [ { $eq: ["$$a.count", 3], }, { $eq: ["$$b.count", 2], }, ], }, then: 4, },
                { case: { $eq: ["$$a.count", 3], }, then: 3, },
                { case: { $and: [ { $eq: ["$$a.count", 2], }, { $eq: ["$$b.count", 2], }, ], }, then: 2, },
                { case: { $eq: ["$$a.count", 2], }, then: 1, },
              ],
              default: 0,
            },
          },
        },
      },
    },
  },
  { $addFields: { ranks: { $concatArrays: [["$rank"], "$hand"], }, }, },
  {
    $group: {
      _id: "$_id",
      hands: { $push: { ranks: ["$ranks"], bid: "$bid", hand: "$handString", }, },
    },
  },
  { $addFields: { hands: { $sortArray: { input: "$hands", sortBy: { ranks: 1, }, }, }, }, },
  {
    $addFields: {
      winnings: { $reduce: {
          input: { $range: [ 0, { $size: "$hands", }, ], },
          initialValue: 0,
          in: { $let: {
              vars: {
                hand: { $arrayElemAt: [ "$hands", "$$this", ], },
                rank: { $add: ["$$this", 1], },
              },
              in: { $add: [ "$$value", { $multiply: [ "$$hand.bid", "$$rank", ], }, ], },
            },
          },
        },
      },
    },
  },
];
