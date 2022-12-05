#! /usr/bin/env python3

import sys
import json
from collections import defaultdict

stacks = defaultdict(list)

for line in sys.stdin:
    i = 0
    while i < len(line):
        if line[i] == '[':
            stacks[i // 4 + 1].append(line[i + 1])
        i += 4
    if line == "\n":
        break

commands = [] 
for line in sys.stdin:
    tokens = line.split()
    commands.append((int(tokens[1]), int(tokens[3]), int(tokens[5])))

with open("stacks.json", "w") as f:
    stack_list = [[]]
    for i in range(1, 10):
        stack_list.append(stacks[i])
    print(json.dumps(stack_list), file=f)

with open("commands.json", "w") as f:
    for i in range(len(commands)):
        command = commands[i]
        print(json.dumps({"_id": i, "count": command[0], "from": command[1], "to": command[2]}), file=f)

