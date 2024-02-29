const pipeline2 = [
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      rows: { $size: "$lines", },
      cols: { $strLenBytes: { $first: "$lines", }, }, }, },
  { $addFields: {
      startNode: { $concatArrays: [
          { $map: {
              input: { $range: [0, "$rows"], },
              in: {
                testId: "$_id",
                dir: 1,
                x: "$$this",
                y: 0, }, }, },
          { $map: {
              input: { $range: [0, "$rows"], },
              in: {
                testId: "$_id",
                dir: 3,
                x: "$$this",
                y: { $add: ["$cols", -1], },
              }, }, },
          { $map: {
              input: { $range: [0, "$cols"], },
              in: {
                testId: "$_id",
                dir: 2,
                x: 0,
                y: "$$this",
              }, }, },
          { $map: {
              input: { $range: [0, "$cols"], },
              in: {
                testId: "$_id",
                dir: 0,
                x: { $add: ["$rows", -1], },
                y: "$$this",
              }, }, }, ], }, }, },
  { $unwind: { path: "$startNode", }, },
  { $graphLookup: {
      from: "d16_graph",
      startWith: "$startNode",
      connectFromField: "edges",
      connectToField: "node",
      as: "path",
    }, },
  { $addFields: {
      uniqueCells: { $size: {
          $setUnion: [
            { $filter: {
                input: { $map: { input: "$path", in: { x: "$$this.node.x", y: "$$this.node.y", }, }, },
                cond: { $and: [
                    { $lte: [0, "$$this.x"], },
                    { $lt: ["$$this.x", "$rows"], },
                    { $lte: [0, "$$this.y"], },
                    { $lt: ["$$this.x", "$cols"], }, ], }, }, }, ], }, }, }, },
  { $group: {
      _id: "$_id",
      maxUniqueCells: { $max: "$uniqueCells", }, }, },
];
