#! /usr/bin/env python3

import sys
import json
from collections.abc import Iterable

MAX_DEPTH = 0
def get_max_depth(a, d):
    global MAX_DEPTH
    MAX_DEPTH = max(MAX_DEPTH, d)
    if isinstance(a, Iterable):
        for i in a:
            get_max_depth(i, d+1)
            
i = 0
for line in sys.stdin:
    line = line.strip()
    if line:
        a = json.loads(line)
        print(json.dumps({"_id": i, "input": a}))
        get_max_depth(a, 0)
        i += 1

print("MAX_DEPTH", MAX_DEPTH, file=sys.stderr)
