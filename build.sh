#!/bin/bash
# Grab the first 7 characters of the Vercel commit hash
COMMIT_HASH=${VERCEL_GIT_COMMIT_SHA:0:7}

# Fallback just in case you run this locally for testing
if [ -z "$COMMIT_HASH" ]; then
  COMMIT_HASH="local-testing"
fi

# Create the version.json file dynamically
echo "{\"version\": \"$COMMIT_HASH\"}" > version.json

echo "Build successful. version.json created with hash: $COMMIT_HASH"