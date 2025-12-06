const pipeline2 = [
  {
    $project: {
      rows: { $split: ["$data", "\n"] },
      n: { $size: { $split: ["$data", "\n"] } },
      m: { $max: { $map: { input: { $split: ["$data", "\n"] }, in: { $strLenBytes: "$$this" } } } }
    }
  },
  {
    $addFields: {
      cols: { $map: {
          input: { $range: [ { $add: ["$m", -1] }, -1, -1 ] },
          as: "i",
          in: { $reduce: {
              input: "$rows",
              initialValue: "",
              in: { $concat: [ "$$value", { $substr: ["$$this", "$$i", 1] } ] } } } } } }
  },
  {
    $addFields: {
      ops: { $map: {
          input: { $getField: {
              field: "ops",
              input: { $reduce: {
                  input: { $concatArrays: [ "$cols", [" "] ] },
                  initialValue: { ops: [], currentOp: [] },
                  in: { $cond: {
                      if: { $regexMatch: { input: "$$this", regex: "^ +$" } },
                      then: {
                        ops: { $concatArrays: [ "$$value.ops", ["$$value.currentOp"] ] },
                        currentOp: []
                      },
                      else: {
                        ops: "$$value.ops",
                        currentOp: { $concatArrays: [ "$$value.currentOp", ["$$this"] ] }
                      }
                    }
                  } } } } },
          as: "opArray",
          in: { op: {
              $first: { $getField: { field: "captures",
                  input: { $regexFind: {
                      input: { $last: "$$opArray" },
                      regex: /(\+|\*)/
                    }
                  } } }
            },
            values: { $map: {
                input: "$$opArray",
                in: { $toLong: { $first: { $getField: {
                        field: "captures",
                        input: { $regexFind: { input: "$$this", regex: /(\d+)/ } } } } } } } } } } } }
  },
  {
    $project: {
      opResults: { $sum: {
          $map: {
            input: "$ops",
            in: { $switch: {
                branches: [
                  {
                    case: { $eq: ["$$this.op", "+"] },
                    then: { $sum: "$$this.values" }
                  },
                  {
                    case: { $eq: ["$$this.op", "*"] },
                    then: { $reduce: { input: "$$this.values", initialValue: 1, in: { $multiply: [ "$$value", "$$this" ] } } } } ] } } } } } }
  }
];
