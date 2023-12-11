[
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      maxX: { $size: "$lines", },
      maxY: { $strLenBytes: { $arrayElemAt: ["$lines", 0], }, },
      galaxies: { $reduce: {
          input: { $map: {
              input: { $range: [ 0, { $size: "$lines", }, ], },
              as: "i",
              in: { $map: {
                  input: { $regexFindAll: { input: { $arrayElemAt: [ "$lines", "$$i", ], }, regex: /#/, }, },
                  as: "match",
                  in: { x: "$$i", y: "$$match.idx", },
                }, }, }, },
          initialValue: [],
          in: { $concatArrays: ["$$value", "$$this"], }, }, }, }, },
  { $addFields: {
      emptyXs: { $setDifference: [
          { $range: [0, "$maxX"], },
          { $map: { input: "$galaxies", in: "$$this.x", }, },
        ], },
      emptyYs: { $setDifference: [
          { $range: [0, "$maxY"], },
          { $map: { input: "$galaxies", in: "$$this.y", }, },
        ], }, }, },
  { $addFields: {
      galaxyDistances: { $map: {
          input: "$galaxies",
          as: "g1",
          in: { $map: {
              input: "$galaxies",
              as: "g2",
              in: { $let: {
                  vars: {
                    sx: { $min: ["$$g1.x", "$$g2.x"], },
                    sy: { $min: ["$$g1.y", "$$g2.y"], },
                    fx: { $max: ["$$g1.x", "$$g2.x"], },
                    fy: { $max: ["$$g1.y", "$$g2.y"], },
                  },
                  in: { $add: [
                      { $add: [
                          { $subtract: [ "$$fx", "$$sx", ], },
                          { $subtract: [ "$$fy", "$$sy", ], },
                        ], },
                      { $multiply: [
                          999999,
                          { $size: {
                              $setIntersection: [
                                "$emptyXs",
                                { $range: [ "$$sx", "$$fx", ], },
                              ], }, }, ], },
                      { $multiply: [
                          999999,
                          { $size: {
                              $setIntersection: [
                                "$emptyYs",
                                { $range: [ "$$sy", "$$fy", ], },
                              ], }, }, ], }, ], }, }, }, }, }, }, }, }, },
  { $addFields: {
      totalDistance: { $divide: [
          { $sum: { $map: { input: "$galaxyDistances", in: { $sum: "$$this", }, }, }, },
          2,
        ], }, }, },
]
