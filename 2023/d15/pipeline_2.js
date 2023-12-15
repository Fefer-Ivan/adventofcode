[
  { $addFields: {
      sequence: { $map: {
          input: { $split: ["$data", ","], },
          as: "token",
          in: { $let: {
              vars: { label: { $rtrim: { input: "$$token", chars: "0123456789=-", }, }, },
              in: {
                isAdd: { $eq: [ { $indexOfBytes: [ "$$token", "-", ], }, -1, ], },
                focal: { $toInt: { $arrayElemAt: [ { $split: ["$$token", "="], }, 1, ], }, },
                label: "$$label",
                hash: { $reduce: {
                    input: { $map: {
                        input: { $range: [ 0, { $strLenBytes: "$$label", }, ], },
                        in: { $function: {
                            body: "function(arg1) { return arg1.charCodeAt(0); }",
                            args: [ { $substr: [ "$$label", "$$this", 1, ], }, ],
                            lang: "js",
                          }, }, }, },
                    initialValue: 0,
                    in: { $mod: [
                        { $multiply: [
                            { $add: [ "$$value", "$$this", ], },
                            17, ], },
                        256,
                      ], }, }, }, }, }, }, }, }, }, },
  { $addFields: {
      map: { $reduce: {
          input: "$sequence",
          initialValue: { $reduce: {
              input: { $range: [0, 256], },
              initialValue: [],
              in: { $concatArrays: ["$$value", [{}]], }, }, },
          in: { $concatArrays: [
              { $slice: [ "$$value", "$$this.hash", ], },
              [ { $cond: {
                    if: "$$this.isAdd",
                    then: { $mergeObjects: [
                        { $arrayElemAt: [ "$$value", "$$this.hash", ], },
                        { $arrayToObject: [ [ { k: "$$this.label", v: "$$this.focal", }, ], ], }, ], },
                    else: { $arrayToObject: { $filter: {
                          input: { $objectToArray: { $arrayElemAt: [ "$$value", "$$this.hash", ], }, },
                          as: "lens",
                          cond: { $ne: [ "$$lens.k", "$$this.label", ], }, }, }, }, }, }, ],
              { $slice: [ "$$value", { $add: ["$$this.hash", 1], }, 256, ], }, ], }, }, }, }, },
  { $addFields: {
      sum: { $sum: { $map: {
            input: { $range: [0, 256], },
            as: "hash",
            in: { $sum: { $let: {
                  vars: {
                    array: { $objectToArray: { $arrayElemAt: [ "$map", "$$hash", ], }, }, },
                  in: { $map: {
                      input: { $range: [ 0, { $size: "$$array", }, ], },
                      as: "i",
                      in: { $multiply: [
                          { $add: ["$$hash", 1], },
                          { $add: ["$$i", 1], },
                          { $getField: { input: { $arrayElemAt: [ "$$array", "$$i", ], }, field: "v", }, }, ], }, }, }, }, }, }, }, }, }, }, },
]
