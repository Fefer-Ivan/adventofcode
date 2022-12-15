#! /usr/bin/env python3

import sys
import json

for line in sys.stdin:
    #Sensor at x=3844106, y=3888618: closest beacon is at x=3225436, y=4052707
    tokens = line.strip().split()
    sx = int(tokens[2].split("=")[1].split(",")[0])
    sy = int(tokens[3].split("=")[1].split(":")[0])
    bx = int(tokens[-2].split("=")[1].split(",")[0])
    by = int(tokens[-1].split("=")[1])
    print(json.dumps({"sensor": {"x":sx, "y": sy}, "beacon": {"x": bx, "y": by}}))

