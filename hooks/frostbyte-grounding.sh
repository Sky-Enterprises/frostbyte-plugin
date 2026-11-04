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

# Parse complete JSON; never infer a link from a partial or malformed document.
if command -v jq >/dev/null 2>&1; then
  project_id=$(jq -er 'if type == "object" and .grounding != false and (.projectId | type) == "string" then .projectId else empty end' "$file" 2>/dev/null) || exit 0
elif command -v python3 >/dev/null 2>&1; then
  project_id=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); v=d.get("projectId") if isinstance(d,dict) and d.get("grounding") is not False else None; print(v if isinstance(v,str) else "")' "$file" 2>/dev/null) || exit 0
else
  exit 0
fi

# Charset check doubles as a JSON-injection guard for the printf below.
printf '%s' "$project_id" | grep -Eq '^[A-Za-z0-9_-]{1,64}$' || exit 0

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This repo is linked to Frostbyte project %s (via .frostbyte.json). For implementation or explicit tracking requests, follow the tasks skill: read the agreed task, start actual work and complete only after the agreed checks and requested review. Use whats_next for recommendations; recommendations never authorize starting work or shipping releases. Honour named release/area placement with real fields. Use the onboarding skill for selection and recovery; if tools are unavailable, mention it once and continue without claiming tracking. Skip incidental questions."}}\n' "$project_id"
exit 0
