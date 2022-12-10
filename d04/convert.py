#! /usr/bin/env python3

import sys
import json

def to_int_array(s):
    return [int(e) for e in s.split('-')]

for line in sys.stdin:
    a, b = line.strip().split(',')
    x1, y1 = to_int_array(a)
    x2, y2 = to_int_array(b)
    print(json.dumps({"x1": x1, "y1": y1, "x2": x2, "y2": y2})) 
