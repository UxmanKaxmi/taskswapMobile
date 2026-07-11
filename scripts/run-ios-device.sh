#!/usr/bin/env bash
set -euo pipefail

DEVICE_NAME="${1:-${DEVICE_NAME:-}}"
BUILD_MODE="${BUILD_MODE:-Debug}"
IOS_SCHEME="${IOS_SCHEME:-PushMeUp}"
SOURCE_ENVFILE="${SOURCE_ENVFILE:-.env.dev}"
APP_ENV_OVERRIDE="${APP_ENV_OVERRIDE:-}"
START_METRO="${START_METRO:-}"
METRO_PORT="${METRO_PORT:-8081}"

if [[ -z "${APP_ENV_OVERRIDE}" ]]; then
  if [[ "${BUILD_MODE}" == "Release" ]]; then
    APP_ENV_OVERRIDE="production"
  else
    APP_ENV_OVERRIDE="development"
  fi
fi

if [[ -z "${START_METRO}" ]]; then
  if [[ "${BUILD_MODE}" == "Debug" ]]; then
    START_METRO="true"
  else
    START_METRO="false"
  fi
fi

if [[ -z "${DEVICE_NAME}" ]]; then
  DEVICE_NAME=$(xcrun xctrace list devices 2>/dev/null | \
    awk -F'[()]' '/iPhone/ && $0 !~ /Simulator/ {print $1; exit}' | \
    sed 's/[[:space:]]*$//')
fi

if [[ -z "${DEVICE_NAME}" ]]; then
  echo "No physical iPhone device found. Connect and trust your device."
  exit 1
fi

if [[ "${START_METRO}" == "true" ]] && ! lsof -i :"${METRO_PORT}" >/dev/null 2>&1; then
  echo "Starting Metro on port ${METRO_PORT}..."
  ENVFILE="${SOURCE_ENVFILE}" bun run start -- --port "${METRO_PORT}" >/tmp/metro.log 2>&1 &
  sleep 2
fi

HOST_IP="${HOST_IP:-}"
if [[ -z "${HOST_IP}" ]]; then
  DEFAULT_IFACE=$(route -n get default 2>/dev/null | awk '/interface:/{print $2; exit}')
  if [[ -n "${DEFAULT_IFACE}" ]]; then
    HOST_IP=$(ipconfig getifaddr "${DEFAULT_IFACE}" 2>/dev/null || true)
  fi
fi
if [[ -z "${HOST_IP}" ]]; then
  for iface in en0 en1 en2 en3 en4 en5 en6 en7 en8; do
    HOST_IP=$(ipconfig getifaddr "${iface}" 2>/dev/null || true)
    if [[ -n "${HOST_IP}" ]]; then
      break
    fi
  done
fi
if [[ -z "${HOST_IP}" ]]; then
  echo "Could not determine LAN IP. Set HOST_IP env var (e.g., HOST_IP=192.168.1.10)."
  exit 1
fi

BASE_URL_IOS="http://${HOST_IP}:3001"
ENVFILE_DEVICE=".env.device.local"
GOOGLE_SENDER_ID=""
if [[ -f "${SOURCE_ENVFILE}" ]]; then
  GOOGLE_SENDER_ID="$(awk -F= '/^GOOGLE_SENDER_ID=/{print $2; exit}' "${SOURCE_ENVFILE}" || true)"
fi

{
  if [[ -n "${GOOGLE_SENDER_ID}" ]]; then
    echo "GOOGLE_SENDER_ID=${GOOGLE_SENDER_ID}"
  fi
  echo "APP_ENV=${APP_ENV_OVERRIDE}"
  echo "BASE_URL=${BASE_URL_IOS}"
  echo "BASE_URL_IOS=${BASE_URL_IOS}"
  echo "BASE_URL_ANDROID=${BASE_URL_IOS}"
} > "${ENVFILE_DEVICE}"

echo "Running on device: ${DEVICE_NAME}"
echo "Build mode: ${BUILD_MODE}"
echo "iOS scheme: ${IOS_SCHEME}"
echo "Start Metro: ${START_METRO}"
echo "Metro port: ${METRO_PORT}"
echo "Source ENVFILE=${SOURCE_ENVFILE}"
echo "Using ENVFILE=${ENVFILE_DEVICE}"
echo "Using BASE_URL_IOS=${BASE_URL_IOS}"

# Always remove /tmp/envfile on exit instead of restoring the previous value.
# react-native-config gives /tmp/envfile priority over the ENVFILE variable,
# so a restored stale value silently hijacks every later dev build (this is
# how a simulator run once ended up pointed at the prod backend). The trap
# also can't fire on hard kills — `bun ios` clears the file defensively too.
cleanup_envfile() {
  rm -f /tmp/envfile
}
trap cleanup_envfile EXIT INT TERM

echo "${ENVFILE_DEVICE}" > /tmp/envfile
ENVFILE="${ENVFILE_DEVICE}" npx react-native run-ios --device "${DEVICE_NAME}" --mode "${BUILD_MODE}" --scheme "${IOS_SCHEME}" --port "${METRO_PORT}"
