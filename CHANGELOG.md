# Changelog

All notable changes to this project are documented here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.4.2] — 2026-06-12

### Added
- Re-exposed `task_log_decision` in the `frostbyte:tasks` skill and README. The tool is fully implemented on the server (it appends an append-only decision record to a task's activity feed, surfaced in the task modal and the project activity timeline), so 0.4.1's "planned but not yet integrated" note was inaccurate — agents now know to call it for non-trivial design decisions worth auditing later.

## [0.4.1] — 2026-06-12

### Fixed
- **MCP server never connected on Claude Code.** `.mcp.json` lived in `.claude-plugin/`, but Claude Code resolves the manifest's `mcpServers` path relative to the plugin root (and auto-discovers `.mcp.json` there) — so the server config was never found and no `frostbyte` tools loaded. Moved `.mcp.json` to the plugin root. The Codex manifest now points explicitly at `./.codex-plugin/.mcp.json` so it doesn't pick up the Claude-format file at the root.
- Grounding hook no longer walks above the repo boundary: the `.frostbyte.json` search stops at the first directory containing `.git`, so a stray link file in `$HOME` can't ground unrelated repos.
- Grounding hook parses `.frostbyte.json` with `jq` when available; the no-`jq` fallback now takes the *first* `projectId` occurrence instead of the last.
- Skill frontmatter `name` fields now match their directory names (`tasks`, `releases`, `areas`, `onboarding` — surfaced as `/frostbyte:<name>`); cross-references between skills updated to the real invocation names.
- README: corrected repository layout, local-testing instructions for Codex (no `endpoint` config — edit `.codex-plugin/.mcp.json` directly), token re-entry steps, and the "agent never calls Frostbyte tools" troubleshooting row (check `/mcp` first).

### Changed
- Grounding instruction softened: agents fetch the task list when beginning implementation work rather than "before other work", and are told to degrade gracefully (mention it once, keep working) when the `frostbyte` MCP tools are unavailable. The `frostbyte:tasks` skill carries the same tools-unavailable rule.
- Removed `task_log_decision` from skill and README tool lists — the tool is planned but not yet integrated on the server.
- `endpoint` config description now warns against a trailing slash (the MCP URL is built as `${endpoint}/mcp`).

## [0.4.0] — 2026-06-12

### Added
- `.frostbyte.json` convention — a committed repo-root file (`{ "projectId": "..." }`) linking a repo to a Frostbyte project. Optional `"grounding": false` pauses grounding while keeping the link.
- Session grounding hook (`hooks/frostbyte-grounding.sh`) — on SessionStart, walks up from the working directory to the nearest `.frostbyte.json` and tells the agent which project it is in. Fail-safe: any error exits silently. Bundled for Claude Code via `hooks/hooks.json`; Codex users register the same script via `~/.codex/hooks.json` (see README).
- `frostbyte-onboarding` skill — when a repo is unlinked, offers to create a new Frostbyte project (fresh codebase) or link an existing one (established codebase), then writes `.frostbyte.json`. Always asks first.
- `frostbyte-tasks` skill: auto-tracking policy for grounded sessions — start the obvious task, propose a task when work is big enough, subtask work that fits an in-progress task, complete on finish. Areas: best-fit existing, create only when nothing fits. Releases: never auto-created. Stale/invalid links are surfaced, never silently ignored.

### Fixed
- `frostbyte-areas` and `frostbyte-releases` skills referenced MCP tool names that don't exist on the server (`area_list`, `area_create`, `area_read`, `area_update`, `release_list`, `release_read`, `release_create`, `release_complete`, `task_update`). Corrected to the real names (`list_areas`, `create_area`, `update_area`, `list_releases`, `get_release`, `create_release`, `update_release`, `update_task`).

## [0.3.1] — 2026-05-05

### Added
- `frostbyte-tasks` skill: instruct agents to include `FB-<task-number>` in commit messages and PR titles. Frostbyte's release audit uses this to auto-link commits to tasks on the Dashboard with no extra MCP call.

## [0.3.0] — 2026-05-04

### Removed
- `SessionEnd` hook (and `hooks/` directory). Incompatible with Claude Code 2.1.x plugin schema, and `mcp_tool` was never a supported hook type. Skills carry the policy instead — agents call `task_complete` directly. Reliability backstop revisited only if cold-session tests show it's needed.

## [0.2.0] — 2026-05-04

### Added
- `frostbyte-releases` skill — release lifecycle: create, activate, complete, and read active release
- `frostbyte-areas` skill — area CRUD for grouping and re-scoping tasks within a project
- `CHANGELOG.md` and `.gitignore`
- README "Repository layout" and "Contributing" sections

### Changed
- README "What the plugin gives you" expanded to enumerate every skill and the `task_log_decision` tool

## [0.1.0] — 2026-05-03

### Added
- Claude Code plugin manifest (`.claude-plugin/plugin.json`) with OS-keychain-backed `api_token` prompt
- Codex plugin manifest (`.codex-plugin/plugin.json`) reading token from `FROSTBYTE_API_TOKEN` env var
- Shared MCP server config pointing to `https://getfrostbyte.dev/mcp`
- `frostbyte-tasks` skill — task lifecycle: start, complete, spawn subtasks, log decisions
- `SessionEnd` hook — calls `frostbyte:session_end` when the AI client session closes so the Dashboard activity card stays populated even if the agent skips `task_complete`
- Claude Code marketplace entry (`.claude-plugin/marketplace.json`)
- Codex marketplace entry (`.agents/plugins/marketplace.json`)
