---
name: project-docs
description: Use when the user wants a build plan, session handoff, decisions log or another living doc kept in Frostbyte, asks what a project's docs say, or a session in a linked project starts or wraps up while the project keeps a handoff or plan doc.
---

# Frostbyte project docs

Docs are Markdown pages inside a Frostbyte project that the team reads in the app under **Docs**. They're for writing that keeps changing and doesn't belong on one task: a build plan, a session handoff, a decisions log.

- **List:** `list_docs` shows each doc's title, ID and last change. Call it at the start of a session in a linked project, and read a handoff or plan doc with `get_doc` before you begin.
- **Read:** `get_doc` by `docId` or `title` (capitals don't matter).
- **Write:** `write_doc` with a `title` creates the doc or replaces the one with that title, so keep using the same title ("Build plan", not "Build plan v2"). With a `docId` it edits that doc, and a new `title` renames it.
- **Replace, don't clobber:** `content` replaces the whole doc. Read it with `get_doc` first, keep what others wrote, and change only your part.
- **When to update:** when the user asks, and at the end of a session that changed the plan or left work for the next one. Keep a handoff short: what's done, what's next, anything the next session needs to know.

Docs don't replace the other tools: work to do is a task, a choice worth revisiting is `task_log_decision` on its task, and what you're building and why lives in the project's product context. Create a doc only when the user asked for one or agreed to it, and never delete one; deleting is done in the app.

If the user keeps a local file such as `buildplan.md` or `HANDOFF.md`, offer once to keep a copy in Frostbyte so the team can read it. Leave the local file in place unless they ask otherwise.
