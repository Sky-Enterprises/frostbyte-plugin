#!/bin/sh
# Frostbyte grounding hook (SessionStart) — shared by Claude Code and Codex.
# Walks up from the session directory to the nearest .frostbyte.json and, if the
# repo is linked, injects an instruction telling the agent which Frostbyte
# project it is in. The authenticated fetch happens later through the MCP
# server — this script never touches the network or any token.
#
# Fail-safe by design: any error, missing file, or malformed JSON -> exit 0
# with no output. A broken hook must never block the session.

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -d "$dir" ] || exit 0

file=""
while :; do
  if [ -f "$dir/.frostbyte.json" ]; then
    file="$dir/.frostbyte.json"
    break
  fi
  parent=$(dirname "$dir") || exit 0
  [ "$parent" = "$dir" ] && break
  dir="$parent"
done
[ -n "$file" ] || exit 0

content=$(tr -d '\n\r' < "$file" 2>/dev/null) || exit 0

# Soft opt-out: { "projectId": "...", "grounding": false } keeps the link but
# pauses injection.
printf '%s' "$content" | grep -Eq '"grounding"[[:space:]]*:[[:space:]]*false' && exit 0

project_id=$(printf '%s' "$content" | sed -n 's/.*"projectId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

# Charset check doubles as a JSON-injection guard for the printf below.
printf '%s' "$project_id" | grep -Eq '^[A-Za-z0-9_-]{1,64}$' || exit 0

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This repo is linked to Frostbyte project %s (via .frostbyte.json). Before other work, call the frostbyte list_tasks tool for that projectId and treat in-progress tasks and the active release as your working context. Keep the task list correct as you work (see the frostbyte-tasks skill)."}}\n' "$project_id"
exit 0
