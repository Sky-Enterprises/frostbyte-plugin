---
name: notes
description: Use when the user asks for a session handoff, asks to keep context such as architecture in Frostbyte or to read a project's agent notes, wraps up a session with work unfinished, or keeps a build plan or handoff in a local file.
---

# Frostbyte agent notes

Agent notes are what you write down for the user and for the next session. The team reads them in the app, where they're read-only.

- **Handoff:** `session_end` writes where this session stopped: what's half done and where, what to try next, what to watch out for. Open with a sentence or two on where things stand, then give each part its own paragraph led by a bold label, `**Done:**`, `**Next:**` and `**Watch out:**`, so the app shows them as separate parts. Leave out a part with nothing to say. Write it for a session that starts with none of your context, in up to 4,000 characters, and leave out what `task_complete` or `task_log_decision` already recorded. Write one when you stop with work unfinished or with context the tasks don't hold, and whenever the user asks you to wrap up. A project keeps its last three, so yours doesn't erase a parallel session's.
- **Reading it back:** `dashboard_snapshot`, `whats_next` and `get_project` return the newest handoff with its date and name the earlier ones; read an earlier one with `get_note`. Trust the tasks over a handoff for task state.
- **Notes:** a project keeps up to five, for lasting context that isn't work to do, such as architecture or an approach the team settled on. Call `list_notes` first, so you add to a note rather than make a near-duplicate. `write_note` with a `title` writes that note (capitals don't matter) or creates it. `content` replaces the whole note unless `append: true`, so read it with `get_note` first and keep what others wrote. Write a note only when the user asks or agrees.
- **Not the plan:** work to do belongs in tasks and releases (`frostbyte:planning`), a choice on one task in `task_log_decision`, and what you're building and why in the product brief. If the user keeps a plan in a file such as `buildplan.md`, offer once to move it into releases and tasks, and keep any part that isn't work to do, such as architecture, as a note. Leave the local file in place unless they ask.

You can't delete a note or a handoff; people do that in the app.
