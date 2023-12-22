[
  { $project: {
      bricks: { $sortArray: {
          input: { $map: {
              input: { $split: ["$data", "\n"], },
              as: "line",
              in: { $let: {
                  vars: {
                    coords: { $map: {
                        input: { $split: ["$$line", "~"], },
                        in: { $map: {
                            input: { $split: [ "$$this", ",", ], },
                            in: { $toInt: "$$this", }, }, }, }, }, },
                  in: { $arrayToObject: { $map: {
                        input: { $map: {
                            input: { $zip: { inputs: [
                                  ["x", "y", "z"],
                                  { $first: "$$coords", },
                                  { $last: "$$coords", }, ], }, },
                            in: { $sortArray: { input: "$$this", sortBy: 1, }, }, }, },
                        as: "c",
                        in: {
                          k: { $last: "$$c", },
                          v: {
                            from: { $first: "$$c", },
                            to: { $arrayElemAt: [ "$$c", 1, ], }, }, }, }, }, }, }, }, }, },
          sortBy: {
            "z.from": 1,
          }, }, }, }, },
  { $addFields: {
      bricks: { $reduce: {
          input: "$bricks",
          initialValue: [],
          in: { $concatArrays: [
              "$$value",
              [ { $let: {
                    vars: {
                      newZFrom: { $max: [
                          1,
                          { $max: { $map: {
                                input: "$$value",
                                as: "base",
                                in: { $cond: {
                                    if: { $and: [
                                        { $lte: [
                                            { $max: [ "$$base.x.from", "$$this.x.from", ], },
                                            { $min: [ "$$base.x.to", "$$this.x.to", ], }, ], },
                                        { $lte: [
                                            { $max: [ "$$base.y.from", "$$this.y.from", ], },
                                            { $min: [ "$$base.y.to", "$$this.y.to", ], }, ], }, ], },
                                    then: { $add: [ "$$base.z.to", 1, ], },
                                    else: 1, }, }, }, }, }, ], }, },
                    in: { $mergeObjects: [
                        "$$this",
                        { z: {
                            from: "$$newZFrom",
                            to: { $add: [ "$$newZFrom", { $subtract: [ "$$this.z.to", "$$this.z.from", ], }, ], }, }, }, ], }, }, }, ], ], }, }, }, }, },
  { $addFields: {
      bricks: { $map: {
          input: "$bricks",
          as: "brick",
          in: { $mergeObjects: [
              "$$brick",
              { $reduce: {
                  input: { $range: [ 0, { $size: "$bricks", }, ], },
                  initialValue: {
                    basedOn: [],
                    baseOf: [],
                  },
                  in: { $let: {
                      vars: { other: { $arrayElemAt: [ "$bricks", "$$this", ], }, },
                      in: { $cond: {
                          if: { $and: [
                              { $lte: [
                                  { $max: [ "$$brick.x.from", "$$other.x.from", ], },
                                  { $min: [ "$$brick.x.to", "$$other.x.to", ], }, ], },
                              { $lte: [
                                  { $max: [ "$$brick.y.from", "$$other.y.from", ], },
                                  { $min: [ "$$brick.y.to", "$$other.y.to", ], }, ], }, ], },
                          then: { $switch: {
                              branches: [
                                { case: { $eq: [ "$$brick.z.to", { $add: [ "$$other.z.from", -1, ], }, ], },
                                  then: {
                                    basedOn: "$$value.basedOn",
                                    baseOf: { $concatArrays: [ "$$value.baseOf", [ "$$this", ], ], }, }, },
                                { case: { $eq: [ "$$other.z.to", { $add: [ "$$brick.z.from", -1, ], }, ], },
                                  then: {
                                    basedOn: { $concatArrays: [ "$$value.basedOn", [ "$$this", ], ], },
                                    baseOf: "$$value.baseOf", }, },
                              ],
                              default: "$$value", }, },
                          else: "$$value", }, }, }, }, }, }, ], }, }, }, }, },
  { $addFields: {
      destroyable: { $map: {
          input: "$bricks",
          in: { $allElementsTrue: { $map: {
                input: "$$this.baseOf",
                in: { $gt: [
                    { $size: { $getField: { input: { $arrayElemAt: [ "$bricks", "$$this", ], }, field: "basedOn", }, }, },
                    1,
                  ], }, }, }, }, }, }, }, },
  { $addFields: { count: { $size: { $filter: { input: "$destroyable", cond: "$$this", }, }, }, }, },
]
