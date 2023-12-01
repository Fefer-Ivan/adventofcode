#! /usr/bin/env python3

import sys
import json

commands = []
for line in sys.stdin:
    d, c = line.split()
    commands.append({"dir": d, "count": int(c)})
json.dump({"commands": commands}, sys.stdout)
