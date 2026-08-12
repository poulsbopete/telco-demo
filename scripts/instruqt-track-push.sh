#!/usr/bin/env bash
# Push the Telco Metrics + ML Instruqt track to play.instruqt.com
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/tracks/telco-metrics-ml-serverless"
exec instruqt track push --force "$@"
