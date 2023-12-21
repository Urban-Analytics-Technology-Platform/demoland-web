#!/bin/sh

# NOTE: This script is intended to be run via npm, not manually.

npm run load_area $@
npx vite dev
