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
# <AREA_NAME> defaults to "tyne_and_wear" if not given.

set -e

usage () {
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
DEFAULT_AREA_NAME="tyne_and_wear"
if [ -z "$1" ]; then
    AREA_NAME=$DEFAULT_AREA_NAME
else
    AREA_NAME=$1
fi

# The name of the repository on GitHub. This is required for the base path
# (otherwise hyperlinks won't work)
REPOSITORY_NAME="demoland-web"

# We use $@ instead of $AREA_NAME so that in the case where the user does not
# specify an area, load_area.sh notifies the user that we are defaulting to
# tyne_and_wear.
npm run load_area $@

# Build the site.
if [ "${BUILD_TARGET}" = "local" ]; then
    OUTDIR_BASE="dist"
    DEPLOYMENT_BASE=""
elif [ "${BUILD_TARGET}" = "github" ]; then
    OUTDIR_BASE="/tmp/${REPOSITORY_NAME}"
    DEPLOYMENT_BASE="/${REPOSITORY_NAME}"
elif [ "${BUILD_TARGET}" = "github_dev" ]; then
    OUTDIR_BASE="/tmp/${REPOSITORY_NAME}/dev"
    DEPLOYMENT_BASE="/${REPOSITORY_NAME}/dev"
fi
npx vite build \
    --outDir="${OUTDIR_BASE}/${AREA_NAME}" \
    --base="${DEPLOYMENT_BASE}/${AREA_NAME}"

# Set up the main page to redirect to tyne_and_wear (this is hardcoded in index.html)
echo '<head><meta http-equiv="refresh" content="0; url='"${DEFAULT_AREA_NAME}"'/" /></head>' > "${OUTDIR_BASE}/index.html"
