const pipeline1 = [
  { $project: {
      _id: 0,
      games: {$map: {
        input: { $split: ["$data", "\n"] },
        as: "line",
        in: {$let: {
          vars: {
            split: { $split: ["$$line", ":"] }
          },
          in: {
            gameId: {$toInt: {$arrayElemAt: [
              {$getField: {
                input: { $regexFind: {
                  input: { $arrayElemAt: ["$$split", 0 ] },
                  regex: /Game (\d+)/
                }},
                field: "captures"
              }},
              0
            ]}},
            draws: {$map: {
              input: { $split: [ { $arrayElemAt: ["$$split", 1 ] }, ";" ] },
              as: "draw",
              in: {$arrayToObject: {$map: {
                input: { $regexFindAll: {input: "$$draw", regex: /(\d+) ([a-z]+)/ }},
                as: "cube",
                in: [
                    { $arrayElemAt: [ "$$cube.captures", 1 ] },
                    { $toInt: { $arrayElemAt: [ "$$cube.captures", 0 ] } },
                ]
              }}}
            }}
          }
        }}
      }}
  }},
  { $project: {
    sum: {$sum: {$map: {
      input: {$filter: {
        input: "$games",
        as: "game",
        cond: {$and: [
          {$gte: [
            12,
            {$max: {$map: {input: "$$game.draws", in: "$$this.red"}}},
          ]},
          {$gte: [
            13,
            {$max: {$map: {input: "$$game.draws", in: "$$this.green"}}},
          ]},
          {$gte: [
            14,
            {$max: {$map: {input: "$$game.draws", in: "$$this.blue"}}},
          ]},
        ]}
      }},
      in: "$$this.gameId"
    }}}
  }}
]; 
