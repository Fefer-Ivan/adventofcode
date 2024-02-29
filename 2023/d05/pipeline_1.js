const pipeline1 = [
    {$addFields: {
      data: {$let: {
        vars: {blocks: {$split: ["$data", "\n\n"]}},
        in: {
          seeds: {$map: {
            input: {$regexFindAll: {
              input: {$arrayElemAt: ["$$blocks", 0]},
              regex: /\d+/
            }},
            in: {$toLong: "$$this.match"}
          }},
          maps: {$map: {
            input: {$slice: ["$$blocks", 1, {$add: [{$size: "$$blocks"}, 1]}]},
            in: {$map: {
              input: {$regexFindAll: {
                input: "$$this",
                regex: /\d+ \d+ \d+/
              }},
              in: {$arrayToObject: {$zip: {inputs: [
                ["to", "from", "length"],
                {$map: {
                  input: {$split: ["$$this.match", ' ']},
                  in: {$toLong: "$$this"}
                }}
              ]}}}
            }}
          }}
        }
      }}
  }},
  {$addFields: {
    locations: {$reduce: {
      input: "$data.maps",
      initialValue: "$data.seeds",
      in: {$map: {
        input: "$$value",
        as: "seed",
        in: {$let: {
          vars: {
            mappings: {$filter: {
              input: "$$this",
              as: "map",
              cond: {$and: [
                  {$lte: ["$$map.from", "$$seed"]},
                  {$lt: ["$$seed", {$add: ["$$map.from", "$$map.length"]}]},
              ]},
            }},
          },
          in: {$cond: {
            if: {$eq: [{$size: "$$mappings"}, 1]},
            then: {$let: {
                vars: {map: {$arrayElemAt: ["$$mappings", 0]}},
                in: {$add: ["$$map.to", {$subtract: ["$$seed", "$$map.from"]}]},
            }},
            else: "$$seed",
          }},
        }},
      }},
    }},
  }},
  {$addFields: {location: {$first: {$sortArray: {input: "$locations", sortBy: 1}}}}},
  {$project: {_id: 0, data: 0, locations: 0}}
];

