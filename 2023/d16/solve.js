load("../load_input.js");
load("generate_graph.js");
load("pipeline_1.js")
load("pipeline_2.js")

const coll = getCurrentCollection();
print("Generating graph");

coll.aggregate(graph_pipeline);
db.d16_graph.createIndex({node: 1});

print("Solving part 1");
print(coll.aggregate(pipeline1).toArray());
print("Solving part 2");
print(coll.aggregate(pipeline2).toArray());
