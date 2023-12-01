#! /usr/bin/env python3

import sys
import json

MAX_COORD = 4000000

def find(sensors, y):
    segments = []
    for sensor in sensors:
        s = sensor["sensor"]
        dy = abs(s["y"] - y)
        if dy > sensor["dist"]:
            continue
        dx = sensor["dist"] - dy
        lf = max(0, s["x"] - dx)
        rg = min(MAX_COORD, s["x"] + dx)
        
        if lf <= rg:
            segments.append((lf, rg))
    segments.sort()

    print(y, segments)

    freeX = 0
    for lf, rg in segments:
        if freeX < lf:
            print(freeX, y)
            return True
        freeX = max(freeX, rg + 1)


sensors = []
for line in sys.stdin:
    sensor = json.loads(line)
    sensor["dist"] = abs(sensor["sensor"]["x"] - sensor["beacon"]["x"]) + abs(sensor["sensor"]["y"] - sensor["beacon"]["y"])    
    sensors.append(sensor)


for y in range(MAX_COORD + 1):
    if find(sensors, y):
        break
