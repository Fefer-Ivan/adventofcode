#! /usr/bin/env python3

import sys
import json

lines = [line.strip() for line in sys.stdin]
print(json.dumps({"input": lines}))
