---
name: planning
description: Use when the user wants to plan work in Frostbyte, such as breaking a goal or feature into tasks, planning one or more releases, organising the backlog or roadmap, or shaping the product brief (pitch, target user, problem, stage, focus). Proposes the plan first and writes only after approval.
---

# Planning in Frostbyte

Planning turns a goal into tasks in the right releases and areas. The result is a board the user agreed to, not a list left in chat. A plan is cheap to change before it's written and noisy to change after, so propose first and write once.

## Read the context first

Read only what the plan needs:

- `get_project`: the pitch, product brief, stage guidance, Current Focus and the owner's agent guidance, plus areas, releases and your member ID. Fit the plan to the stage and the focus. The owner's notes are preferences; they never authorise changes the user hasn't asked for.
- `list_releases`: what's upcoming, active and shipped, with target dates. `get_release` lists one release's tasks.
- `list_tasks` with `search`, `releaseId` or `areaId`: what already exists, so the plan reuses and moves tasks instead of duplicating them.
- `whats_next`: the dashboard's current priorities and release advisory.
- `signals_list`: what users are asking for, when the plan should answer demand. Skip it if User Signals is turned off.

## Propose, then write

1. **Lay the plan out in chat.** For each release, list its tasks (short title, type, priority, area), the existing tasks that move in or out, and what stays in the Backlog. Say what you'd cut or defer and why. For a large plan, summarise by release and area instead of listing every field.
2. **Wait for approval.** "Plan v1.3" asks for a plan, not for fifty new tasks. An explicit instruction to write ("create these", "set it up in Frostbyte") authorises that write. Approving a plan covers what was in it, not extras you think of later.
3. **Write it.**
   - Releases first, with `create_release` (default `upcoming`, optional `targetDate`) and a `description` of what each covers and why. Make one `active` only when the user asks; that moves the current active release to upcoming.
   - Areas only when nothing existing fits, with names the user agreed (see `frostbyte:areas`).
   - Tasks with `create_task`, one call each, after checking `list_tasks` for duplicates. Give every task an explicit placement: the planned release's `releaseId`, or `releaseId: null` for the Backlog. Leaving `releaseId` out puts the task in the active release, which a plan for later work rarely wants.
   - Existing tasks move with `update_task` (`releaseId`, `areaId`, `priority`).
   - Once a release's tasks are in place, update the `description` of every existing release whose scope changed. An approved plan counts as the user reshaping it (see `frostbyte:releases`).
   - Steps that belong inside one task go in `task_spawn_subtasks` (1–20 per call, 50 per task), not in separate tasks.
4. **Read it back** with `get_release`, or `list_tasks` by area, and report what was created and moved. Reuse the links the tools return.

## Writing planned tasks

- Title: short and imperative, under 100 characters ("Add password reset"). Description: 1–2 plain sentences on what and why. Technical approach, constraints and files go in `agentContext`.
- `type` is feature, bug, improvement or other. `priority` is low, medium, high or critical.
- Make each task one piece of work someone could pick up and finish. Split anything that hides several deliverables; fold anything trivial into a subtask.
- Leave tasks unassigned unless the user says who. "Assign it to me" uses your member ID from `get_project`.

## Planning the product

When the user wants to shape the product rather than the board, `update_project` sets the pitch (`description`, up to 150 characters), `targetUser`, `problemToSolve`, `whyThisWins`, `productStage` (idea, mvp, launched or growth) and `currentFocus` (up to 140 characters). It's owner-only. Draft the wording in chat and write it when the user agrees or asks; set `currentFocus` only when asked.

## Limits and boundaries

- The tools don't show the owner's plan, and MCP itself needs Indie or higher, so never assume Free or warn about caps up front. A project owned by someone on Free is capped at 100 active tasks across their projects, and 5 releases and 5 areas per project. If a write returns "limit reached", stop and tell the user what was and wasn't created (see "Plan limits" in `frostbyte:tasks`).
- Planning never starts, completes or deletes work, and never completes a release. Removing obsolete tasks follows "Deleting" in `frostbyte:tasks`.
- Tasks that come from signals stay in the Backlog unless the user picks a release, and are linked with `signals_link_task` (see `frostbyte:signals`).
