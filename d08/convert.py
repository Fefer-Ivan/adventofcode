#! /usr/bin/env python3

import sys
import json

json.dump({"input": [line.strip() for line in sys.stdin]}, sys.stdout)

