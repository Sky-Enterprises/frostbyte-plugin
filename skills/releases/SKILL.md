---
name: releases
description: Use when the user asks about a Frostbyte release, such as what's in or left in the current one, release history, creating, completing, reactivating or deleting one, launch dates, or drafting and saving release notes.
---

# Frostbyte releases

Releases group what ships and make up the project's timeline. Change their status on purpose, never as a side effect.

## Reading

- `release_read_active` gives the current release's progress; `list_tasks` with its `releaseId` lists exactly what's left.
- `list_releases` covers history and target or launch dates. `get_release` shows one release's notes and tasks (`taskStatus` filters them). Read a release before changing it.
- Release names in results are links; reuse them as given.

## Changing releases

- **Create:** `create_release` with the user's name, or no `name` to follow the project's pattern (v1.2.0 → v1.2.1). `targetDate` is optional, and new releases are upcoming. To record one that already shipped, create it `completed` with a `launchDate`; `launchDate` with any other status is refused.
- **Complete:** `update_release` with `status: "completed"`, then confirm with `get_release`. It emails portal and widget submitters whose linked tasks shipped (never manually captured signals, and up to a daily limit per project), and those emails can't be recalled. Completing stamps today as the launch date unless `launchDate` is in the same call, which is then kept. The app and REST API behave the same way.
- **Reactivate or move to upcoming:** `update_release` with `status: "active"` or `"upcoming"`. Leaving completed clears the launch date. There's only one active release, so making one active moves the current one to upcoming.
- **Correct a launch date:** `update_release` with `launchDate` (ISO 8601; `null` clears it). It's refused unless the release is completed after the call, and it sends nothing.
- **Delete:** `delete_release`, only under "Deleting" in `frostbyte:tasks`. Its tasks return to the Backlog and its GitHub milestone is deleted. Don't suggest deleting a completed release; it erases shipped history.

## Release notes

Draft them from what shipped (`get_release` with `taskStatus: "done"`) and show the draft in chat. Save only when asked, as `releaseNotes` and `changelogTitle` on `update_release` (an empty string clears either). Saving doesn't complete the release or email anyone. The post reaches the Feedback Portal changelog once the release is published there from the app, and edits to a published release show publicly straight away. Cover and inline images are uploaded in the app, on Indie and above.

Write for the product's users. The headline names the main change in their terms ("Recurring invoices that send themselves"), not the version. The notes open with a short paragraph on why it matters, then a `##` section per notable change, then a `## And a few more` list with bold lead-ins. Don't repeat every task: the changelog already lists them under the post. No task numbers or internal detail. "Draft, don't publish" means chat only.

A release `description` is 1–2 factual sentences on what the release covers and why, such as "Shipped the multi-token table and billing redesign. Cut Codex deep links to v1.3." Release notes drafts build on it, so keep it current. After you add tasks to a release, move them out, or create or re-plan it, read its `description`: write one if it's empty, and update it with `update_release` if it no longer matches the scope. Never silently rewrite one a person clearly wrote: propose the new wording in chat, unless the user asked you to plan or reshape the release.

## Authority

- An explicit request naming the release ("complete v1.2") is approval, so don't ask again. Ask when the target is unclear or when you're proposing the action yourself, and say what completing will send.
- Never hand a requested change back to the user as something to do in the app. If `update_release` is missing, say the connection lacks the tool; if a call fails, report its actual error. Never report success without checking the status.
- Putting tasks in a release follows "Placement" in `frostbyte:tasks`; planning several releases is `frostbyte:planning`.
