---
name: frostbyte-planning
description: When the user asks "what should I work on next?", "break this task down", or similar planning questions on a Frostbyte project, call the matching planning MCP tool. tasks_suggest_next ranks open tasks by urgency with rationale; tasks_suggest_breakdown proposes subtasks for a single task. Treat the output as advisory — never auto-write the suggestions back; surface them and let the user pick.
---

# Frostbyte planning

Frostbyte exposes two server-side AI planning tools. Frostbyte pays for these calls; usage is logged. Use them when the user asks for guidance, not as a default.

## Tools

- **`frostbyte:tasks_suggest_next`** — given a project, returns 3-5 ranked open tasks with rationales. Use when the user asks "what should I do next?", "where should I focus?", or similar. The tool is cold-start aware: on projects with fewer than 5 open tasks it returns a friendly fallback. Don't second-guess that fallback by calling it repeatedly.
- **`frostbyte:tasks_suggest_breakdown`** — given a single task, proposes a 4-7 step subtask breakdown. Use when the user describes a task that's clearly larger than one session of work. The output is suggestions only — let the user confirm before calling `task_spawn_subtasks` to write any of them back.

## Discipline

- **Advisory only.** These tools never write to the workspace. Show the user the output, ask which (if any) they want to act on, then use `task_spawn_subtasks` or `update_task` to commit the user's choice.
- **Don't loop.** If a planning call returns thin output, ask the user what's missing rather than retrying with slightly different prompts. Each call costs Frostbyte real money and a per-minute burst limit applies.
- **Respect rate limits.** If a tool returns `isError: true` with a rate-limit message, wait — don't retry immediately.

## When NOT to call planning tools

- The user already knows what they want to do — just do it.
- You're inside a `task_start` → `task_complete` cycle. Planning belongs at the start of a session, not in the middle of executing a chosen task.
- The user asked a quick factual question ("what's the active release?") — use the read tools (`release_read_active`, `dashboard_snapshot`) instead.
