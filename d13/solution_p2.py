#! /usr/bin/env python3

import functools
import json
import sys
from collections.abc import Iterable

lines = []
for line in sys.stdin:
    line = line.strip()
    if line:
        lines.append(json.loads(line))

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
            last_cmp = cmp(lhs[i], rhs[i])
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

d1 = [[2]]
d2 = [[6]]
lines.append(d1)
lines.append(d2)

lines.sort(key=functools.cmp_to_key(cmp))

print((lines.index(d1) + 1) * (lines.index(d2) + 1))

