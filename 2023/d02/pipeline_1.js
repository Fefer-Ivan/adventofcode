const pipeline1 = [
  { $project: {
      _id: 0,
      games: {$map: {
        input: { $split: ["$data", "\n"] },
        as: "line",
        in: {$let: {
          vars: { split: { $split: ["$$line", ":"] } },
          in: {
            gameId: {$toInt: {$first:
              {$getField: {
                input: { $regexFind: {
                  input: { $first: "$$split" },
                  regex: /Game (\d+)/
                }},
                field: "captures"
              }},
            }},
            draws: {$map: {
              input: { $split: [ { $last: "$$split" }, ";" ] },
              as: "draw",
              in: {$arrayToObject: {$map: {
                input: { $regexFindAll: {input: "$$draw", regex: /(\d+) ([a-z]+)/ }},
                as: "cube",
                in: [ { $last: "$$cube.captures" },
                    { $toInt: { $first: "$$cube.captures" } }]}}}}}}}}}}}},
  { $project: {
    sum: {$sum: {$map: {
      input: {$filter: {
        input: "$games",
        as: "game",
        cond: {$and: [
          {$gte: [ 12, {$max: {$map: {input: "$$game.draws", in: "$$this.red"}}}, ]},
          {$gte: [ 13, {$max: {$map: {input: "$$game.draws", in: "$$this.green"}}}, ]},
          {$gte: [ 14, {$max: {$map: {input: "$$game.draws", in: "$$this.blue"}}}, ]},
        ]}
      }},
      in: "$$this.gameId"}}}}}
]; 
