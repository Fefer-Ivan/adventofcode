#! /usr/bin/env python3

import sys
import json

for line in sys.stdin:
    # Valve RT has flow rate=0; tunnels lead to valves EN, LZ
    tokens = line.strip().split()
    name = tokens[1]
    rate = int(tokens[4].split("=")[1].split(";")[0])
    tunnels = []
    for to in tokens[9:]:
       tunnels.append(to.split(",")[0]) 
    print(json.dumps({"_id": name, "rate": rate, "tunnels": tunnels}))
