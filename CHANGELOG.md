# Changelog

## [Unreleased]

### Changed
- Release notes are now a changelog post: the agent drafts a headline (`changelogTitle` on `update_release`) as well as the notes, opening with why the change matters instead of repeating every task. Cover and inline images are added in the app, on Indie and above.

## [0.9.2] — 2026-10-29

### Added
- A planning skill: break a goal into tasks, plan one or more releases, organise the backlog or shape the product brief. The agent proposes the plan in chat and writes it only once you approve, with every task placed in its release or the Backlog.
- A docs skill: questions about how Frostbyte works are answered from the live docs (`/llms.txt` and each page's Markdown) instead of from memory.
- Release notes: the agent drafts them from what shipped and saves them to the release only when asked.
- The agent can show or hide a task on the public roadmap when asked.
- Skills now cover every Frostbyte MCP tool: `get_activity` for recent changes, `session_end` for work no task captured, `update_project` for the pitch and product brief (owner only, on request), and `feedback_hub_get` for Feedback Portal settings.

### Changed
- Completing a release keeps a `launchDate` passed in the same call (a backdated launch) and otherwise stamps today; `launchDate` on a release that isn't completed is refused.
- The agent explains Free plan limits instead of retrying, including the new cap on reopening a Done task, and knows `completionPolicy` is needed to finish a task with unchecked subtasks.
- Connection help covers a deleted account (its tokens stop working), an unverified email, and losing access when you leave or are removed from a project.
- Plugin listings and setup help point to Connect your agent and to Settings → Connections.
- Every skill is rewritten to be shorter, about a third less in total and nearly half for tasks, so less of your agent's context goes on instructions. Shared rules (placement, deleting, plan limits) live once in the tasks skill, skill descriptions are tighter, and an outdated server-version note is gone.

### Fixed
- Commit and PR guidance now uses `#42`, the reference Frostbyte's GitHub integration actually links, instead of `FB-42` and branch names.
- Before deleting an area or release, the agent counts done tasks too, and restores a release suggestion with the right `kind`.

## [0.9.1] — 2026-10-29

### Changed
- Release instructions say who gets an email when a release ships: portal and widget submitters only, up to a daily limit per project.

## [0.9.0] — 2026-10-28

### Added
- Works in ChatGPT and Claude chat as well as Claude Code and Codex. Chat sessions pick a project by name; no repository link needed. The ChatGPT package signs in with OAuth instead of a token.
- "What should I work on next?" now reads your personal What's Next recommendations, and you can dismiss or restore one.
- "Assign it to me" works, using your own member ID from the project (needs Frostbyte MCP server 1.5.1).
- Skills cover the full Signals review flow: list by section, correct a captured signal, mark it reviewed with no task, unlink a task, and permanently delete test or spam signals when asked.
- An icon and privacy policy link for the plugin directories.

### Changed
- When you name a release or area, the agent puts the task there for real and reads it back to check, instead of mentioning it in the notes.
- Tasks stay In progress until the agreed checks or requested review are done, not just when the code is written. The agent never ships a release on its own.
- An explicit request ("create a task", "complete v1.2") counts as approval, so the agent doesn't ask again.
- The grounding hook parses `.frostbyte.json` properly (with jq or Python 3) and ignores a malformed file.
- Shorter README and setup guide.

### Breaking
- The Claude Code plugin is renamed from `Frostbyte` to `frostbyte`. Reinstall `frostbyte@frostbyte-plugin` and enter your API token again.

## [0.8.1] — 2026-10-18

### Fixed
- Release instructions now treat an explicit request to complete a named release as authorization to call `update_release`, explain reactivation, and distinguish a missing tool or failed call from an action the user must perform manually. Removed the incorrect claim that agents cannot reverse release status changes.

## [0.8.0] — 2026-10-13

### Added
- Paired with Frostbyte MCP server 1.4.0: tool results now link tasks, releases and areas into the app (`[FB-42](…/tasks/…)`), and the server tells clients to reuse them. The `frostbyte:tasks`, `frostbyte:releases` and `frostbyte:areas` skills say the same, so agents name a task, release or area in a reply as a clickable link that opens it in Frostbyte. Links use your own username, so they only open for the token's owner. Commit messages and PR titles keep the plain `FB-<n>`.

## [0.7.0] — 2026-10-12

### Added
- Skills now cover the new Frostbyte MCP tools: `update_task` with `releaseId: null` / `areaId: null` to return a task to the Backlog or clear its area; `launchDate` on `create_release` / `update_release`; and `delete_area` / `delete_release` alongside `delete_task`.
- A "Deleting" section in the `frostbyte:tasks` skill: deletion is allowed only after the user says yes in chat, never on the agent's own initiative, and only after listing exactly what will go.
- Agents can read files attached to tasks and signals. Paired with the Frostbyte MCP tools `get_task_attachment` and `signals_get_attachment`, and attachment listings in `get_task` and `signals_get`. The `frostbyte:tasks` skill now has an "Attachments" section: check them when a task mentions a screenshot, mockup or other visual, fetch only what the task refers to, and ask the user to describe the file if the client can't display it. Works the same in Claude Code and Codex, since both load the same skills.
- A `frostbyte:signals` skill covering the signals tools that no skill described: capture what a user reported without asking, read the queue and attachments, and leave linking or dismissing a signal to the founder. Matches how the in-app Frostbyte agent behaves.
- The `frostbyte:tasks` skill now mentions `task_add_blocker` and `tasks_list_blocked`.

## [0.6.2] — 2026-10-03

### Changed
- Token copy now points at Settings → AI agents → Connect your agent (the web app no longer has a "Generate token" button). The README install line uses `Frostbyte@frostbyte-plugin` to match the manifest name.

## [0.6.1] — 2026-09-30

### Fixed
- The `frostbyte:tasks` skill referred to task implementation notes as `agent_context`; the MCP parameter is `agentContext`. It now uses the real name and notes that implementation notes render markdown in the Frostbyte web app.

## [0.6.0] — 2026-07-14

### Removed
- **`endpoint` user config removed from the Claude Code manifest.** Frostbyte is a hosted product; prompting every user for an API endpoint override at install time (default `https://getfrostbyte.dev`) served no purpose for the vast majority of installs and only added onboarding confusion. `.mcp.json`'s `url` is now hardcoded to `https://getfrostbyte.dev/mcp`, matching how the Codex manifest already worked. Anyone testing against a local/self-hosted instance (there is no endpoint config for either client) now edits the `url` in `.mcp.json` or `.codex-plugin/mcp.json` directly in a local clone — see the README's "Contributing" section.

## [0.5.0] — 2026-07-14

### Changed
- **Breaking: plugin identifier capitalized.** `name` in the Claude Code manifest is now `"Frostbyte"` (was `"frostbyte"`), fixing the lowercase, icon-less listing in Claude's Connectors UI — Claude Code's plugin schema has no separate display-name or icon field, so `name` is the only lever and it doubles as the install identifier (`enabledPlugins` key `Frostbyte@frostbyte-plugin`). Existing installs will need to re-enable the plugin and re-enter their API token after updating; the Codex manifest is untouched since it already had `interface.displayName: "Frostbyte"` separate from its lowercase `name`.

## [0.4.4] — 2026-07-14

### Changed
- **Context-lean reads.** Paired with Frostbyte MCP server 1.3.0: `list_tasks` now defaults to active tasks only (todo + in-progress, 25 per page) and supports `status`, `releaseId`, `areaId`, and `search` filters, so agents no longer pull every done task into the session. `feedback_hub_get` and `get_feedback_submission` return compact formatted summaries instead of raw JSON documents.
- The `frostbyte:tasks` skill gained a "Fetch only what you need" section: keep the active-only default, scope with filters, reserve `get_task` for tasks being acted on, and answer project-status questions via `dashboard_snapshot`.
- The `frostbyte:releases` skill now points agents at `list_tasks` + `releaseId` for remaining-work questions.
- **Leaner tool surface.** `task_check_subtask` and `task_update_subtask` merged into `task_edit_subtask` (`action`: check / uncheck / set-text); `task_delete_subtask` stays separate so destructive actions keep their by-name approval gate in the in-app agent. Feedback-hub administration (`feedback_hub_enable` / `feedback_hub_disable` / `feedback_hub_update_settings`) moved out of the MCP surface — manage the hub in the web app. Fewer schemas means less context spent before the first tool call.
- **One-call session grounding.** `dashboard_snapshot` now includes in-progress task titles (with `FB-<n>`) and active-release progress, and the default first page of `list_tasks` names the active release — no separate `release_read_active` call needed at session start. `task_spawn_subtasks` returns the created subtask ids so ticking them off later needs no re-fetch.
- `get_release` accepts a `taskStatus` filter and `get_project` a `maxReleases` cap (both default to the previous unbounded behaviour); `dashboard_snapshot` no longer duplicates its payload as structured output.

### Fixed
- `get_task` now returns subtask ids (and per-item completed state), which the subtask tools require but previously had no way to obtain. It also returns the `FB-<n>` task number the commit-linking guidance references, plus blocker reason when set; `list_tasks` lines include `FB-<n>` and a `[blocked]` marker.

## [0.4.3] — 2026-07-02

### Changed
- `frostbyte:tasks` now draws a sharper line between automatic and offered writes: lifecycle transitions on existing tasks (`task_start`, `task_spawn_subtasks`, `task_log_decision`, `task_complete`) happen automatically without asking, while creating a new task stays a single light inline offer. Releases remain manual; areas still confirm the name.
- Brevity guidance tightened across the `tasks`, `releases`, and `areas` skills — short imperative task names, 1-2 sentence descriptions and completion/release summaries — matching the same guidance now carried in the server's MCP tool schemas.

### Fixed
- Codex marketplace packaging now uses `source: "url"` with `url: "./"`, matching the repo-root plugin layout Codex indexes for installable plugins.
- Codex MCP config now uses the required top-level `mcpServers` wrapper and a non-hidden `.codex-plugin/mcp.json` file.

## [0.4.2] — 2026-06-12

### Added
- Re-exposed `task_log_decision` in the `frostbyte:tasks` skill and README. The tool is fully implemented on the server (it appends an append-only decision record to a task's activity feed, surfaced in the task modal and the project activity timeline), so 0.4.1's "planned but not yet integrated" note was inaccurate — agents now know to call it for non-trivial design decisions worth auditing later.

## [0.4.1] — 2026-06-12

### Fixed
- **MCP server never connected on Claude Code.** `.mcp.json` lived in `.claude-plugin/`, but Claude Code resolves the manifest's `mcpServers` path relative to the plugin root (and auto-discovers `.mcp.json` there) — so the server config was never found and no `frostbyte` tools loaded. Moved `.mcp.json` to the plugin root. The Codex manifest now points explicitly at `./.codex-plugin/.mcp.json` so it doesn't pick up the Claude-format file at the root.
- Grounding hook no longer walks above the repo boundary: the `.frostbyte.json` search stops at the first directory containing `.git`, so a stray link file in `$HOME` can't ground unrelated repos.
- Grounding hook parses `.frostbyte.json` with `jq` when available; the no-`jq` fallback now takes the *first* `projectId` occurrence instead of the last.
- Skill frontmatter `name` fields now match their directory names (`tasks`, `releases`, `areas`, `onboarding` — surfaced as `/frostbyte:<name>`); cross-references between skills updated to the real invocation names.
- README: corrected repository layout, local-testing instructions for Codex (no `endpoint` config — edit `.codex-plugin/.mcp.json` directly), token re-entry steps, and the "agent never calls Frostbyte tools" troubleshooting row (check `/mcp` first).

### Changed
- Grounding instruction softened: agents fetch the task list when beginning implementation work rather than "before other work", and are told to degrade gracefully (mention it once, keep working) when the `frostbyte` MCP tools are unavailable. The `frostbyte:tasks` skill carries the same tools-unavailable rule.
- Removed `task_log_decision` from skill and README tool lists — the tool is planned but not yet integrated on the server.
- `endpoint` config description now warns against a trailing slash (the MCP URL is built as `${endpoint}/mcp`).

## [0.4.0] — 2026-06-12

### Added
- `.frostbyte.json` convention — a committed repo-root file (`{ "projectId": "..." }`) linking a repo to a Frostbyte project. Optional `"grounding": false` pauses grounding while keeping the link.
- Session grounding hook (`hooks/frostbyte-grounding.sh`) — on SessionStart, walks up from the working directory to the nearest `.frostbyte.json` and tells the agent which project it is in. Fail-safe: any error exits silently. Bundled for Claude Code via `hooks/hooks.json`; Codex users register the same script via `~/.codex/hooks.json` (see README).
- `frostbyte-onboarding` skill — when a repo is unlinked, offers to create a new Frostbyte project (fresh codebase) or link an existing one (established codebase), then writes `.frostbyte.json`. Always asks first.
- `frostbyte-tasks` skill: auto-tracking policy for grounded sessions — start the obvious task, propose a task when work is big enough, subtask work that fits an in-progress task, complete on finish. Areas: best-fit existing, create only when nothing fits. Releases: never auto-created. Stale/invalid links are surfaced, never silently ignored.

### Fixed
- `frostbyte-areas` and `frostbyte-releases` skills referenced MCP tool names that don't exist on the server (`area_list`, `area_create`, `area_read`, `area_update`, `release_list`, `release_read`, `release_create`, `release_complete`, `task_update`). Corrected to the real names (`list_areas`, `create_area`, `update_area`, `list_releases`, `get_release`, `create_release`, `update_release`, `update_task`).

## [0.3.1] — 2026-05-05

### Added
- `frostbyte-tasks` skill: instruct agents to include `FB-<task-number>` in commit messages and PR titles. Frostbyte's release audit uses this to auto-link commits to tasks on the Dashboard with no extra MCP call.

## [0.3.0] — 2026-05-04

### Removed
- `SessionEnd` hook (and `hooks/` directory). Incompatible with Claude Code 2.1.x plugin schema, and `mcp_tool` was never a supported hook type. Skills carry the policy instead — agents call `task_complete` directly. Reliability backstop revisited only if cold-session tests show it's needed.

## [0.2.0] — 2026-05-04

### Added
- `frostbyte-releases` skill — release lifecycle: create, activate, complete, and read active release
- `frostbyte-areas` skill — area CRUD for grouping and re-scoping tasks within a project
- `CHANGELOG.md` and `.gitignore`
- README "Repository layout" and "Contributing" sections

### Changed
- README "What the plugin gives you" expanded to enumerate every skill and the `task_log_decision` tool

## [0.1.0] — 2026-05-03

### Added
- Claude Code plugin manifest (`.claude-plugin/plugin.json`) with OS-keychain-backed `api_token` prompt
- Codex plugin manifest (`.codex-plugin/plugin.json`) reading token from `FROSTBYTE_API_TOKEN` env var
- Shared MCP server config pointing to `https://getfrostbyte.dev/mcp`
- `frostbyte-tasks` skill — task lifecycle: start, complete, spawn subtasks, log decisions
- `SessionEnd` hook — calls `frostbyte:session_end` when the AI client session closes so the Dashboard activity card stays populated even if the agent skips `task_complete`
- Claude Code marketplace entry (`.claude-plugin/marketplace.json`)
- Codex marketplace entry (`.agents/plugins/marketplace.json`)
