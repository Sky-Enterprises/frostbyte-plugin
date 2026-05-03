---
name: frostbyte-areas
description: When the user asks about Frostbyte areas (epics, sections, or top-level groupings of tasks in a project), call the matching area MCP tool to list, read, create, or update areas. Areas are optional — not every project uses them — so read before writing and confirm with the user before creating.
---

# Frostbyte areas

Areas are named groupings of tasks within a project — roughly equivalent to epics or sections. They show on the Board and are used to filter the task list. Not every project uses areas; check before suggesting them.

## When to call which tool

- **Listing areas** → `frostbyte:area_list`. Pass `projectId`. Use when the user asks "what areas does this project have?" or wants to assign a task to an area.
- **Reading a single area** → `frostbyte:area_read`. Pass `areaId`. Use before updating to confirm current state.
- **Creating an area** → `frostbyte:area_create`. Requires `projectId` and `name`. Confirm the name with the user. Areas are visible to everyone on the project.
- **Updating an area** → `frostbyte:area_update`. Pass `areaId` and only the fields changing. Never rename an area the user didn't ask to rename — names are shared references that other team members rely on.

## Assigning tasks to areas

Use `frostbyte:update_task` with `areaId` set. Call `area_list` first to give the user a menu of existing areas so they can pick, rather than creating a new one by default.

## When NOT to call area tools

- The user is asking about tasks — use task tools.
- The project has no areas and the user isn't asking to create structure — don't suggest areas unprompted.
- The user wants to group tasks for their own reference in conversation only — no need to write to Frostbyte.
