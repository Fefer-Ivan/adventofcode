#! /usr/bin/env python3

import sys
import json

def dump(current, i):
    print(json.dumps({"_id": i, "food": current}))

i = 0
current = []

for line in sys.stdin:
    line = line.strip()
    if line:
        current.append(int(line))
    else:
        dump(current, i)
        current = []
        i += 1
dump(current, i)
