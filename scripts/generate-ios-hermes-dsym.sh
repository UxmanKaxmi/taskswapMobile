#!/bin/sh
set -e

if [ "${PLATFORM_NAME}" != "iphoneos" ]; then
  exit 0
fi

if [ "${CONFIGURATION}" != "Release" ]; then
  exit 0
fi

HERMES_BINARY="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}/hermes.framework/hermes"
if [ ! -f "${HERMES_BINARY}" ]; then
  HERMES_BINARY="${BUILT_PRODUCTS_DIR}/XCFrameworkIntermediates/hermes-engine/Pre-built/hermes.framework/hermes"
fi

if [ ! -f "${HERMES_BINARY}" ]; then
  echo "warning: hermes.framework binary not found; skipping Hermes dSYM generation"
  exit 0
fi

DSYM_OUTPUT="${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"
mkdir -p "${DWARF_DSYM_FOLDER_PATH}"
rm -rf "${DSYM_OUTPUT}"

echo "Generating Hermes dSYM from ${HERMES_BINARY}"
xcrun dsymutil "${HERMES_BINARY}" -o "${DSYM_OUTPUT}"

if [ -n "${ARCHIVE_PATH}" ] && [ -d "${ARCHIVE_PATH}" ]; then
  mkdir -p "${ARCHIVE_PATH}/dSYMs"
  rm -rf "${ARCHIVE_PATH}/dSYMs/hermes.framework.dSYM"
  cp -R "${DSYM_OUTPUT}" "${ARCHIVE_PATH}/dSYMs/"
fi

xcrun dwarfdump --uuid "${DSYM_OUTPUT}" || true
