#! /usr/bin/env python3

import sys
import json

commands = []
for line in sys.stdin:
    line = line.strip()
    if line == "noop":
        commands.append({"command": line})
    elif line.startswith("addx"):
        command, v = line.split()
        commands.append({"command": command, "argument": int(v)})
    else:
        raise RuntimeError("WTF: " + line)
json.dump({"commands": commands}, sys.stdout)
