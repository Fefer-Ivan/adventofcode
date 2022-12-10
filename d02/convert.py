#! /usr/bin/env python3

import sys
import json

i = 0
for line in sys.stdin:
    p1, p2 = line.strip().split()
    print(json.dumps({"_id": i, "p1": p1, "p2": p2}))
    i += 1
