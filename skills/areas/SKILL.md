---
name: areas
description: When the user asks about Frostbyte areas (epics, sections, or top-level groupings of tasks in a project), call the matching area MCP tool to list, read, create, update, or (after the user confirms) delete areas. Areas are optional — not every project uses them — so read before writing and confirm with the user before creating.
---

# Frostbyte areas

Areas are named groupings of tasks within a project — roughly equivalent to epics or sections. They show on the Board and are used to filter the task list. Not every project uses areas; check before suggesting them.

## When to call which tool

- **Listing areas** → `frostbyte:list_areas`. Pass `projectId`. Use when the user asks "what areas does this project have?" or wants to assign a task to an area. Also use it to confirm an area's current state before updating — there is no single-area read tool.
- **Creating an area** → `frostbyte:create_area`. Requires `projectId` and `name`. Confirm the name with the user. Keep the name short (a word or two) and the description to 1-2 short sentences. Areas are visible to everyone on the project.
- **Updating an area** → `frostbyte:update_area`. Pass `areaId` and only the fields changing. Never rename an area the user didn't ask to rename — names are shared references that other team members rely on.
- **Deleting an area** → `frostbyte:delete_area`, only after following "Deleting" in the `frostbyte:tasks` skill: never on your own initiative, tell the user which area and how many tasks it holds (`list_tasks` with `areaId`), and wait for a yes in chat before passing `confirm: true`. The tasks are kept, just without an area.

Area names in `list_areas` results are links into Frostbyte. Reuse them as given when you mention an area to the user (see "Linking tasks, releases and areas" in `frostbyte:tasks`).

## Assigning tasks to areas

Use `frostbyte:update_task` with `areaId` set. Call `list_areas` first to give the user a menu of existing areas so they can pick, rather than creating a new one by default. To take a task out of its area, pass `areaId: null`.

## When NOT to call area tools

- The user is asking about tasks — use task tools.
- The project has no areas and the user isn't asking to create structure — don't suggest areas unprompted.
- The user wants to group tasks for their own reference in conversation only — no need to write to Frostbyte.
