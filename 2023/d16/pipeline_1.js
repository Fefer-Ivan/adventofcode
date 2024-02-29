const pipeline1 = [
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      rows: { $size: "$lines", },
      cols: { $strLenBytes: { $first: "$lines", }, }, }, },
  { $graphLookup: {
      from: "d16_graph",
      startWith: {
        testId: "$_id",
        dir: 1,
        x: 0,
        y: 0,
      },
      connectFromField: "edges",
      connectToField: "node",
      as: "path",
    }, },
  { $addFields: {
      uniqueCells: { $size: {
          $setUnion: [
            { $filter: {
                input: { $map: {
                    input: "$path",
                    in: {
                      x: "$$this.node.x",
                      y: "$$this.node.y",
                    }, }, },
                cond: { $and: [
                    { $lte: [0, "$$this.x"], },
                    { $lt: ["$$this.x", "$rows"], },
                    { $lte: [0, "$$this.y"], },
                    { $lt: ["$$this.x", "$cols"], }, ], }, }, }, ], }, }, }, },
  { $project: { lines: 0, path: 0 }}
];
