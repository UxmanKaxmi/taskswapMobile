#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}"

METRO_PORT="${METRO_PORT:-8081}"

if [[ -n "${ANDROID_HOME:-}" && -x "${ANDROID_HOME}/platform-tools/adb" ]]; then
  ADB_BIN="${ANDROID_HOME}/platform-tools/adb"
elif [[ -x "${HOME}/Library/Android/sdk/platform-tools/adb" ]]; then
  ADB_BIN="${HOME}/Library/Android/sdk/platform-tools/adb"
else
  ADB_BIN="$(command -v adb || true)"
fi

if [[ -z "${ADB_BIN}" ]]; then
  echo "adb not found. Install Android platform-tools and set ANDROID_HOME."
  exit 1
fi

ensure_adb_responsive() {
  local tmp_out="/tmp/taskswap-adb-devices.txt"
  rm -f "${tmp_out}"

  "${ADB_BIN}" devices -l >"${tmp_out}" 2>&1 &
  local probe_pid=$!
  local waited=0

  while kill -0 "${probe_pid}" >/dev/null 2>&1; do
    if (( waited >= 8 )); then
      echo "adb devices is hanging. Restarting adb daemon..."
      kill -9 "${probe_pid}" >/dev/null 2>&1 || true
      pkill -f "adb -L tcp:5037 fork-server server" >/dev/null 2>&1 || true
      "${ADB_BIN}" kill-server >/dev/null 2>&1 || true
      "${ADB_BIN}" start-server >/dev/null
      break
    fi
    sleep 1
    waited=$((waited + 1))
  done

  wait "${probe_pid}" >/dev/null 2>&1 || true
  rm -f "${tmp_out}"
}

ensure_adb_responsive

# Keep emulator/usb devices on localhost for backend calls.
# This makes API URL stable regardless of LAN IP changes.
"${ADB_BIN}" devices | awk 'NR>1 && $2=="device" {print $1}' | while IFS= read -r serial; do
  [ -n "${serial}" ] || continue
  "${ADB_BIN}" -s "${serial}" reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}" >/dev/null 2>&1 || true
  "${ADB_BIN}" -s "${serial}" reverse tcp:3001 tcp:3001 >/dev/null 2>&1 || true
done

ENVFILE_ANDROID=".env.android.local"
GOOGLE_SENDER_ID="$(awk -F= '/^GOOGLE_SENDER_ID=/{print $2; exit}' .env.dev 2>/dev/null || true)"

{
  if [[ -n "${GOOGLE_SENDER_ID}" ]]; then
    echo "GOOGLE_SENDER_ID=${GOOGLE_SENDER_ID}"
  fi
  echo "APP_ENV=development"
  echo "BASE_URL=http://localhost:3001"
  echo "BASE_URL_IOS=http://localhost:3001"
  echo "BASE_URL_ANDROID=http://localhost:3001"
} > "${ENVFILE_ANDROID}"

echo "Using adb: ${ADB_BIN}"
echo "Using ENVFILE=${ENVFILE_ANDROID}"
echo "Using BASE_URL_ANDROID=http://localhost:3001 (via adb reverse tcp:3001)"
echo "Using METRO_PORT=${METRO_PORT} (via adb reverse tcp:${METRO_PORT})"
ENVFILE="${ENVFILE_ANDROID}" react-native run-android --port "${METRO_PORT}" "$@"
