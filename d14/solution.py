#! /usr/bin/env python3

import sys

def sign(x):
    if x < 0:
        return -1
    elif x > 0:
        return 1
    else:
        return 0

maxy = 0
lines = []
for line in sys.stdin:
    points = line.split("->")
    coords = []
    for point in points:
        x, y = [int(e) for e in point.strip().split(",")]
        maxy = max(maxy, y)
        coords.append((x, y))
    lines.append(coords)

maxy += 5
occupied = set()
for line in lines:
    x, y = line[0]
    occupied.add((x, y))
    for nx, ny in line[1:]:
        while x != nx or y != ny:
            x += sign(nx - x)
            y += sign(ny - y)
            occupied.add((x, y))

count = 0
while True:
    x = 500
    y = 0
  
    stopped = False
    while y < maxy:
        updated = False
        for dx, dy in [[0, 1], [-1, 1], [1, 1]]:
            nx = x + dx
            ny = y + dy
            if (nx, ny) not in occupied:
                x = nx
                y = ny
                updated = True
                break
        if not updated:
            occupied.add((x, y))
            stopped = True
            break

    if not stopped:
        break
    count += 1

print(count)
