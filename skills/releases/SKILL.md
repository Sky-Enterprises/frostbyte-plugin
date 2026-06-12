---
name: releases
description: When the user asks about the current release, wants to cut a new release, mark a release complete, or attach tasks to a release on Frostbyte, call the matching release MCP tool. Never create or complete a release without confirming with the user — releases are high-signal events on the Dashboard.
---

# Frostbyte release lifecycle

Releases group shipped work. They show on the Dashboard timeline and are the primary unit of "what went out" for the project. Treat release transitions as intentional, not automatic.

## When to call which tool

- **Reading the active release** → `frostbyte:release_read_active`. Use for "what's in the current release?", "what's left before we ship?", or any summary question about the in-progress release. Prefer this over `list_releases` when the user just wants current state.
- **Listing all releases** → `frostbyte:list_releases`. Use when the user asks about release history or wants to pick a specific release to inspect.
- **Getting a single release** → `frostbyte:get_release`. Pass `projectId` and `releaseId`. Use before any write operation to confirm current status.
- **Creating a release** → `frostbyte:create_release`. Confirm the name with the user before calling (e.g. "v1.2", "May sprint") — or omit `name` to apply the project's release-naming pattern. Optionally pass a `targetDate` (ISO-8601).
- **Marking a release shipped** → `frostbyte:update_release` with `status: "completed"`. Update the release `description` with a 1-3 sentence summary (what shipped, what was cut, any notable call-outs) — it appears on the Dashboard timeline permanently; write it for a human reading it in six months. Completing a release also sends notify-on-ship emails to feedback submitters whose linked tasks shipped in it, so never set `completed` without explicit user confirmation.

## Rules

- **Confirm before creating or completing.** Both actions are visible to every project member immediately and cannot be undone from the agent. Ask the user to confirm the name / summary before calling the write tool.
- **Don't auto-assign tasks to releases.** If a user says "add this task to the release", use `frostbyte:update_task` to set the `releaseId` — but confirm which release first via `release_read_active` or `list_releases`.
- **One active release at a time.** `release_read_active` returns the in-progress release. If the user asks to create a new one while one is active, surface the conflict and ask whether they meant to complete the current one first.

## What a good release summary looks like

Bad: "Release completed."
Bad: "All tasks done."
Good: "Shipped the AI Agents multi-token table, SessionEnd hook backfill, and the Settings billing page redesign. Cut the Codex deep-link feature to v1.3 — needs another sprint."
