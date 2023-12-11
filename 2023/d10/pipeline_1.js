[
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      rows: { $size: "$lines", },
      cols: { $strLenBytes: { $first: "$lines", }, }, }, },
  { $addFields: {
      graph: { $map: {
          input: { $range: [0, "$rows"], },
          as: "x",
          in: { $map: {
              input: { $range: [0, "$cols"], },
              as: "y",
              in: { $let: {
                  vars: {
                    pipe: { $substr: [ { $arrayElemAt: [ "$lines", "$$x", ], }, "$$y", 1, ], },
                    north: { x: { $add: ["$$x", -1], }, y: "$$y", },
                    south: { x: { $add: ["$$x", 1], }, y: "$$y", },
                    west: { x: "$$x", y: { $add: ["$$y", -1], }, },
                    east: { x: "$$x", y: { $add: ["$$y", 1], }, },
                  },
                  in: { $mergeObjects: [
                      { $switch: {
                          branches: [
                            { case: { $eq: [ "$$pipe", "S", ], }, then: { edges: [], start: true, }, },
                            { case: { $eq: [ "$$pipe", "|", ], }, then: { edges: [ "$$north", "$$south", ], start: false, }, },
                            { case: { $eq: [ "$$pipe", "-", ], }, then: { edges: [ "$$east", "$$west", ], start: false, }, },
                            { case: { $eq: [ "$$pipe", "L", ], }, then: { edges: [ "$$north", "$$east", ], start: false, }, },
                            { case: { $eq: [ "$$pipe", "J", ], }, then: { edges: [ "$$north", "$$west", ], start: false, }, },
                            { case: { $eq: [ "$$pipe", "7", ], }, then: { edges: [ "$$south", "$$west", ], start: false, }, },
                            { case: { $eq: [ "$$pipe", "F", ], }, then: { edges: [ "$$south", "$$east", ], start: false, }, },
                          ],
                          default: { edges: [], start: false, },
                        },
                      },
                      { position: { x: "$$x", y: "$$y", }, },
                    ],
                  },
                }, }, }, }, }, }, }, },
  { $addFields: {
      graph: { $map: {
          input: "$graph",
          in: { $map: {
              input: "$$this",
              in: {
                edges: { $filter: {
                    input: "$$this.edges",
                    cond: { $and: [
                        { $lte: [0, "$$this.x"], },
                        { $lt: [ "$$this.x", "$rows", ], },
                        { $lte: [0, "$$this.y"], },
                        { $lt: [ "$$this.y", "$cols", ], },
                      ], }, }, },
                start: "$$this.start",
              }, }, }, }, },
      start: { $getField: {
          input: { $first: { $reduce: {
                input: "$graph",
                initialValue: [],
                in: { $concatArrays: [
                    "$$value",
                    { $filter: { input: "$$this", cond: "$$this.start", }, },
                  ], }, }, }, },
          field: "position",
        }, }, }, },
  { $addFields: {
      startEdges: { $let: {
          vars: {
            edges: { $filter: {
                input: [
                  { x: { $add: ["$start.x", 1], }, y: "$start.y", },
                  { x: { $add: ["$start.x", -1], }, y: "$start.y", },
                  { x: "$start.x", y: { $add: ["$start.y", 1], }, },
                  { x: "$start.x", y: { $add: ["$start.y", -1], }, },
                ],
                cond: { $and: [
                    { $lte: [0, "$$this.x"], },
                    { $lt: ["$$this.x", "$rows"], },
                    { $lte: [0, "$$this.y"], },
                    { $lt: ["$$this.y", "$cols"], },
                  ], }, }, }, },
          in: { $reduce: {
              input: { $range: [ 0, { $size: "$$edges", }, ], },
              initialValue: [],
              in: { $concatArrays: [
                  "$$value",
                  { $map: {
                      input: { $range: [0, "$$this"], },
                      as: "j",
                      in: [
                        { $arrayElemAt: [ "$$edges", "$$j", ], },
                        { $arrayElemAt: [ "$$edges", "$$this", ], },
                      ], }, }, ], }, }, }, }, }, }, },
  { $addFields: {
      loops: { $map: {
          input: "$startEdges",
          as: "edges",
          in: { $map: {
              input: "$$edges",
              as: "next",
              in: { $reduce: {
                  input: { $range: [ 0, { $multiply: [ "$rows", "$cols", ], }, ], },
                  initialValue: {
                    start: "$$next",
                    otherEdge: { $first: { $filter: {
                          input: "$$edges",
                          cond: { $not: { $eq: [ "$$this", "$$next", ], }, }, }, }, },
                    current: "$$next",
                    path: ["$start"],
                  },
                  in: { $let: {
                      vars: {
                        prev: { $last: "$$value.path", },
                        curGraph: { $arrayElemAt: [ { $arrayElemAt: [ "$graph", "$$value.current.x", ], }, "$$value.current.y", ], }, },
                      in: { $let: {
                          vars: {
                            next: { $first: { $filter: { input: "$$curGraph.edges", cond: { $not: { $eq: [ "$$this", "$$prev", ], }, }, }, }, }, },
                          in: { $switch: {
                              branches: [
                                { case: { $not: "$$next", }, then: "$$value", },
                                { case: { $in: [ "$$value.current", "$$value.path", ], }, then: "$$value", },
                              ],
                              default: {
                                start: "$$value.start",
                                otherEdge: "$$value.otherEdge",
                                current: "$$next",
                                path: { $concatArrays: [
                                    "$$value.path",
                                    [ "$$value.current", ],
                                  ], }, }, }, }, }, }, }, }, }, }, }, }, }, }, }, },
  { $addFields: {
      loopSizes: { $map: {
          input: "$loops",
          in: { $sum: { $map: {
                input: "$$this",
                as: "loop",
                in: { $cond: {
                    if: { $and: [
                        { $eq: [ "$$loop.current", "$start", ], },
                        { $eq: [ "$$loop.otherEdge", { $last: "$$loop.path", }, ], }, ], },
                    then: { $size: "$$loop.path", },
                    else: -100500,
                  }, }, }, }, }, }, }, }, },
  { $addFields: { max: { $divide: [ { $max: "$loopSizes", }, 4, ], }, }, },
]
