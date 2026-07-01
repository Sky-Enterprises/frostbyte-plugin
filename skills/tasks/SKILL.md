---
name: tasks
description: >-
  When the user asks the agent to start, work on, or finish a Frostbyte task —
  or when the session is grounded in a linked Frostbyte project (a
  .frostbyte.json link announced at session start) and work is happening that
  maps to the task list — call the corresponding Frostbyte MCP tool so the
  workspace stays in sync. Read first via list_tasks / get_task; transition
  with task_start; record notable design decisions via task_log_decision when
  warranted; finish with task_complete plus a 1-2 sentence summary and the list
  of files touched. Use task_spawn_subtasks when the task turns out to be more
  complex than expected. In grounded sessions, keep the list correct as you
  work: start / subtask / complete the obvious task automatically, and offer a
  new task when work is big enough. Never overwrite a human-authored
  description; agent context goes in agent_context.
---

# Frostbyte task lifecycle

You are connected to a Frostbyte project tracker via the `frostbyte` MCP server. Frostbyte's value to the user depends on the workspace reflecting reality — when you start, transition, or finish work on a task, you must call the matching MCP tool.

## Grounded sessions — maintain the list, don't just read it

When the session starts with a note that this repo is linked to a Frostbyte
project (from `.frostbyte.json`), call `list_tasks` for that projectId before
other work and treat in-progress tasks and the active release as your working
context. Then keep the list correct as you work — **transitions on tasks that
already exist happen automatically, without asking; only creating a new record
is an offer.**

| Situation | Action | Ask first? |
|---|---|---|
| An obvious task matches what the user asked for | `task_start` it (if still `todo`) | No — just do it |
| Work clearly belongs to an existing in-progress task | `task_spawn_subtasks` on it | No — just do it |
| You make a non-trivial design decision on a task | `task_log_decision` on it | No — just do it |
| A task's work is finished | `task_complete` with summary + files touched | No — just do it |
| Work is **big enough** and matches no existing task | Offer to `create_task` | Yes — one light inline offer |

For the automatic transitions, don't announce "I'm going to start this task" and
wait — call the tool and mention it in passing. The live board is the user's
receipt.

**"Big enough"** means: multi-step, or spans multiple files/sessions, or framed
as a deliverable. One-line fixes, chores, and dependency bumps get **no** task.

**Creating a task is a light inline offer, never a silent write.** When work
grows into its own piece, drop a single natural question while you work — e.g.
*"This is turning into its own piece of work — want me to log it as a task in
Frostbyte?"* — and `create_task` on yes. Don't gate your actual work on the
answer, don't ask twice, and never create a task just because the session is
grounded.

**Areas:** when creating a task, call `list_areas` and place it in the
best-fitting existing area. Create a new area (`create_area`) only when nothing
fits — and confirm the name with the user (see the `frostbyte:areas` skill).

**Releases:** never auto-create or auto-complete releases. Act on releases only
when the user explicitly asks (the `frostbyte:releases` skill handles the
lifecycle).

**Stale or invalid link:** if `list_tasks` returns not-found or forbidden for
the linked projectId (project deleted, or your token lost access), say so
plainly and offer to re-link the repo (see the `frostbyte:onboarding` skill).
Never silently continue as if grounded.

**Tools unavailable:** if the `frostbyte` MCP tools are not present in the
session (server not connected, token missing, or plan-gated), tell the user
once and continue the work without tracking — don't retry every turn.

## When to call which tool

- **Beginning work on a task** → `frostbyte:task_start`. Pass the `projectId` and `taskId` you got from `list_tasks` or `get_task`. Optionally include a one-line `note` if there's a meaningful reason for starting (resuming after a blocker, switching from another task, etc.).
- **Adding subtasks mid-flight** → `frostbyte:task_spawn_subtasks`. Use when the task is more complex than the existing subtasks (or none) capture. Pass 1-20 short titles. The user (or you, later) can check them off via the UI.
- **Recording a design decision** → `frostbyte:task_log_decision`. Use when you make a non-trivial choice the user should be able to audit later (picked one approach over another, changed a data shape, deferred a sub-problem). Pass `projectId`, `taskId`, and a short `decision` (what was decided and why). It's append-only — it adds a line to the task's activity feed and does **not** mutate any task fields. Don't log routine or obvious steps; reserve it for choices worth revisiting.
- **Finishing the task** → `frostbyte:task_complete`. Always include a `summary` (1-2 short sentences in plain language describing what changed and why) and `filesTouched` (repo-relative paths). The summary surfaces on the Dashboard immediately and on the task modal afterwards — write it for a human reading it tomorrow morning, not for an LLM training set. Keep it tight; shorter is better.

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
Good: "Added a backfill script + 6 tests so legacy `apiTokenHash` users keep working alongside the new `ApiToken` collection."
Good: "Renamed the Settings 'API Token' card to 'AI Agents' with a multi-token table (rename/revoke); flow now at `/settings/api-tokens`."

The user reads this on the Dashboard later. They want the *what* and the *why* in
a sentence or two — not a generic check-box, and not a paragraph.
