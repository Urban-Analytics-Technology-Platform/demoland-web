#!/bin/sh

# NOTE: This script is intended to be run via npm, not manually.
#
# Usage:
#
# For local deployment
#     npm run build_all local
# For GitHub Pages main branch deployment
#     npm run build_all github
# For GitHub Pages dev branch deployment
#     npm run build_all github_dev

set -e

usage () {
    echo "Usage: npm run build_all <local|github|github_dev>"
    exit 1
}

# Consume the first argument
if [ -z "$1" ]; then
    usage
else
    if [ "$1" = "local" ]; then
        echo "Building all areas for local deployment"
    elif [ "$1" = "github" ]; then
        echo "Building all areas for GitHub Pages main branch deployment"
    elif [ "$1" = "github_dev" ]; then
        echo "Building all areas for GitHub Pages dev branch deployment"
    else
        usage
    fi
    BUILD_TARGET=$1
fi
shift

# Run `npm run build` on all areas
for AREA in $(ls -d ./areas/*); do
    AREA=$(basename $AREA)
    npm run build $BUILD_TARGET $AREA
done
