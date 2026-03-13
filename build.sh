#!/bin/bash
# Grab the first 7 characters of the Vercel commit hash
COMMIT_HASH=${VERCEL_GIT_COMMIT_SHA:0:7}

# Fallback just in case you run this locally for testing
if [ -z "$COMMIT_HASH" ]; then
  COMMIT_HASH="local-testing"
fi

# Create the version.json file dynamically
echo "{\"version\": \"$COMMIT_HASH\"}" > version.json

# Inject the hash into the HTML and SW files
sed -i "s/{{VERSION}}/$COMMIT_HASH/g" index.html
sed -i "s/{{VERSION}}/$COMMIT_HASH/g" sw.js

echo "Build successful. version.json created and hash injected: $COMMIT_HASH"