#! /usr/bin/env python3

import sys
import json

ID = 0

def parse_ls_line(ls_line):
    a, b = ls_line.split()
    if a == "dir":
        return {"type":"dir", "name": b}
    else:
        return {"type":"file", "size": int(a), "name": b}


def flush(current_ls):
    global ID
    if len(current_ls) > 0:
        print(json.dumps({
            "_id": ID,
            "command": "ls",
            "output": [parse_ls_line(ls_line) for ls_line in current_ls]
        }))
        ID += 1
        current_ls.clear()


current_ls = []
for line in sys.stdin:
    if not line.startswith("$"):
        current_ls.append(line.strip())
        continue
    flush(current_ls)
    if line.startswith("$ cd"):
        print(json.dumps({"_id": ID, "command": "cd", "argument": line.split()[2]}))
        ID += 1

flush(current_ls)
