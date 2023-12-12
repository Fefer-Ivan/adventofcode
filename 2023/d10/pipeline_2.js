[
  { $project: { lines: { $split: ["$data", "\n"], }, }, },
  { $addFields: {
      rows: { $size: "$lines", },
      cols: { $strLenBytes: { $first: "$lines", }, },
    }, },
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
                            { case: { $eq: [ "$$pipe", "F", ], }, then: { edges: [ "$$south", "$$east", ], start: false, }, }, ],
                          default: { edges: [], start: false, }, }, },
                      { position: { x: "$$x", y: "$$y", }, }, ], }, }, }, }, }, }, }, }, },
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
                        { $lt: [ "$$this.y", "$cols", ], }, ], }, }, },
                start: "$$this.start",
              }, }, }, }, },
      start: { $getField: {
          input: { $first: {
              $reduce: {
                input: "$graph",
                initialValue: [],
                in: {
                  $concatArrays: [
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
                    { $lt: ["$$this.y", "$cols"], }, ], }, }, }, },
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
                        { $arrayElemAt: [ "$$edges", "$$this", ], }, ], }, }, ], }, }, }, }, }, }, },
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
                    otherEdge: { $first: {
                        $filter: {
                          input: "$$edges",
                          cond: { $not: { $eq: [ "$$this", "$$next", ], }, }, }, }, },
                    current: "$$next",
                    path: ["$start"],
                  },
                  in: { $let: {
                      vars: {
                        prev: { $last: "$$value.path", },
                        curGraph: { $arrayElemAt: [
                            { $arrayElemAt: [ "$graph", "$$value.current.x", ], },
                            "$$value.current.y",
                          ], }, },
                      in: { $let: {
                          vars: {
                            next: { $first: {
                                $filter: {
                                  input: "$$curGraph.edges",
                                  cond: { $not: { $eq: [ "$$this", "$$prev", ], }, }, }, }, }, },
                          in: { $switch: {
                              branches: [
                                { case: { $not: "$$next", }, then: "$$value", },
                                { case: { $in: [ "$$value.current", "$$value.path", ], }, then: "$$value", }, ],
                              default: {
                                start: "$$value.start",
                                otherEdge: "$$value.otherEdge",
                                current: "$$next",
                                path: { $concatArrays: [
                                    "$$value.path",
                                    [ "$$value.current", ], ], }, }, }, }, }, }, }, }, }, }, }, }, }, }, }, },
  { $addFields: {
      loop: { $first: { $first: {
            $filter: {
              input: "$loops",
              cond: { $allElementsTrue: [
                  { $map: {
                      input: "$$this",
                      as: "loop",
                      in: { $and: [
                          { $eq: [ "$$loop.current", "$start", ], },
                          { $eq: [ "$$loop.otherEdge", { $last: "$$loop.path", }, ], }, ], }, }, }, ], }, }, }, }, }, }, },
  { $addFields: {
      graph: { $map: {
          input: "$graph",
          as: "row",
          in: { $map: {
              input: "$$row",
              as: "e",
              in: { $cond: {
                  if: { $not: "$$e.start", },
                  then: "$$e",
                  else: {
                    edges: [ "$loop.start", "$loop.otherEdge", ],
                    start: true,
                  }, }, }, }, }, }, },
      inLoop: { $let: {
          vars: { loopMembers: { $concatArrays: [ ["$start"], "$loop.path", ], }, },
          in: { $map: {
              input: { $range: [0, "$rows"], },
              as: "x",
              in: { $map: {
                  input: { $range: [0, "$cols"], },
                  as: "y",
                  in: { $in: [ { x: "$$x", y: "$$y", }, "$$loopMembers", ], }, }, }, }, }, }, }, }, },
  { $addFields: {
      inside: { $map: {
          input: { $range: [0, "$rows"], },
          as: "x",
          in: { $reduce: {
              input: { $range: [0, "$cols"], },
              initialValue: {
                insideCount: 0,
                isInside: false,
                isSegment: false,
                segmentHasNorth: false,
                segmentHasSouth: false,
              },
              in: { $let: {
                  vars: {
                    y: "$$this",
                    g: { $arrayElemAt: [
                        { $arrayElemAt: [ "$graph", "$$x", ], },
                        "$$this",
                      ], }, },
                  in: { $cond: {
                      if: { $arrayElemAt: [ { $arrayElemAt: [ "$inLoop", "$$x", ], }, "$$y", ], },
                      then: { $let: {
                          vars: {
                            hasNorth: { $size: { $filter: { input: "$$g.edges", cond: { $lt: [ "$$this.x", "$$x", ], }, }, }, },
                            hasSouth: { $size: { $filter: { input: "$$g.edges", cond: { $gt: [ "$$this.x", "$$x", ], }, }, }, }, },
                          in: { $switch: {
                              branches: [
                                { case: { $and: [ "$$hasNorth", "$$hasSouth", ], },
                                  then: { $mergeObjects: [ "$$value", { isInside: { $not: "$$value.isInside", }, }, ], }, },
                                { case: { $and: [ { $not: "$$hasNorth", }, { $not: "$$hasSouth", }, ], },
                                  then: "$$value", },
                                { case: { $or: [ "$$hasNorth", "$$hasSouth", ], },
                                  then: { $cond: {
                                      if: { $not: "$$value.isSegment", },
                                      then: { $mergeObjects: [
                                            "$$value",
                                            { isSegment: true,
                                              segmentHasNorth: "$$hasNorth",
                                              segmentHasSouth: "$$hasSouth",
                                            }, ], },
                                      else: { $mergeObjects: [
                                            "$$value",
                                            { isSegment: false,
                                              isInside: { $cond: {
                                                      if: { $and: [
                                                          { $or: [ "$$value.segmentHasNorth", "$$hasNorth", ], },
                                                          { $or: [ "$$value.segmentHasSouth", "$$hasSouth", ], }, ], },
                                                      then: { $not: "$$value.isInside", },
                                                      else: "$$value.isInside",
                                                    }, }, }, ], }, }, }, }, ], }, }, }, },
                      else: { $cond: {
                          if: "$$value.isInside",
                          then: { $mergeObjects: [
                              "$$value",
                              { insideCount: { $add: [ "$$value.insideCount", 1, ], }, }, ], },
                          else: "$$value",
                        }, }, }, }, }, }, }, }, }, }, }, },
  {
    $project: {
      lines: 1,
      totalInside: { $sum: { $map: { input: "$inside", in: "$$this.insideCount", }, }, }, }, },
]
