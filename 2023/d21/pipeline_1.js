[
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      n: { $size: "$lines", },
      startNode: { $let: {
          vars: {
            lineWithS: { $first: { $filter: {
                  input: "$lines",
                  cond: { $ne: [ -1, { $indexOfBytes: [ "$$this", "S", ], }, ], }, }, }, }, },
          in: {
            x: { $indexOfArray: [ "$lines", "$$lineWithS", ], },
            y: { $indexOfBytes: ["$$lineWithS", "S"], },
          }, }, }, }, },
  { $graphLookup: {
      from: "d21_graph",
      startWith: "$startNode",
      connectFromField: "edges",
      connectToField: "node",
      as: "visited",
      maxDepth: 64,
      depthField: "depth", }, },
  { $project: {
      visited64: { $size: { $filter: {
            input: "$visited",
            cond: { $eq: [ { $mod: ["$$this.depth", 2], }, 0, ], }, }, }, }, }, },
]
