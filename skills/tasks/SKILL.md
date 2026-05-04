---
name: frostbyte-tasks
description: When the user asks the agent to start, work on, or finish a Frostbyte task — or when work is happening on code that maps to an open task — call the corresponding Frostbyte MCP tool so the workspace stays in sync. Read first via list_tasks / get_task; transition with task_start; record progress and decisions via task_log_decision when warranted; finish with task_complete plus a 1-3 sentence summary and the list of files touched. Use task_spawn_subtasks when the task turns out to be more complex than expected. Never overwrite a human-authored description; agent context goes in agent_context.
---

# Frostbyte task lifecycle

You are connected to a Frostbyte project tracker via the `frostbyte` MCP server. Frostbyte's value to the user depends on the workspace reflecting reality — when you start, transition, or finish work on a task, you must call the matching MCP tool.

## When to call which tool

- **Beginning work on a task** → `frostbyte:task_start`. Pass the `projectId` and `taskId` you got from `list_tasks` or `get_task`. Optionally include a one-line `note` if there's a meaningful reason for starting (resuming after a blocker, switching from another task, etc.).
- **Adding subtasks mid-flight** → `frostbyte:task_spawn_subtasks`. Use when the task is more complex than the existing subtasks (or none) capture. Pass 1-20 short titles. The user (or you, later) can check them off via the UI.
- **Finishing the task** → `frostbyte:task_complete`. Always include a `summary` (1-3 sentences in plain language describing what changed and why) and `filesTouched` (repo-relative paths). The summary surfaces on the Dashboard immediately and on the task modal afterwards — write it for a human reading it tomorrow morning, not for an LLM training set.

## Append-only rules

- Never edit the human-authored `description` of a task. If technical detail belongs in the workspace, put it in `agent_context` via `update_task`.
- Never silently move a task back to `todo` once it's `in-progress` or `done`.
- Subtasks added by you should not delete or rewrite existing checklists.

## Reading before writing

Before transitioning a task, call `frostbyte:get_task` to confirm the current `status`. `task_start` rejects if the task is not `todo`; `task_complete` rejects if it's already `done`. Don't fight the rejection — it's protecting the audit trail. If a task is already `in-progress`, just start working; if it's already `done`, ask the user whether they meant a different task.

## Picking the right project

`list_projects` returns every project the user has access to. When the user is ambiguous about which project a task belongs to, ask before calling write tools — the project membership is part of the audit trail.

## Linking commits back to tasks

When the active task has a `taskNumber` (visible as `FB-<n>` in `get_task` responses), include `FB-<task-number>` somewhere in your commit messages and PR titles for work on that task. Frostbyte uses this reference to automatically link the commit to the task on the Dashboard's release audit — no extra MCP call required, and it lets the user see which commits ship which tasks without any manual linking.

Examples:
- Commit message: `feat(auth): expire stale sessions on logout (FB-42)`
- Branch name: `fb-42-expire-stale-sessions` (also matches automatically)
- PR title: `FB-42: Expire stale sessions on logout`

If a single commit advances multiple tasks, include each (`FB-12 FB-13`). If a commit is unrelated to any open task (chore work, dependency bumps), no reference is needed.

## What a good `last_agent_summary` looks like

Bad: "Implemented task per requirements."
Bad: "Completed."
Good: "Wired the Bearer token dual-read so legacy `apiTokenHash` users keep working alongside the new `ApiToken` collection. Added a backfill script and 6 tests."
Good: "Renamed the Settings 'API Token' card to 'AI Agents' and added a multi-token table with rename/revoke. Existing token endpoints removed; new flow lives at `/settings/api-tokens`."

The user reads this on the Dashboard later. They want the *what* and the *why*, not a generic check-box.
