#!/bin/sh

# NOTE: This script is intended to be run via npm, not manually.
#
# Usage:
#
# For local deployment (run a HTTP server from the /dist directory)
#     npm run build local <AREA_NAME> 
# For GitHub Pages main branch deployment
#     npm run build github <AREA_NAME>
# For GitHub Pages dev branch deployment
#     npm run build github_dev <AREA_NAME>
#
# <AREA_NAME> defaults to "newcastle" if not given.

set -e

function usage {
    echo "Usage: npm run build <local|github|github_dev> [AREA_NAME]"
    exit 1
}

# Consume the first argument
if [ -z "$1" ]; then
    usage
else
    if [ "$1" = "local" ]; then
        echo "Building for local deployment"
    elif [ "$1" = "github" ]; then
        echo "Building for GitHub Pages main branch deployment"
    elif [ "$1" = "github_dev" ]; then
        echo "Building for GitHub Pages dev branch deployment"
    else
        usage
    fi
    BUILD_TARGET=$1
fi
shift

# This script needs to then also detect the area name too so that we can put
# the built files in the appropriate output directory.
if [ -z "$1" ]; then
    AREA_NAME="newcastle"
else
    AREA_NAME=$1
fi

# The name of the repository on GitHub. This is required for the base path
# (otherwise hyperlinks won't work)
REPOSITORY_NAME="demoland-web"

# We use $@ instead of $AREA_NAME so that in the case where the user does not
# specify an area, load_area.sh notifies the user that we are defaulting to
# Newcastle.
npm run load_area $@

if [ "${BUILD_TARGET}" = "local" ]; then
    npx vite build \
        --outDir="dist/${AREA_NAME}" \
        --base="/${AREA_NAME}"
elif [ "${BUILD_TARGET}" = "github" ]; then
    # This allows us to simply upload the entire contents of
    # /tmp/${REPOSITORY_NAME} to the gh-pages branch.
    npx vite build \
        --outDir="/tmp/${REPOSITORY_NAME}/${AREA_NAME}" \
        --base="/${REPOSITORY_NAME}/${AREA_NAME}"
elif [ "${BUILD_TARGET}" = "github_dev" ]; then
    npx vite build \
        --outDir="/tmp/${REPOSITORY_NAME}/dev/${AREA_NAME}" \
        --base="/${REPOSITORY_NAME}/dev/${AREA_NAME}"
fi

# Set up the main page to redirect to Newcastle (this is hardcoded in index.html)
cp node_scripts/index.html dist/index.html
