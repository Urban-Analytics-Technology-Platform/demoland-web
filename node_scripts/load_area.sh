#!/bin/sh

# This script 'loads' the area given as a positional argument by copying the
# appropriate files from the 'areas' directory to 'src/data'. If no area name
# is given the script defaults to 'tyne_and_wear'.
#
# NOTE: This script is intended to be run via npm, not manually.

set -e

BOLD="\033[1m"
REDBOLD="\033[1;31m"
RESET="\033[0m"

printf "Current directory: $(pwd)\n"

DEFAULT_AREA_NAME="tyne_and_wear"
if [ -z "$1" ]; then
    printf "${BOLD}No DemoLand area name supplied, defaulting to '${DEFAULT_AREA_NAME}'.${RESET}\n"
    AREA_NAME=$DEFAULT_AREA_NAME
else
    printf "${BOLD}Loading DemoLand area: $1${RESET}\n"
    AREA_NAME=$1
fi

if [ -d "areas/$AREA_NAME" ]; then
    printf "Copying files from areas/$AREA_NAME to src/data... "
    rm -rf src/data
    mkdir -p src/data
    cp -r areas/$AREA_NAME/* src/data
    printf "done\n"
else
    printf "${REDBOLD}Error: directory 'areas/$AREA_NAME' not found${RESET}\n"
    exit 1
fi
