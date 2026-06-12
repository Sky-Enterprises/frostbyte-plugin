# Frostbyte auto-integration plan

> Goal: make Frostbyte *aware of your project and maintain it for you* as you work —
> including **setting up the link to a Frostbyte project when one is missing** —
> without you having to say "start this task" or "Frostbyte" every time.
> Scope chosen: **grounding-only** (the agent does the writing through the MCP; no secrets leave your keychain).
> Agents in scope: **Claude Code and Codex first**, designed so any agent with the same hook + skill model works.

---

## The idea in one picture

Today the plugin only reacts when you mention the magic words ("this task", "Frostbyte").
We're adding three things on top:

```
0. ONBOARDING FRONT DOOR → If a repo has no Frostbyte link yet, the agent notices and offers to set one up:
                            • brand-new project  → create a Frostbyte project + seed first tasks
                            • existing project   → match/pick an existing Frostbyte project + link it
                            (Either way it writes the .frostbyte.json link file.)

1. GROUNDING  →  Every turn, if the repo IS linked, the agent is quietly told:
                 "You're in Frostbyte project X. Here are its open tasks."
                 (So it never has to guess or be told.)

2. MAINTENANCE → Now that it KNOWS the task list, the skill tells it to keep
                 that list correct: start the obvious task, create a new task
                 when work is big enough, add a subtask when work fits an
                 existing one, complete tasks when done.
```

The whole system hinges on one small file — `.frostbyte.json` — which links a repo to a
Frostbyte project. **There are three ways it gets created**, all ending at the same file:

| Your situation | How the link gets made |
|---|---|
| Brand-new project | Onboarding skill creates the project, then writes the link |
| Existing project, already on Frostbyte | Onboarding skill detects no link, offers to match + write it |
| You just want to do it yourself | Paste the projectId by hand |

**Why the token stays safe:** the grounding step does NOT fetch from Frostbyte itself.
It only *injects an instruction* ("call `list_tasks` for project X"). The agent then
fetches through the MCP server, which already gets your token from the keychain (Claude
Code) or `FROSTBYTE_API_TOKEN` (Codex). Nothing new touches the token.

---

## Decisions locked (from review)

- **`.frostbyte.json` is committed to git**, and holds **just the projectId**. Shared by the
  whole team; no secrets in it.
- **Turn-off:** per-repo opt-out by deleting `.frostbyte.json` (unlinks that repo); global
  off by removing the hook. Optional soft opt-out: a `"grounding": false` field the hook
  honours while keeping the link. (Default file is still just `projectId`.)
- **Auto-creation scope:** **tasks** are auto-created in v1. **Releases** only when the user
  explicitly asks. **Areas**: assign new tasks to the best-fitting existing area; create a
  new area only when nothing fits.
- **Agents:** Claude Code + Codex are first-class; the hook script and skills are shared.

## Non-goals (v1)

- **Monorepos / multiple projects per repo.** One `.frostbyte.json` at the repo root, one
  project. The hook walks up to the nearest one; nested links are not supported in v1.
- **Deterministic write-back** (a commit hook writing straight to the REST API) — deferred;
  see Phase 6.

---

## Two things to check before we build

