#!/bin/sh
# Frostbyte grounding hook (SessionStart) — shared by Claude Code and Codex.
# Walks up from the session directory to the nearest .frostbyte.json and, if the
# repo is linked, injects an instruction telling the agent which Frostbyte
# project it is in. The authenticated fetch happens later through the MCP
# server — this script never touches the network and never sees any token.
#
# Fail-safe by design: any error, missing file, or malformed JSON -> exit 0
# with no output. A broken hook must never block the session.

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -d "$dir" ] || exit 0

# Walk up to the nearest .frostbyte.json, but stop at the repo boundary (the
# first directory containing .git — a file in worktrees, hence -e). Unlike
# git's own walk, going past the repo root would let a stray .frostbyte.json
# in $HOME ground every repo beneath it to the wrong project.
file=""
while :; do
  if [ -f "$dir/.frostbyte.json" ]; then
    file="$dir/.frostbyte.json"
    break
  fi
  [ -e "$dir/.git" ] && break
  parent=$(dirname "$dir") || exit 0
  [ "$parent" = "$dir" ] && break
  dir="$parent"
done
[ -n "$file" ] || exit 0

# Parse with jq when available; fall back to a first-match grep/sed pipeline.
# Soft opt-out: { "projectId": "...", "grounding": false } keeps the link but
# pauses injection.
if command -v jq >/dev/null 2>&1; then
  project_id=$(jq -r 'if .grounding == false then "" else (.projectId // "") end' "$file" 2>/dev/null) || exit 0
else
  content=$(tr -d '\n\r' < "$file" 2>/dev/null) || exit 0
  printf '%s' "$content" | grep -Eq '"grounding"[[:space:]]*:[[:space:]]*false' && exit 0
  project_id=$(printf '%s' "$content" \
    | grep -oE '"projectId"[[:space:]]*:[[:space:]]*"[^"]*"' 2>/dev/null \
    | head -n 1 \
    | sed 's/.*"\([^"]*\)"[[:space:]]*$/\1/')
fi

# Charset check doubles as a JSON-injection guard for the printf below.
printf '%s' "$project_id" | grep -Eq '^[A-Za-z0-9_-]{1,64}$' || exit 0

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This repo is linked to Frostbyte project %s (via .frostbyte.json). When you begin implementation work (not for quick one-off questions), call the frostbyte list_tasks tool for that projectId and treat in-progress tasks and the active release as your working context; keep the task list correct as you work (see the frostbyte:tasks skill). If the frostbyte MCP tools are unavailable in this session, mention that once and continue without tracking."}}\n' "$project_id"
exit 0
