#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="ios/taskswapMobile.xcworkspace"
SCHEME="taskswapMobile"
DERIVED_DATA="ios/build"
APP_PATH="${DERIVED_DATA}/Build/Products/Debug-iphonesimulator/${SCHEME}.app"
BUNDLE_ID="com.taskswap.ios"

echo "Building iOS app (Debug) for simulator..."
ENVFILE=.env.dev xcodebuild \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath "${DERIVED_DATA}" \
  build

if [[ ! -d "${APP_PATH}" ]]; then
  echo "App not found at ${APP_PATH}"
  exit 1
fi

BOOTED_UDIDS=$(xcrun simctl list --json devices | \
  python3 - <<'PY'
import json,sys
data=json.load(sys.stdin)
udids=[]
for runtime,devices in data.get("devices",{}).items():
    for d in devices:
        if d.get("state")=="Booted":
            udids.append(d.get("udid"))
print("\n".join(udids))
PY
)

if [[ -z "${BOOTED_UDIDS}" ]]; then
  echo "No booted simulators found."
  exit 0
fi

echo "Installing and launching on booted simulators..."
while IFS= read -r UDID; do
  echo "-> ${UDID}"
  xcrun simctl install "${UDID}" "${APP_PATH}"
  xcrun simctl launch "${UDID}" "${BUNDLE_ID}" || true
done <<< "${BOOTED_UDIDS}"
