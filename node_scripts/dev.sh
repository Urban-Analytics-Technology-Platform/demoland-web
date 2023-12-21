#!/bin/sh

# NOTE: This script is intended to be run via npm, not manually.

set -e

npm run load_area $@
npx vite dev --clearScreen false
