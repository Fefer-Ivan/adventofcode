#! /usr/bin/env python3

import sys
import json

lines = list(sys.stdin.readlines())
line_i = 0

def next():
    global lines
    global line_i
    cur = line_i
    line_i += 1
    return lines[cur].strip()

monkeys = []
for i in range(8):
    next()
    items = [int(e.split()[-1]) for e in next().split(",")]
    op = next().split()[-3:]
    testDiv = int(next().split()[-1])
    destTrue = int(next().split()[-1])
    destFalse = int(next().split()[-1])
    monkeys.append({
        "_id": i,
        "items": items,
        "op": {"operator": op[1], "lhs": op[0], "rhs": op[2]},
        "test": testDiv,
        "dest": [destFalse, destTrue]
    })
    next()

print(json.dumps({"monkeys": monkeys}))
