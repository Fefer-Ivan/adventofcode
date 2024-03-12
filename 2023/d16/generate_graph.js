const graph_pipeline = [
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      rows: { $size: "$lines", },
      cols: { $strLenBytes: { $first: "$lines", }, }, }, },
  { $addFields: {
      nodes: { $reduce: {
          input: { $range: [0, 4], },
          initialValue: [],
          in: { $concatArrays: [
              "$$value",
              { $let: {
                  vars: { dir: "$$this", },
                  in: { $reduce: {
                      input: { $range: [0, "$rows"], },
                      initialValue: [],
                      in: { $concatArrays: [
                          "$$value",
                          { $map: {
                              input: { $range: [ 0, "$cols", ], },
                              as: "y",
                              in: { testId: "$_id", dir: "$$dir", x: "$$this", y: "$$y",
                              }, }, }, ], }, }, }, }, }, ], }, }, }, }, },
  { $unwind: { path: "$nodes", }, },
  { $project: {
      _id: 0,
      node: "$nodes",
      edges: { $let: {
          vars: {
            char: { $substr: [ { $arrayElemAt: [ "$lines", "$nodes.x", ], }, "$nodes.y", 1, ], },
            nextNodes: [
              { testId: "$_id", dir: 0, x: { $add: ["$nodes.x", -1], }, y: "$nodes.y", },
              { testId: "$_id", dir: 1, x: "$nodes.x", y: { $add: ["$nodes.y", 1], }, },
              { testId: "$_id", dir: 2, x: { $add: ["$nodes.x", 1], }, y: "$nodes.y", },
              { testId: "$_id", dir: 3, x: "$nodes.x", y: { $add: ["$nodes.y", -1], }, }, ], },
          in: { $switch: {
              branches: [
                { case: { $eq: ["$$char", "."], },
                  then: [ { $arrayElemAt: [ "$$nextNodes", "$nodes.dir", ], }, ], },
                { case: { $eq: ["$$char", "/"], },
                  then: [
                    { $arrayElemAt: [
                        "$$nextNodes",
                        { $add: [ "$nodes.dir", {
                              $cond: {
                                if: { $eq: [ { $mod: [ "$nodes.dir", 2, ], }, 0, ], },
                                then: 1,
                                else: -1,
                              }, }, ], }, ], }, ], },
                { case: { $eq: ["$$char", "\\"], },
                  then: [
                    { $arrayElemAt: [
                        "$$nextNodes",
                        { $mod: [
                            { $add: [ "$nodes.dir", { $cond: { if: { $eq: [ { $mod: [ "$nodes.dir", 2, ], }, 0, ], }, then: 3, else: 1, }, }, ], },
                            4, ], }, ], }, ], },
                { case: { $eq: ["$$char", "|"], },
                  then: { $cond: {
                      if: { $eq: [ { $mod: [ "$nodes.dir", 2, ], }, 0, ], },
                      then: [ { $arrayElemAt: [ "$$nextNodes", "$nodes.dir", ], }, ],
                      else: [
                        { $arrayElemAt: [ "$$nextNodes", 0, ], },
                        { $arrayElemAt: [ "$$nextNodes", 2, ], }, ], }, }, },
                { case: { $eq: ["$$char", "-"], },
                  then: { $cond: {
                      if: { $eq: [ { $mod: [ "$nodes.dir", 2, ], }, 1, ], },
                      then: [ { $arrayElemAt: [ "$$nextNodes", "$nodes.dir", ], }, ],
                      else: [
                        { $arrayElemAt: [ "$$nextNodes", 1, ], },
                        { $arrayElemAt: [ "$$nextNodes", 3, ], }, ], }, }, }, ], }, }, }, }, }, },
  {
    $out: "d16_graph",
  },
];