**Check 1 — confirm hooks deliver context on our setup (mostly answered).**
Research shows the old "plugin SessionStart `additionalContext` is discarded" bug
(#45438) was **fixed (COMPLETED) in April 2026**, and Codex supports the same events. So
bundling the hook in the plugin is viable. Still do a 2-minute empirical test on our
current Claude Code (2.1.144) and Codex: inject `TEST-MARKER-123` from a `SessionStart`
hook and confirm the agent can repeat it back. Result decides:
- Hook **event**: `SessionStart` (once per session, preferred) vs `UserPromptSubmit` (every
  prompt, fallback if SessionStart is flaky on our version).
- Hook **delivery**: bundled in the plugin (best UX) vs `settings.json` / `config.toml`
  (fallback if plugin hooks misbehave).

**Check 2 — confirm exact MCP tool names:** `list_projects`, `create_project` (vs
`project_create`), `create_task` (vs `task_create`), and the area tools. Ask the agent to
list Frostbyte tools, or check the server's MCP registry.

---

## Phase 1 — The repo ↔ project link (the keystone)

**Why:** nothing else works until a folder on disk maps to a Frostbyte project.

**What:** a small committed file at the repo root:

```json
// .frostbyte.json
{ "projectId": "proj_abc123" }
```

Optional soft opt-out (keeps the link, pauses grounding):

```json
{ "projectId": "proj_abc123", "grounding": false }
```

**Where:** `.frostbyte.json` lives in the user's repos. The format + docs live in the
`frostbyte-plugin` repo. Any new MCP tool lives in the Frostbyte server repo.

**Done when:** a repo has a `.frostbyte.json` and the agent can read a projectId from it.
(It's *written* by the onboarding skill in Phase 2, or pasted by hand.)

---

## Phase 2 — Onboarding skill (links a repo to a project — new OR existing)

**Why:** the front door. When a repo isn't linked yet, the agent sets it up *for* you.
One skill, two branches. Works identically in Claude Code and Codex (skills are shared).

**Trigger:** no `.frostbyte.json` present and the conversation is about building/working
this codebase.

**Branch A — brand-new project** (empty repo / starting fresh):
1. Notices the work looks like a fresh build.
2. If context is thin, asks: MVP or fuller 1.0? main features? architecture/stack preference?
3. Asks consent — *"Create a Frostbyte project to track this?"*
4. On yes → `create_project`, seed first tasks/areas from the features discussed, write `.frostbyte.json`.

**Branch B — existing project, not linked yet** (repo already has code):
1. Notices no `.frostbyte.json` but this is clearly an established codebase.
2. `list_projects`, try to match by repo/folder name; if unsure, ask which project (or offer to create one).
3. Asks consent — *"Link this repo to your Frostbyte project 'X'?"*
4. On yes → write `.frostbyte.json` with that projectId.

**Guardrails:** always ask before creating a project or writing the link; if the user says
no, drop it and don't re-nag; deep planning hands off to existing planning skills.

**Where:** `frostbyte-plugin` repo, new `skills/onboarding/SKILL.md` (+ `create_project` on
the server if missing — Check 2).

**Done when:** in an unlinked repo, the agent correctly offers to *create* (empty) or
*link* (existing) a project and writes `.frostbyte.json` after you agree.

---

## Phase 3 — The grounding hook (makes the agent always aware) — shared across agents

**Why:** the everyday win. Once a repo is linked, the agent opens every session already
knowing the project and its open tasks.

**What — ONE shared script** (same logic for both agents):
1. Walk **up** from the current directory to find the nearest `.frostbyte.json` (so it works
   from subdirectories, like git does).
2. **If found and `grounding !== false`** → inject:
   > "This repo is Frostbyte project `<id>`. Before other work, call `frostbyte:list_tasks`
   > for it and treat in-progress tasks + the active release as your working context."
3. **If missing** → stay silent by default. *(Optional, decision below:)* emit a one-time
   per-session hint so onboarding (Phase 2) can offer to link it.

**Hook robustness (required — a bad hook can block input):**
- Must **fail safe**: any error, missing file, or malformed JSON → exit 0, output nothing.
  Never throw, never hang. Parse JSON safely (no `eval`).
- Must be fast (no network; it only reads a local file).

**Registration (same script, two places):**
- **Claude Code:** bundle in the plugin (`hooks/hooks.json`) if Check 1 passes; else document
  a `~/.claude/settings.json` snippet.
- **Codex:** bundle in `.codex-plugin` hooks, or document a `config.toml` `[[hooks.SessionStart]]`
  snippet (Codex uses the same event schema + `additionalContext`/stdout injection).

**Which event:** `SessionStart` if Check 1 confirms it; otherwise `UserPromptSubmit`.

**Done when:** a fresh session in a linked repo (in either agent) already knows the
project's open tasks without being asked, and an unlinked/broken-JSON repo behaves
normally.

---

## Phase 4 — The skill policy (makes the agent maintain the list)

**Why:** grounding makes the agent *aware*; this makes it *act*. Update `skills/tasks/SKILL.md`.

**Task rules (v1 auto-creation = tasks):**

| Situation | Action |
|---|---|
| An obvious in-progress task matches what you asked for | `task_start` it (if still `todo`) |
| Work is **big enough** and matches no existing task | `create_task` |
| Work clearly belongs to an existing in-progress task | `task_spawn_subtasks` on it |
| A task's work is finished | `task_complete` with summary + files touched |

**"Big enough" (to avoid task-spam):** multi-step, OR spans multiple files/sessions, OR
framed as a deliverable. One-line fixes, chores, and dependency bumps get **no** task.

**Areas:** when creating a task, place it in the **best-fitting existing area**; only create
a **new area** when nothing fits. (Lean on the existing `areas` skill for the CRUD.)

**Releases:** **not** auto-created. Only act on releases when the user explicitly asks
(existing `releases` skill handles the lifecycle).

**Stale / invalid link handling (cross-cutting):** if `list_tasks` returns not-found or
forbidden for the linked projectId (project deleted, or token lost access), the agent must
**say so plainly** and offer to re-link (re-run onboarding Branch B) — never silently
continue as if grounded.

**Guardrail:** if it's ambiguous whether to create a task, the agent *proposes* it and asks
first — creating a task is part of the audit trail.

**Done when:** during normal work the agent starts/creates/subtasks/completes correctly,
places tasks in sensible areas, leaves releases alone unless asked, and handles a broken
link gracefully.

---

## Phase 5 — Documentation (ship the docs with the feature)

**Why:** this changes how users set up and use Frostbyte — docs change in the same release.

**Product docs / website (Frostbyte app repo):**
- "Connect your coding agent" / getting-started — onboarding flow, the `.frostbyte.json`
  link file, the grounding hook setup, **for both Claude Code and Codex**.
- A short "how auto-tracking works" page (grounding + auto task/area creation) so
  self-updating tasks aren't mysterious.
- Settings → AI Agents help text, if the flow references it.

**Plugin repo (`frostbyte-plugin`):**
- `README.md` — onboarding/grounding sections + hook setup (plugin-bundled and the
  settings.json / config.toml fallbacks).
- `CHANGELOG.md` — new skills, the hook, the `.frostbyte.json` convention.
- `.frostbyte.json` format reference + the opt-out/turn-off instructions.

**Done when:** a new user on either agent can follow the docs end-to-end — install, link a
repo, see tasks tracked — without prior knowledge, and knows how to turn it off.

---

## Phase 6 — Deterministic write-back (DEFERRED — not now)

A future option: a commit hook that writes task transitions directly to the Frostbyte REST
API, so they happen even if the model forgets. **Skipped** because it requires the token
outside the keychain. Revisit only if grounding proves unreliable.

---

## Build order (checklist)

- [ ] **Check 1:** empirically confirm `SessionStart` context on Claude Code 2.1.144 + Codex → pick event + delivery
- [ ] **Check 2:** confirm `list_projects` / `create_project` / `create_task` / area tool names
- [ ] **Phase 1:** define + document `.frostbyte.json` (committed, projectId-only, optional `grounding:false`)
- [ ] **Phase 2:** write `skills/onboarding/SKILL.md` (new + existing branches); ensure `create_project` exists
- [ ] **Phase 3:** write the shared grounding hook (fail-safe, walks up); register for Claude Code + Codex
- [ ] **Phase 4:** update `skills/tasks/SKILL.md` (task auto-create, area fit-or-create, releases on request, stale-link handling)
- [ ] **Phase 5:** update product docs + plugin README/CHANGELOG (both agents)
- [ ] **Test** against a throwaway project on a local/staging endpoint: (a) new project, (b) existing repo linked, (c) already-linked, (d) broken/stale link, (e) unlinked repo stays silent
- [ ] Final docs pass + release

## Decisions still open

1. Hook **event** (`SessionStart` vs `UserPromptSubmit`) and **delivery** (plugin-bundled vs
   settings.json/config.toml) — both decided by Check 1.
2. When a repo is unlinked, should the grounding hook stay fully silent, or emit a one-time
   hint so onboarding can offer to link it? (Silent = calmer; hint = more proactive.)

## Notes / why some choices were forced

- **Plugin SessionStart hooks are fixed** (#45438, COMPLETED, Apr 2026), so the hook can be
  bundled — but plugin hooks still have rough edges (a failing hook can block input), so the
  hook **must** fail safe and we gate on Check 1.
- **Codex mirrors Claude Code's hook model** (same events, same `additionalContext`/stdout
  injection, configured in `config.toml`/hooks.json), which is why one script serves both.
- **Token never leaves the keychain/env** — the hook only injects an instruction; the
  authenticated fetch is done by the MCP server.
- **All detection is skill/judgment based, so it's an *offer*, never a silent action.**
  Creating projects, linking repos, and creating tasks always ask first.

---

_Research sources: Claude Code issues [#45438](https://github.com/anthropics/claude-code/issues/45438), [#16538](https://github.com/anthropics/claude-code/issues/16538); [Claude Code hooks reference](https://docs.claude.com/en/docs/claude-code/hooks); [Codex hooks](https://developers.openai.com/codex/hooks)._
