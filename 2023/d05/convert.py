#! /usr/bin/env python3

import json
import sys

seeds = []
maps = []
currentMap = None

for line in sys.stdin:
    if line.startswith('seeds:'):
        seeds = [int(e) for e in line.strip().split()[1:]]
    elif len(line.strip()) == 0:
        continue
    elif 'map:' in line:
        if currentMap != None:
            maps.append(currentMap)
        currentMap = []
    else:
        destination, source, size = [int(e) for e in line.strip().split()]
        currentMap.append({"from": source, "to": destination, "length": size})
maps.append(currentMap)

print(json.dumps({"seeds": seeds, "maps": maps}))
