const pipeline1 = [
  { $project: {
      lines: { $split: ["$data", "\n"], },
      field: { $map: {
          input: { $split: ["$data", "\n"], },
          as: "line",
          in: { $map: {
              input: { $range: [ 0, { $strLenBytes: "$$line", }, ], },
              in: { $substr: ["$$line", "$$this", 1], },
            }, }, }, }, }, },
  { $addFields: { n: { $size: "$field", }, }, },
  { $addFields: {
      field: { $concatArrays: [
          [ { $reduce: {
                input: { $range: [ 0, { $add: ["$n", 2], }, ], },
                initialValue: "",
                in: { $concat: ["$$value", "#"], }, }, }, ],
          { $map: {
              input: { $range: [0, "$n"], },
              as: "y",
              in: { $concat: [
                  { $reduce: {
                      input: { $range: [0, "$n"], },
                      initialValue: "#",
                      in: { $concat: [
                          "$$value",
                          { $arrayElemAt: [ { $arrayElemAt: [ "$field", "$$this", ], }, "$$y", ], }, ], }, }, },
                  "#", ], }, }, },
          [ { $reduce: {
                input: { $range: [ 0, { $add: ["$n", 2], }, ], },
                initialValue: "",
                in: { $concat: ["$$value", "#"], }, }, }, ], ], },
      n: { $add: ["$n", 2], }, }, },
  { $addFields: {
      drop: { $map: {
          input: "$field",
          as: "row",
          in: { $reduce: {
              input: { $regexFindAll: { input: "$$row", regex: /#[^#]*/, }, },
              initialValue: "",
              in: { $let: {
                  vars: { rocks: { $size: { $regexFindAll: { input: "$$this.match", regex: /O/, }, }, }, },
                  in: { $concat: [ "$$value", "#",
                      { $reduce: {
                          input: { $range: [ 0, "$$rocks", ], },
                          initialValue: "",
                          in: { $concat: [ "$$value", "O", ], }, }, },
                      { $reduce: {
                          input: { $range: [ 0, { $add: [ { $subtract: [ { $strLenBytes: "$$this.match", }, "$$rocks", ], }, -1, ], }, ], },
                          initialValue: "",
                          in: { $concat: [ "$$value", ".", ], }, }, }, ], }, }, }, }, }, }, }, }, },
  { $addFields: {
      load: { $sum: { $map: {
            input: "$drop",
            in: { $sum: { $map: {
                  input: { $regexFindAll: { input: "$$this", regex: /O/, }, },
                  in: { $add: [ { $subtract: [ "$n", "$$this.idx", ], }, -1, ], }, }, }, }, }, }, }, }, },
];
