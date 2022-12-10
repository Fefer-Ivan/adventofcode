#! /usr/bin/env python3

import sys
import json

i = 0
for line in sys.stdin:
    print(json.dumps({"_id": i, "content": line.strip()}))
    i += 1
