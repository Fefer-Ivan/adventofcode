const pipeline1 = [
  {
    $project: {
      rolls: { $map: {
          input: { $split: ["$data", "\n"] },
          as: "line",
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$line" } ] },
              as: "i",
              in: { $eq: [ "@", { $substr: ["$$line", "$$i", 1] } ] } } } } }
    }
  },
  {
    $addFields: {
      rows: { $size: "$rolls" },
      cols: { $size: { $first: "$rolls" } }
    }
  },
  {
    $addFields: {
      goodRolls: {
        $map: {
          input: { $range: [0, "$rows"] },
          as: "i",
          in: {
            $map: {
              input: { $range: [0, "$cols"] },
              as: "j",
              in: {
                $let: {
                  vars: {
                    adjacentRolls: { $reduce: {
                        input: [ { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 } ],
                        initialValue: 0,
                        in: { $add: [
                            "$$value",
                            { $let: {
                                vars: {
                                  x: { $add: [ "$$i", "$$this.x" ] },
                                  y: { $add: [ "$$j", "$$this.y" ] }
                                },
                                in: { $cond: {
                                    if: { $and: [
                                        { $lte: [ 0, "$$x" ] }, { $lt: [ "$$x", "$rows" ] },
                                        { $lte: [ 0, "$$y" ] }, { $lt: [ "$$y", "$cols" ] } ] },
                                    then: { $toInt: { $arrayElemAt: [ { $arrayElemAt: [ "$rolls", "$$x" ] }, "$$y" ] } },
                                    else: 0 } } } } ] } } }
                  },
                  in: { $cond: {
                      if: { $and: [ { $lt: [ "$$adjacentRolls", 4 ] }, { $arrayElemAt: [ { $arrayElemAt: [ "$rolls", "$$i" ] }, "$$j" ] } ] },
                      then: 1,
                      else: 0 } } } } } } } } }
  },
  {
    $project: {
      total: { $sum: { $map: { input: "$goodRolls", in: { $sum: "$$this" } } } }
    }
  }
];
