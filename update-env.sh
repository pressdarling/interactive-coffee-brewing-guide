#!/usr/bin/env sh
set -euo pipefail

op signin &&
op inject -f \
-i .env.tpl \
-o .env.local
