#! /usr/bin/env python3

import sys

data = ""
for line in sys.stdin:
    data += line.strip().replace('\\', '\\\\') + "\\n"
print(data)
