#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${ROOT_DIR}/.run"
PID_FILE="${RUN_DIR}/backend.pid"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "Backend not running (pid file not found)."
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if ! kill -0 "${PID}" 2>/dev/null; then
  echo "Backend not running (stale pid ${PID})."
  rm -f "${PID_FILE}"
  exit 0
fi

kill "${PID}" 2>/dev/null || true

for _ in {1..10}; do
  if ! kill -0 "${PID}" 2>/dev/null; then
    rm -f "${PID_FILE}"
    echo "Backend stopped."
    exit 0
  fi
  sleep 1
done

kill -9 "${PID}" 2>/dev/null || true
rm -f "${PID_FILE}"
echo "Backend force-stopped."
