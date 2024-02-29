const graph_pipeline = [
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      n: { $size: "$lines", },
      node: { $reduce: {
          input: { $range: [ 0, { $size: "$lines", }, ], },
          initialValue: [],
          in: { $concatArrays: [
              "$$value",
              { $map: {
                  input: { $range: [ 0, { $strLenBytes: { $arrayElemAt: [ "$lines", "$$this", ], }, }, ], },
                  as: "y",
                  in: { x: "$$this", y: "$$y", }, }, }, ], }, }, }, }, },
  { $unwind: { path: "$node", }, },
  { $project: {
      _id: 0,
      node: 1,
      edges: { $let: {
          vars: {
            dirs: [
              { x: "$node.x", y: { $add: ["$node.y", 1], }, },
              { x: "$node.x", y: { $add: ["$node.y", -1], }, },
              { x: { $add: ["$node.x", 1], }, y: "$node.y", },
              { x: { $add: ["$node.x", -1], }, y: "$node.y", }, ], },
          in: { $filter: {
              input: "$$dirs",
              cond: { $and: [
                  { $lte: [0, "$$this.x"], },
                  { $lt: ["$$this.x", "$n"], },
                  { $lte: [0, "$$this.y"], },
                  { $lt: ["$$this.y", "$n"], },
                  { $ne: [
                      "#",
                      { $substr: [ { $arrayElemAt: [ "$lines", "$$this.x", ], }, "$$this.y", 1, ], }, ], }, ], }, }, }, }, }, },
  },
  { $out: "d21_graph", },
];
