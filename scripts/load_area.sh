#!/bin/sh

# This script 'loads' the area given as a positional argument by copying the
# appropriate files from the 'areas' directory to 'src/data'. If no area name
# is given the script defaults to 'newcastle'.
#
# NOTE: This script is intended to be run via npm, not manually.

REDBOLD="\033[1;31m"
RESET="\033[0m"

printf "Current directory: $(pwd)\n"

if [ -z "$1" ]; then
    printf "${BOLD}No DemoLand area name supplied, defaulting to 'newcastle'.${RESET}\n"
    AREA_NAME="newcastle"
else
    printf "${BOLD}Loading DemoLand area: $1.${RESET}\n"
    AREA_NAME=$1
fi

if [ -d "areas/$AREA_NAME" ]; then
    printf "Copying files from areas/$AREA_NAME to src/data/..."
    mkdir -p src/data
    cp -r areas/$AREA_NAME/* src/data
    printf "done\n"
else
    printf "${REDBOLD}Error: directory 'areas/$AREA_NAME' not found${RESET}\n"
    exit 1
fi
