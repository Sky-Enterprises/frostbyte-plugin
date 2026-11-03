---
name: areas
description: Use when the user asks about Frostbyte areas (epics or sections that group a project's tasks), such as listing, creating, renaming, recolouring or deleting them, or putting tasks in one.
---

# Frostbyte areas

Areas group a project's tasks, like epics. They're optional, so don't suggest them in a project that doesn't use them unless the user asks for structure.

- **List:** `list_areas`. It's also the only way to check an area before changing it. Area names are links; reuse them as given.
- **Create:** `create_area`, with a short name (a word or two) the user agreed and an optional 1–2 sentence description. Prefer an existing area, and create one only when nothing fits.
- **Update:** `update_area` with only the changed fields. Rename an area only when asked; others rely on the name.
- **Colour:** leave `color` out when creating, and Frostbyte picks the palette colour other areas use least. Set one only when the user asks: use the palette colour from the tool's description closest to what they want, avoid one another area already shows in `list_areas`, and pass their exact hex only if they give one. To make every area distinct, recolour the clashing ones from palette colours not in use.
- **Put a task in an area:** `update_task` with `areaId`, offering the existing areas to pick from; `areaId: null` takes it out.
- **Delete:** `delete_area`, only under "Deleting" in `frostbyte:tasks`. Its tasks stay, without an area.

Grouping that only matters in the conversation needs no write.
