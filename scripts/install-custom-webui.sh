#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: sudo bash install-custom-webui.sh <kakkee-webui.tar.gz> [webUI-directory]" >&2
  exit 1
}

archive="${1:-}"
target="${2:-/DATA/AppData/suwayomi-server/files/webUI}"

if [[ -z "$archive" || ! -f "$archive" ]]; then
  usage
fi

if [[ "$(basename "$target")" != "webUI" ]]; then
  echo "Refusing to install into '$target': target must end in /webUI" >&2
  exit 1
fi

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

tar -xzf "$archive" -C "$tmp"

if [[ ! -f "$tmp/index.html" || ! -d "$tmp/assets" || ! -d "$tmp/icons" ]]; then
  echo "Archive is not a valid Kakkee package (index.html/assets/icons missing)." >&2
  exit 1
fi

if ! find "$tmp/assets" -maxdepth 1 -type f -name 'index-*.js' | grep -q .; then
  echo "Archive has no hashed JavaScript in assets/." >&2
  exit 1
fi

mkdir -p "$target"

backup="${target}.bak-$(date +%Y%m%d-%H%M%S)"
if [[ -d "$target" ]]; then
  cp -a "$target" "$backup"
  echo "Backup: $backup"
fi

find "$target" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a "$tmp/." "$target/"

owner="${SUWAYOMI_UID:-1000}:${SUWAYOMI_GID:-1000}"
chown -R "$owner" "$target" 2>/dev/null || true

echo
echo "Installed to $target"
echo "Files:"
find "$target" -maxdepth 1 -mindepth 1 -printf '  %f\n' | sort
echo
echo "Restart Suwayomi, then open the server address."
echo "If /assets/* still returns text/html, purge the OpenResty cache or restart the gateway."
