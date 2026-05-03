# Changelog

All notable changes to this project are documented here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
