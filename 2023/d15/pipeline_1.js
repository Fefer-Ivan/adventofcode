[
  { $addFields: {
      hash: { $sum: { $map: {
            input: { $split: ["$data", ","], },
            as: "token",
            in: { $reduce: {
                input: { $map: {
                    input: { $range: [ 0, { $strLenBytes: "$$token", }, ], },
                    in: { $function: {
                        body: "function(arg1) { return arg1.charCodeAt(0); }",
                        args: [ { $substr: [ "$$token", "$$this", 1, ], }, ],
                        lang: "js", }, }, }, },
                initialValue: 0,
                in: { $mod: [
                    { $multiply: [
                        { $add: [ "$$value", "$$this", ], },
                        17, ], },
                    256,
                  ], }, }, }, }, }, }, }, },
]
