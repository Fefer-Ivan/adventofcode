const pipeline1 = [
  {
    $addFields: { lines: { $split: ["$data", "\n"], }, },
  },
  {
    $addFields: {
      instructions: { $first: "$lines", },
      graph: { $map: {
          input: { $slice: [ "$lines", 2, { $size: "$lines", }, ], },
          as: "line",
          in: { $let: {
              vars: {
                tokens: { $map: {
                    input: { $regexFindAll: {
                        input: "$$line",
                        regex: /[A-Z]+/,
                      },
                    },
                    in: "$$this.match",
                  },
                },
              },
              in: {
                from: { $arrayElemAt: ["$$tokens", 0], },
                left: { $arrayElemAt: ["$$tokens", 1], },
                right: { $arrayElemAt: ["$$tokens", 2], },
              },
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      steps: { $reduce: {
          input: { $range: [0, 20000], },
          initialValue: { node: "AAA", steps: 0, path: [], },
          in: {
            $cond: {
              if: { $eq: ["$$value.node", "ZZZ"], },
              then: "$$value",
              else: { $let: {
                  vars: {
                    dir: { $substr: [ "$instructions", { $mod: [ "$$this", { $strLenBytes: "$instructions", }, ], }, 1, ], },
                    node: { $first: {
                        $filter: { input: "$graph", as: "g", cond: { $eq: [ "$$g.from", "$$value.node", ], }, },
                      },
                    },
                  },
                  in: { $cond: {
                      if: { $eq: ["$$dir", "L"], },
                      then: { node: "$$node.left", steps: "$$this", },
                      else: { node: "$$node.right", steps: "$$this", },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
];
