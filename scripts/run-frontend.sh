#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${ROOT_DIR}/.run"
FRONTEND_DIR="${ROOT_DIR}/frontend"
PID_FILE="${RUN_DIR}/frontend.pid"
LOG_FILE="${RUN_DIR}/frontend.log"

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"

export NPM_CONFIG_CACHE="${FRONTEND_DIR}/.npm-cache"
export NEXT_TELEMETRY_DISABLED=1

mkdir -p "${RUN_DIR}" "${NPM_CONFIG_CACHE}"

if [[ -f "${PID_FILE}" ]]; then
  if kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
    echo "Frontend already running (pid $(cat "${PID_FILE}"))."
    exit 0
  else
    rm -f "${PID_FILE}"
  fi
fi

if [[ ! -d "${FRONTEND_DIR}/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "${FRONTEND_DIR}" && npm install)
fi

nohup npm run dev -- -H "${HOST}" -p "${PORT}" >"${LOG_FILE}" 2>&1 &
echo $! > "${PID_FILE}"

echo "Frontend started (pid $(cat "${PID_FILE}")) on http://${HOST}:${PORT}."
echo "Logs: ${LOG_FILE}"
