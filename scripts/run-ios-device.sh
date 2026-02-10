#!/usr/bin/env bash
set -euo pipefail

DEVICE_NAME="${1:-${DEVICE_NAME:-}}"

if [[ -z "${DEVICE_NAME}" ]]; then
  DEVICE_NAME=$(xcrun xctrace list devices 2>/dev/null | \
    awk -F'[()]' '/iPhone/ && $0 !~ /Simulator/ {print $1; exit}' | \
    sed 's/[[:space:]]*$//')
fi

if [[ -z "${DEVICE_NAME}" ]]; then
  echo "No physical iPhone device found. Connect and trust your device."
  exit 1
fi

if ! lsof -i :8081 >/dev/null 2>&1; then
  echo "Starting Metro on port 8081..."
  yarn start >/tmp/metro.log 2>&1 &
  sleep 2
fi

HOST_IP="${HOST_IP:-}"
if [[ -z "${HOST_IP}" ]]; then
  HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || true)
fi
if [[ -z "${HOST_IP}" ]]; then
  HOST_IP=$(ipconfig getifaddr en1 2>/dev/null || true)
fi
if [[ -z "${HOST_IP}" ]]; then
  echo "Could not determine LAN IP. Set HOST_IP env var (e.g., HOST_IP=192.168.1.10)."
  exit 1
fi

BASE_URL_IOS="http://${HOST_IP}:3001"

echo "Running on device: ${DEVICE_NAME}"
echo "Using BASE_URL_IOS=${BASE_URL_IOS}"
BASE_URL_IOS="${BASE_URL_IOS}" BASE_URL="${BASE_URL_IOS}" ENVFILE=.env.dev \
  npx react-native run-ios --device "${DEVICE_NAME}"
