#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${ROOT_DIR}/.run"
BACKEND_DIR="${ROOT_DIR}/backend"
PID_FILE="${RUN_DIR}/backend.pid"
LOG_FILE="${RUN_DIR}/backend.log"

export MAVEN_USER_HOME="${BACKEND_DIR}/.m2"

mkdir -p "${RUN_DIR}" "${MAVEN_USER_HOME}"

if [[ -f "${PID_FILE}" ]]; then
  if kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
    echo "Backend already running (pid $(cat "${PID_FILE}"))."
    exit 0
  else
    rm -f "${PID_FILE}"
  fi
fi

nohup mvn spring-boot:run >"${LOG_FILE}" 2>&1 &
echo $! > "${PID_FILE}"

echo "Backend started (pid $(cat "${PID_FILE}"))."
echo "Logs: ${LOG_FILE}"
