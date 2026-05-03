# Changelog

All notable changes to this project are documented here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] — 2026-05-03

### Added
- Claude Code plugin manifest (`.claude-plugin/plugin.json`) with OS-keychain-backed `api_token` prompt
- Codex plugin manifest (`.codex-plugin/plugin.json`) reading token from `FROSTBYTE_API_TOKEN` env var
- Shared MCP server config pointing to `https://getfrostbyte.dev/mcp`
- `frostbyte-tasks` skill — task lifecycle: start, complete, spawn subtasks, log decisions
- `frostbyte-releases` skill — release lifecycle: create, activate, complete, and read active release
- `frostbyte-areas` skill — area CRUD for grouping and re-scoping tasks within a project
- `SessionEnd` hook — calls `frostbyte:session_end` when the AI client session closes so the Dashboard activity card stays populated even if the agent skips `task_complete`
- Claude Code marketplace entry (`.claude-plugin/marketplace.json`)
- Codex marketplace entry (`.agents/plugins/marketplace.json`)
