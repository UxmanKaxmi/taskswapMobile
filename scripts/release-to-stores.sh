#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ENV_FILE="${RELEASE_ENV_FILE:-.env.release.local}"

load_release_env() {
  local env_file="$RELEASE_ENV_FILE"

  case "$env_file" in
    /*) ;;
    *) env_file="$ROOT_DIR/$env_file" ;;
  esac

  if [ -f "$env_file" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

first_matching_file() {
  local pattern="$1"
  local match

  for match in $pattern; do
    [ -f "$match" ] || continue
    printf '%s\n' "$match"
    return 0
  done

  return 1
}

load_release_env

RUN_IOS=true
RUN_ANDROID=true
SKIP_BUILD=false
BUMP_BUILD=true

APP_ENV_FILE="${APP_ENV_FILE:-.env.prod}"

IOS_WORKSPACE="${IOS_WORKSPACE:-ios/PushMeUp.xcworkspace}"
IOS_SCHEME="${IOS_SCHEME:-PushMeUp}"
IOS_CONFIGURATION="${IOS_CONFIGURATION:-Release}"
IOS_BUNDLE_ID="${IOS_BUNDLE_ID:-com.pushmeup.app}"
IOS_TEAM_ID="${IOS_TEAM_ID:-ZW59CUVSS3}"
IOS_ARCHIVE_PATH="${IOS_ARCHIVE_PATH:-$ROOT_DIR/ios/build-testflight/PushMeUp.xcarchive}"
IOS_EXPORT_DIR="${IOS_EXPORT_DIR:-$ROOT_DIR/ios/build-testflight/export}"
IOS_DERIVED_DATA_PATH="${IOS_DERIVED_DATA_PATH:-$ROOT_DIR/ios/build-testflight/DerivedData}"
IOS_CODE_SIGN_IDENTITY="${IOS_CODE_SIGN_IDENTITY:-Apple Distribution}"
IOS_ALLOW_XCODE_ACCOUNT_UPLOAD="${IOS_ALLOW_XCODE_ACCOUNT_UPLOAD:-false}"

APP_STORE_CONNECT_API_KEY_PATH="${APP_STORE_CONNECT_API_KEY_PATH:-${ASC_API_KEY_PATH:-}}"
if [ -z "$APP_STORE_CONNECT_API_KEY_PATH" ]; then
  APP_STORE_CONNECT_API_KEY_PATH="$(first_matching_file "$HOME/Downloads/AuthKey_*.p8" || true)"
fi

ANDROID_AAB_PATH="${ANDROID_AAB_PATH:-$ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab}"
PLAY_STORE_PACKAGE_NAME="${PLAY_STORE_PACKAGE_NAME:-com.pushmeup.app}"
PLAY_STORE_TRACK="${PLAY_STORE_TRACK:-internal}"
PLAY_STORE_RELEASE_STATUS="${PLAY_STORE_RELEASE_STATUS:-completed}"
GOOGLE_PLAY_JSON_KEY="${GOOGLE_PLAY_JSON_KEY:-${SUPPLY_JSON_KEY:-}}"
if [ -z "$GOOGLE_PLAY_JSON_KEY" ]; then
  GOOGLE_PLAY_JSON_KEY="$(first_matching_file "$HOME/Downloads/*play*.json $HOME/Downloads/*google*.json $HOME/Downloads/taskswap-*.json" || true)"
fi

TEMP_FILES=()
PREV_TMP_ENVFILE=""
HAD_TMP_ENVFILE=false
TMP_ENVFILE_ACTIVE=false

usage() {
  cat <<'USAGE'
Build and upload PushMeUp releases to TestFlight and Google Play.

Usage:
  bash scripts/release-to-stores.sh [--ios-only|--android-only] [--skip-build] [--no-bump-build]

Default behavior:
  Increments the shared build number in app.json (the single source of truth
  for iOS, Android, and the in-app version label), then builds and uploads
  both platforms. The bump is skipped when --skip-build is used.

  Releasing platforms in two separate runs? Pass --no-bump-build on the
  second run so both stores ship the same build number.

Required for TestFlight:
  Set all three for App Store Connect API-key auth:
  APP_STORE_CONNECT_API_KEY_PATH=/absolute/path/to/AuthKey_XXXXXXXXXX.p8
  APP_STORE_CONNECT_ISSUER_ID=...
  APP_STORE_CONNECT_KEY_ID=... # optional when the file is named AuthKey_<KEY_ID>.p8

  Or set all three:
  APP_STORE_CONNECT_KEY_ID=...
  APP_STORE_CONNECT_ISSUER_ID=...
  APP_STORE_CONNECT_API_KEY_CONTENT='-----BEGIN PRIVATE KEY-----...'

  Xcode account auth is intentionally disabled by default because it often creates
  development-signed archives in CI/CLI runs. Set IOS_ALLOW_XCODE_ACCOUNT_UPLOAD=true
  only if Xcode account signing is known to work on this machine.

Required for Google Play:
  GOOGLE_PLAY_JSON_KEY=/absolute/path/to/google-play-service-account.json

Useful overrides:
  RELEASE_ENV_FILE=.env.release.local
  PLAY_STORE_TRACK=internal|alpha|beta|production
  PLAY_STORE_RELEASE_STATUS=completed|draft|inProgress|halted
  APP_ENV_FILE=.env.prod
  IOS_ARCHIVE_PATH=/absolute/path/to/App.xcarchive
  IOS_DERIVED_DATA_PATH=/absolute/path/to/DerivedData
  IOS_TEAM_ID=ZW59CUVSS3
USAGE
}

log() {
  printf '\n==> %s\n' "$*"
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

cleanup() {
  set +u
  if [ "$TMP_ENVFILE_ACTIVE" = true ]; then
    restore_tmp_envfile
  fi

  for file in "${TEMP_FILES[@]}"; do
    [ -f "$file" ] && rm -f "$file"
  done
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required but was not found in PATH."
}

# app.json is the single source of truth for the app version: JS constants,
# android/app/build.gradle, and the Xcode "Sync App Version" build phase all
# read it, so bumping this one number bumps every platform.
bump_build_numbers() {
  require_cmd node
  require_cmd perl

  local next_build
  next_build="$(
    node -e '
      const fs = require("fs");
      const path = process.argv[1];
      const appJson = JSON.parse(fs.readFileSync(path, "utf8"));
      if (!Number.isInteger(appJson.build)) {
        throw new Error("app.json is missing an integer \"build\" field.");
      }
      appJson.build += 1;
      fs.writeFileSync(path, JSON.stringify(appJson, null, 2) + "\n");
      process.stdout.write(String(appJson.build));
    ' "$ROOT_DIR/app.json"
  )" || fail "Could not bump the build number in app.json."

  # Keep the Xcode fallback in step so the project UI shows the real number
  # (the build phase stamps app.json's value into the built Info.plist).
  perl -0pi -e "s/(CURRENT_PROJECT_VERSION = )\\d+(;)/\${1}${next_build}\${2}/g" \
    "$ROOT_DIR/ios/PushMeUp.xcodeproj/project.pbxproj"

  log "Build bumped to $next_build in app.json (gradle + Xcode + JS all read it)"
}

set_tmp_envfile() {
  printf '%s\n' "$APP_ENV_FILE" >/tmp/envfile
  TMP_ENVFILE_ACTIVE=true
}

restore_tmp_envfile() {
  # Never restore the previous value: /tmp/envfile outranks the ENVFILE
  # variable in react-native-config, so restoring a stale entry (e.g. from an
  # earlier hard-killed run) silently points later dev builds at the wrong
  # backend. Removing it always falls back to each command's own ENVFILE.
  rm -f /tmp/envfile
  TMP_ENVFILE_ACTIVE=false
}

run_fastlane() {
  if command -v bundle >/dev/null 2>&1 && bundle exec fastlane --version >/dev/null 2>&1; then
    FASTLANE_SKIP_UPDATE_CHECK=1 bundle exec fastlane "$@"
    return
  fi

  if command -v fastlane >/dev/null 2>&1; then
    FASTLANE_SKIP_UPDATE_CHECK=1 fastlane "$@"
    return
  fi

  fail "fastlane is required. Install it with 'brew install fastlane' or add it to your Ruby bundle."
}

ensure_fastlane() {
  run_fastlane --version >/dev/null
}

IOS_AUTH_ARGS=()
IOS_AUTH_ARGS_SET=false

resolve_xcodebuild_auth_args() {
  IOS_AUTH_ARGS=()
  IOS_AUTH_ARGS_SET=false

  local api_key_path="${APP_STORE_CONNECT_API_KEY_PATH:-${ASC_API_KEY_PATH:-}}"
  local key_id="${APP_STORE_CONNECT_KEY_ID:-${ASC_KEY_ID:-}}"
  local issuer_id="${APP_STORE_CONNECT_ISSUER_ID:-${ASC_ISSUER_ID:-}}"

  if [ -n "$api_key_path" ]; then
    [ -f "$api_key_path" ] || fail "APP_STORE_CONNECT_API_KEY_PATH does not exist: $api_key_path"

    case "$api_key_path" in
      *.json)
        require_cmd node
        local tmp_p8
        tmp_p8="$(mktemp "${TMPDIR:-/tmp}/asc-auth-key.XXXXXX.p8")"
        TEMP_FILES+=("$tmp_p8")
        local json_values
        json_values="$(
          node - "$api_key_path" "$tmp_p8" <<'NODE'
const fs = require('fs');
const [jsonPath, keyPath] = process.argv.slice(2);
const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
if (!payload.key_id || !payload.issuer_id || !payload.key) {
  throw new Error('API key JSON must include key_id, issuer_id, and key.');
}
fs.writeFileSync(keyPath, payload.key.replace(/\\n/g, '\n'), { mode: 0o600 });
process.stdout.write([payload.key_id, payload.issuer_id, keyPath].join('\n'));
NODE
        )"
        key_id="$(printf '%s\n' "$json_values" | sed -n '1p')"
        issuer_id="$(printf '%s\n' "$json_values" | sed -n '2p')"
        api_key_path="$(printf '%s\n' "$json_values" | sed -n '3p')"
        ;;
      *.p8)
        if [ -z "$key_id" ]; then
          local key_filename
          key_filename="$(basename "$api_key_path")"
          key_id="${key_filename#AuthKey_}"
          key_id="${key_id%.p8}"
        fi

        [ -n "$key_id" ] && [ "$key_id" != "$(basename "$api_key_path")" ] || fail "APP_STORE_CONNECT_KEY_ID is required when APP_STORE_CONNECT_API_KEY_PATH points to a .p8 file that is not named AuthKey_<KEY_ID>.p8."
        [ -n "$issuer_id" ] || fail "APP_STORE_CONNECT_ISSUER_ID is required when APP_STORE_CONNECT_API_KEY_PATH points to a .p8 file."
        ;;
      *)
        fail "APP_STORE_CONNECT_API_KEY_PATH must be a .p8 App Store Connect key or a Fastlane-style .json API key."
        ;;
    esac

    IOS_AUTH_ARGS=(-authenticationKeyPath "$api_key_path" -authenticationKeyID "$key_id" -authenticationKeyIssuerID "$issuer_id")
    IOS_AUTH_ARGS_SET=true
    return
  fi

  if [ -n "$key_id" ] &&
    [ -n "$issuer_id" ] &&
    [ -n "${APP_STORE_CONNECT_API_KEY_CONTENT:-}" ]; then
    local tmp_file
    tmp_file="$(mktemp "${TMPDIR:-/tmp}/asc-api-key.XXXXXX.p8")"
    TEMP_FILES+=("$tmp_file")
    printf '%s\n' "${APP_STORE_CONNECT_API_KEY_CONTENT//\\n/$'\n'}" >"$tmp_file"
    IOS_AUTH_ARGS=(-authenticationKeyPath "$tmp_file" -authenticationKeyID "$key_id" -authenticationKeyIssuerID "$issuer_id")
    IOS_AUTH_ARGS_SET=true
    return
  fi
}

require_ios_upload_auth() {
  if [ "$IOS_AUTH_ARGS_SET" = true ]; then
    return
  fi

  if [ "$IOS_ALLOW_XCODE_ACCOUNT_UPLOAD" = true ]; then
    return
  fi

  fail "Missing App Store Connect API credentials for iOS upload. Set APP_STORE_CONNECT_API_KEY_PATH and APP_STORE_CONNECT_ISSUER_ID. APP_STORE_CONNECT_KEY_ID is inferred from AuthKey_<KEY_ID>.p8 when possible."
}

write_ios_export_options() {
  local export_options_path="$1"
  local destination="${2:-export}"

  cat >"$export_options_path" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>compileBitcode</key>
  <false/>
  <key>destination</key>
  <string>${destination}</string>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
  <key>method</key>
  <string>app-store-connect</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>signingCertificate</key>
  <string>${IOS_CODE_SIGN_IDENTITY}</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string>${IOS_TEAM_ID}</string>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
PLIST
}

build_ios() {
  require_cmd xcodebuild
  resolve_xcodebuild_auth_args
  require_ios_upload_auth

  log "Building iOS archive"
  rm -rf "$IOS_ARCHIVE_PATH" "$IOS_EXPORT_DIR" "$IOS_DERIVED_DATA_PATH"
  mkdir -p "$(dirname "$IOS_ARCHIVE_PATH")" "$IOS_EXPORT_DIR"

  set_tmp_envfile
  set +e

  (
    cd "$ROOT_DIR"

    ENVFILE="$APP_ENV_FILE" xcodebuild \
      -workspace "$IOS_WORKSPACE" \
      -scheme "$IOS_SCHEME" \
      -configuration "$IOS_CONFIGURATION" \
      -sdk iphoneos \
      -destination "generic/platform=iOS" \
      -archivePath "$IOS_ARCHIVE_PATH" \
      -derivedDataPath "$IOS_DERIVED_DATA_PATH" \
      -allowProvisioningUpdates \
      DEVELOPMENT_TEAM="$IOS_TEAM_ID" \
      CODE_SIGN_STYLE=Automatic \
      ${IOS_AUTH_ARGS[@]+"${IOS_AUTH_ARGS[@]}"} \
      archive
  )

  local archive_status=$?
  set -e
  restore_tmp_envfile

  [ "$archive_status" -eq 0 ] || exit "$archive_status"
}

upload_ios() {
  require_cmd xcodebuild
  [ -d "$IOS_ARCHIVE_PATH" ] || fail "No iOS archive found at $IOS_ARCHIVE_PATH"

  resolve_xcodebuild_auth_args
  require_ios_upload_auth

  rm -rf "$IOS_EXPORT_DIR"
  mkdir -p "$IOS_EXPORT_DIR"

  local export_options_path="$IOS_EXPORT_DIR/ExportOptions.plist"
  write_ios_export_options "$export_options_path" upload

  log "Uploading iOS archive to TestFlight"
  xcodebuild \
    -exportArchive \
    -archivePath "$IOS_ARCHIVE_PATH" \
    -exportPath "$IOS_EXPORT_DIR" \
    -exportOptionsPlist "$export_options_path" \
    -allowProvisioningUpdates \
    ${IOS_AUTH_ARGS[@]+"${IOS_AUTH_ARGS[@]}"}
}

build_android() {
  log "Building signed Android App Bundle"
  (
    cd "$ROOT_DIR/android"
    ENVFILE="$APP_ENV_FILE" ./gradlew :app:bundleRelease
  )

  [ -f "$ANDROID_AAB_PATH" ] || fail "No AAB found at $ANDROID_AAB_PATH"
}

upload_android() {
  local json_key="${GOOGLE_PLAY_JSON_KEY:-${SUPPLY_JSON_KEY:-}}"
  [ -n "$json_key" ] || fail "Missing GOOGLE_PLAY_JSON_KEY for Google Play upload."
  [ -f "$json_key" ] || fail "GOOGLE_PLAY_JSON_KEY does not exist: $json_key"
  [ -f "$ANDROID_AAB_PATH" ] || fail "No AAB found at $ANDROID_AAB_PATH"

  log "Uploading Android build to Google Play track: $PLAY_STORE_TRACK"
  run_fastlane supply \
    --json_key "$json_key" \
    --package_name "$PLAY_STORE_PACKAGE_NAME" \
    --aab "$ANDROID_AAB_PATH" \
    --track "$PLAY_STORE_TRACK" \
    --release_status "$PLAY_STORE_RELEASE_STATUS" \
    --skip_upload_metadata true \
    --skip_upload_changelogs true \
    --skip_upload_images true \
    --skip_upload_screenshots true
}

while [ $# -gt 0 ]; do
  case "$1" in
    --ios-only)
      RUN_IOS=true
      RUN_ANDROID=false
      ;;
    --android-only)
      RUN_IOS=false
      RUN_ANDROID=true
      ;;
    --skip-build)
      SKIP_BUILD=true
      ;;
    --no-bump-build)
      BUMP_BUILD=false
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
  shift
done

[ -f "$ROOT_DIR/$APP_ENV_FILE" ] || fail "Environment file not found: $APP_ENV_FILE"

if [ "$RUN_IOS" = true ]; then
  require_cmd xcodebuild
  resolve_xcodebuild_auth_args
  require_ios_upload_auth
fi

if [ "$SKIP_BUILD" = false ] && [ "$BUMP_BUILD" = true ]; then
  bump_build_numbers
fi

if [ "$RUN_IOS" = true ]; then
  [ "$SKIP_BUILD" = true ] || build_ios
  upload_ios
fi

if [ "$RUN_ANDROID" = true ]; then
  ensure_fastlane
  [ "$SKIP_BUILD" = true ] || build_android
  upload_android
fi

log "Release upload complete"
