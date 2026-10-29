---
name: releases
description: When the user asks about the current release, wants to cut a new release, mark a release complete, draft or save release notes, or attach tasks to a release on Frostbyte, call the matching release MCP tool. An explicit request to create or complete a specific release authorizes that action; ask for confirmation when proposing it yourself or when the target is unclear.
---

# Frostbyte release lifecycle

Releases group shipped work. They show on the Dashboard timeline and are the primary unit of "what went out" for the project. Treat release transitions as intentional, not automatic.

## When to call which tool

- **Reading the active release** → `frostbyte:release_read_active`. Use for "what's in the current release?", "what's left before we ship?", or any summary question about the in-progress release. Prefer this over `list_releases` when the user just wants current state. For the actual remaining task list, use `frostbyte:list_tasks` with `releaseId` — its default active-only filter returns exactly the unshipped work.
- **Listing all releases** → `frostbyte:list_releases`. Use when the user asks about release history or wants to pick a specific release to inspect.
- **Getting a single release** → `frostbyte:get_release`. Pass `projectId` and `releaseId`. Use before any write operation to confirm current status.
- **Creating a release** → `frostbyte:create_release`. Use the name the user specified, or omit `name` when they ask to use the project's release-naming pattern. Ask only when the intended name or action is unclear; do not repeat approval for an explicit request. Optionally pass a `targetDate` (ISO-8601). To record a release that already shipped, create it with `status: "completed"` and a `launchDate`; `launchDate` with any other status is refused.
- **Marking a release shipped** → `frostbyte:update_release` with `status: "completed"`. When the user explicitly asks to complete a specific release, call the tool and verify the result with `get_release`. Do not hand the action back as something the user must do in the UI. If adding a release summary, keep it to 1-2 factual sentences about what shipped and what was cut. Completing a release also emails portal and widget submitters whose linked tasks shipped in it (never people on manually captured signals, and only up to a daily limit per project), so ask before completing a release you suggested yourself. Completing stamps today as the launch date unless you pass `launchDate` in the same call, in which case that date is kept (a backdated launch). The app and REST API behave the same way.
- **Drafting release notes** → read the release with `frostbyte:get_release` (`taskStatus: "done"` lists what shipped) and draft the notes in chat. Save them only when the user asks, with `frostbyte:update_release` and `releaseNotes` (markdown; an empty string clears them). Saving doesn't complete the release or send emails. Notes appear on the Feedback Portal changelog once the release is published there from the app, and edits to a published release show publicly straight away. Write for the product's users: what changed for them, without task numbers or internal detail. "Draft, don't publish" means chat only.
- **Reactivating or moving a release to upcoming** → `frostbyte:update_release` with `status: "active"` or `status: "upcoming"`. Moving out of completed clears its launch date. Reactivating does not recall emails already sent; making a release active moves the previous active release to upcoming.
- **Backdating or correcting a launch date** → `frostbyte:update_release` with `launchDate` (ISO-8601, `null` to clear). It's refused unless the release is completed after the call, and setting it on its own sends no emails and publishes nothing, so it is safe on past releases. Moving a release out of `completed` clears the date.
- **Deleting a release** → `frostbyte:delete_release`, only after following "Deleting" in the `frostbyte:tasks` skill: never on your own initiative, tell the user which release and how many tasks it holds (`list_tasks` with `releaseId` and `status: "all"`), and wait for a yes in chat before passing `confirm: true`. Its tasks are kept and return to the Backlog. Don't offer to delete a completed release unless the user raises it; it removes shipped history from the Dashboard timeline.

## Rules

- **Link releases when you name them.** `list_releases`, `get_release` and `release_read_active` return the release name as a link to Frostbyte; reuse it as given (see "Linking tasks, releases and areas" in `frostbyte:tasks`).
- **Use the user's authorization.** Creating and completing releases are visible to every project member. An explicit request naming the release is authorization; do not ask for the same approval again. Ask when the target is unclear or when you propose the action yourself. Release status can be changed again through `update_release`, but completion emails already sent cannot be recalled.
- **Distinguish tool failures from missing capability.** If `update_release` is unavailable, report that the current connection is missing the tool and suggest reconnecting or refreshing the plugin. If a call fails, explain its actual error. Do not claim that agents cannot complete releases, or report success without checking the resulting status.
- **Honour requested placement.** Pass a named release's real `releaseId` (and a named area's `areaId`) to `create_task` or `update_task`, then read the task back; notes never count. If a named release is missing, ask whether to create it or pick another, and never invent an ID. `releaseId: null` is the Backlog; leaving it out uses the active release. "Placement" in `frostbyte:tasks` has the full rules; planning several releases at once is `frostbyte:planning`.
- **One active release at a time.** `release_read_active` returns the in-progress release. Creating an upcoming release does not end the active release. Only activate a different release when requested; if you propose switching it yourself, explain that the previous active release becomes upcoming and discuss readiness.

## What a good release summary looks like

Bad: "Release completed."
Bad: "All tasks done."
Good: "Shipped the AI Agents multi-token table and billing page redesign. Cut Codex deep-links to v1.3."
