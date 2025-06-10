#!/usr/bin/env sh
set -euo pipefail

npm run preview -- --host & \
tailscale serve --bg --set-path icbg-preview 4173
