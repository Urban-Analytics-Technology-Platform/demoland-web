#!/bin/sh

# This script 'loads' the area given as a positional argument by copying the
# appropriate files from the 'areas' directory to 'src/data'. If no area name
# is given the script defaults to 'newcastle'.
#
# NOTE: This script is intended to be run via npm, not manually.

echo "Current directory: $(pwd)..."

if [ -z "$1" ]; then
    echo "No area name supplied, defaulting to 'newcastle'..."
    AREA_NAME="newcastle"
else
    echo "Loading area: $1"
    AREA_NAME=$1
fi

echo "Copying files from areas/$1 to src/data..."

cp -r areas/$AREA_NAME/* src/data
