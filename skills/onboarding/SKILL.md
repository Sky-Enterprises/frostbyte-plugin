---
name: frostbyte-onboarding
description: When working in a repo that has NO .frostbyte.json at its root (and no parent directory has one) and the conversation is about building or maintaining this codebase, offer to link the repo to a Frostbyte project — either create a new Frostbyte project (fresh codebase) or link an existing one (established codebase). Creating a project, linking a repo, and writing .frostbyte.json always require explicit user consent first. If the user declines, drop it for the rest of the session.
---

# Frostbyte onboarding — link a repo to a project

Frostbyte's auto-tracking works through one small committed file at the repo root:

```json
{ "projectId": "abc123XYZ" }
```

When that file exists, every new session is grounded automatically (a SessionStart
hook tells the agent which project it is in). Your job in this skill is to get an
unlinked repo to that state — with the user's consent at every step.

## When this applies

- There is no `.frostbyte.json` in the repo root or any parent directory, AND
- the conversation is about building, fixing, or maintaining this codebase
  (not a one-off question, not a scratch directory).

Do not interrupt mid-task to onboard. Raise it at a natural moment — session
start, after finishing a piece of work, or when the user mentions tracking,
tasks, or planning.

## Branch A — brand-new project (fresh / empty repo)

1. The work looks like a fresh build (empty or near-empty repo, "let's build X").
2. If context is thin, ask what they're building: MVP or fuller 1.0? Main
   features? Stack preference? Keep it to one short round of questions —
   deep planning belongs to planning skills, not onboarding.
3. Ask consent: *"Want me to create a Frostbyte project to track this?"*
4. On yes:
   - `create_project` with a sensible name (default: the repo/folder name).
   - Seed initial tasks via `create_task` from the features discussed; group
     them with `create_area` only when the project clearly has distinct domains.
   - Write `.frostbyte.json` at the repo root with the new projectId.
   - Tell the user it's committed-by-design: the whole team shares the link,
     and it contains no secrets.

## Branch B — existing codebase, not linked yet

1. The repo clearly has an established codebase but no `.frostbyte.json`.
2. Call `list_projects` and try to match by repo/folder name. If one match is
   obvious, propose it. If unsure, show the candidates and ask which (or offer
   to create a new project instead).
3. Ask consent: *"Link this repo to your Frostbyte project 'X'?"*
4. On yes: write `.frostbyte.json` at the repo root with that projectId.

## Guardrails

- **Never create a project, create tasks, or write `.frostbyte.json` without
  an explicit yes.** All detection is an offer, not an action.
- If the user says no, don't ask again this session.
- `.frostbyte.json` holds just the projectId. The optional `"grounding": false`
  field pauses session grounding while keeping the link — mention it only if
  the user asks how to turn grounding off.
- Don't gate the user's actual work on onboarding — if they want to keep
  coding, link later.
