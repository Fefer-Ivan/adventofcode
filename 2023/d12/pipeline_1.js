const pipeline1 = [
  { $project: {
      data: { $map: {
          input: { $split: ["$data", "\n"], },
          in: { $let: {
              vars: { parts: { $split: ["$$this", " "], }, },
              in: {
                field: { $arrayElemAt: ["$$parts", 0], },
                segments: { $map: {
                    input: { $split: [ { $arrayElemAt: [ "$$parts", 1, ], }, ",", ], },
                    in: { $toInt: "$$this", }, }, }, }, }, }, }, }, }, },
  { $unwind: { path: "$data", }, },
  { $project: {
      field: { $concat: [
          "#.",
          "$data.field",
        ], },
      segments: "$data.segments" }, },
  { $addFields: {
      counts: { $reduce: {
          input: { $range: [ 0, { $size: "$segments", }, ], },
          initialValue: [
            { $concatArrays: [
                [1],
                { $map: { input: { $range: [ 1, { $strLenBytes: "$field", }, ], }, in: 0, }, }, ], }, ],
          in: { $let: {
              vars: {
                prev: { $last: "$$value", },
                s: { $arrayElemAt: [ "$segments", "$$this", ], }, },
              in: { $concatArrays: [
                  "$$value",
                  [ { $map: {
                        input: { $range: [ 0, { $strLenBytes: "$field", }, ], },
                        as: "i",
                        in: { $cond: {
                            if: { $lt: ["$$i", "$$s"], },
                            then: 0,
                            else: { $cond: {
                                if: { $or: [
                                    { $regexFind: {
                                          input: { $substr: [
                                              "$field",
                                              { $add: [ { $subtract: [ "$$i", "$$s", ], }, 1, ], },
                                              "$$s", ], },
                                          regex: /\./, }, },
                                    { $eq: [
                                        { $substr: [ "$field", { $subtract: [ "$$i", "$$s", ], }, 1, ], },
                                        "#", ], }, ], },
                                then: 0,
                                else: { $getField: {
                                    input: { $reduce: {
                                        input: { $range: [ { $add: [ { $subtract: [ "$$i", "$$s", ], }, -1, ], }, -1, -1, ], },
                                        initialValue: { value: 0, stop: false, },
                                        in: { $let: {
                                            vars: { c: { $substr: [ "$field", "$$this", 1, ], }, },
                                            in: { $cond: {
                                                  if: { $or: [ "$$value.stop", { $eq: [ "$$c", ".", ], }, ], },
                                                  then: "$$value",
                                                  else: {
                                                    value:
                                                      { $add: [ "$$value.value", { $arrayElemAt: [ "$$prev", "$$this", ], }, ], },
                                                    stop: { $eq: [ "$$c", "#", ], }, }, }, }, }, }, }, },
                                    field: "value", }, }, }, }, }, }, }, }, ], ], }, }, }, }, }, }, },
  { $addFields: {
      totalCount: { $reduce: {
          input: { $range: [ { $subtract: [ { $strLenBytes: "$field", }, 1, ], }, -1, -1, ], },
          initialValue: {
            value: 0,
            stop: false,
          },
          in: { $cond: {
              if: "$$value.stop",
              then: "$$value",
              else: {
                value: { $add: [ "$$value.value", { $arrayElemAt: [ { $last: "$counts", }, "$$this", ], }, ], },
                stop: { $eq: [ { $substr: [ "$field", "$$this", 1, ], }, "#", ], }, }, }, }, }, }, }, },
  { $group: {
      _id: "$_id",
      sum: { $sum: "$totalCount.value", }, }, },
];
