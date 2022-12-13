#! /usr/bin/env python3

import sys
import json
from collections.abc import Iterable

ID = 1

def flush(lines):
    global ID
    pair = (ID, json.loads(lines[0]), json.loads(lines[1]))
    ID += 1
    lines.clear()
    return pair

lines = []
pairs = []
for line in sys.stdin:
    line = line.strip()
    if line:
        lines.append(line)
    else:
        pairs.append(flush(lines))
pairs.append(flush(lines))

def cmp_debug(lhs, rhs):
    res = cmp(lhs, rhs)
    print(lhs, "<=>", rhs, "=", res)
    return res

def cmp(lhs, rhs):
    lit = isinstance(lhs, Iterable)
    rit = isinstance(rhs, Iterable)
    if lit or rit:
        if not lit:
            lhs = [lhs]
        if not rit:
            rhs = [rhs]
        i = 0
        while i < len(lhs) and i < len(rhs):
            last_cmp = cmp_debug(lhs[i], rhs[i])
            if last_cmp != 0:
                return last_cmp
            i += 1

        if len(lhs) < len(rhs):
            return -1
        elif len(lhs) == len(rhs):
            return 0
        else:
            return 1
    else:
        if lhs < rhs:
            return -1
        elif lhs == rhs:
            return 0
        else:
            return 1

s = 0
for pair in pairs:
    if cmp(pair[1], pair[2]) < 0:
        s += pair[0]

print(s)
