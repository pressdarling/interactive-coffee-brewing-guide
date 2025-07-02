#!/usr/bin/env sh
set -euo pipefail

npm run build -- --host & \
tailscale serve --bg --set-path icbg ./dist 
