#! /usr/bin/env python3

import sys
import json

i = 0
for line in sys.stdin:
    points = []
    for point in line.split('->'):
        x, y = [int(e) for e in point.strip().split(",")]
        points.append({"x": x, "y": y})
    print(json.dumps({"_id": i, "points": points}))
    i += 1
