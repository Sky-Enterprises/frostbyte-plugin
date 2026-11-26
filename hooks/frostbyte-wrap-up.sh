#!/bin/sh
# Frostbyte wrap-up hook (Stop) — Claude Code.
# Once per session, in a repo linked via .frostbyte.json, asks the agent to offer
# a Frostbyte sync when the transcript shows file edits or git commits but no
# Frostbyte write tool calls. The agent asks the user; this script never writes
# to Frostbyte, never touches the network and never sees any token.
#
# Needs jq; without it the hook does nothing and the tasks skill's wrap-up check
# still applies. Fail-safe by design: any error, missing file, or malformed JSON
# -> exit 0 with no output. A broken hook must never block the session.

input=$(cat) || exit 0

command -v jq >/dev/null 2>&1 || exit 0
fields=$(printf '%s' "$input" | jq -er 'select(type == "object" and .stop_hook_active != true and (.session_id | type) == "string" and (.transcript_path | type) == "string") | [.session_id, .transcript_path, (.cwd // "")] | join("\n")' 2>/dev/null) || exit 0
[ -n "$fields" ] || exit 0
session_id=$(printf '%s\n' "$fields" | sed -n 1p)
transcript=$(printf '%s\n' "$fields" | sed -n 2p)
cwd=$(printf '%s\n' "$fields" | sed -n 3p)

printf '%s' "$session_id" | grep -Eq '^[A-Za-z0-9_-]{1,128}$' || exit 0
[ -f "$transcript" ] || exit 0
marker="${TMPDIR:-/tmp}/frostbyte-wrap-up-$session_id"
[ -e "$marker" ] && exit 0

# Same walk as frostbyte-grounding.sh: nearest .frostbyte.json, stopping at the repo boundary.
dir="${CLAUDE_PROJECT_DIR:-${cwd:-$PWD}}"
[ -d "$dir" ] || exit 0
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

# Prints "edit" for file edits and git commits, "write" for Frostbyte write tools
# (whatever the MCP server is called, so connector and plugin installs both count).
writes='^mcp__.+__(task_complete|task_start|create_task|update_task|task_log_decision|session_end)$'
jq -er 'if type == "object" and .grounding != false and (.projectId | type) == "string" then .projectId else empty end' "$file" >/dev/null 2>&1 || exit 0
seen=$(jq -Rr --arg writes "$writes" 'fromjson? | select(.type == "assistant") | .message.content[]? | select(type == "object" and .type == "tool_use" and (.name | type) == "string")
  | if (.name | test($writes)) then "write"
    elif (.name | test("^(Edit|MultiEdit|Write|NotebookEdit)$")) or (.name == "Bash" and ((.input.command // "") | tostring | test("\\bgit\\b[^|;&]*\\bcommit\\b"))) then "edit"
    else empty end' "$transcript" 2>/dev/null) || exit 0

printf '%s\n' "$seen" | grep -qx edit || exit 0
printf '%s\n' "$seen" | grep -qx write && exit 0
: > "$marker" 2>/dev/null || exit 0

printf '%s\n' '{"decision":"block","reason":"Frostbyte wrap-up check: this session changed files or made commits, but no Frostbyte task, decision or handoff was written. Check whether the board reflects the work (the wrap-up check in the frostbyte:tasks skill). If it does, for example GitHub already moved the task, or the work is not finished or not worth tracking, just finish your reply. Otherwise ask the user once whether to update Frostbyte, saying exactly what would change: tasks to complete or create, decisions to log. Do not update Frostbyte without a yes. This check runs once per session."}'
exit 0
