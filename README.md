# Frostbyte plugin

The Frostbyte plugin connects Claude Code or Codex to your Frostbyte project tracker. Once installed, your AI client treats Frostbyte as structured memory — it transitions tasks, records decisions, and writes session summaries as a side-effect of building.

This repo contains the Claude Code plugin manifest, the Codex plugin manifest, the shared skills, and the MCP server pointer. You install it once per AI client; it then works across every Frostbyte project the user has access to.

## What you need first

1. A Frostbyte account (free signup at [getfrostbyte.dev](https://getfrostbyte.dev)).
2. A Frostbyte API token — generate one at **Settings → AI Agents → Generate token**. Plaintext is shown exactly once; copy it before closing the modal.

The token is per-user and per-client. Generating one for Claude Code and another for Codex is the recommended pattern — they show up separately in the AI Agents table so you can see which client is active and revoke them independently.

## Install — Claude Code

```text
/plugin marketplace add Sky-Enterprises/frostbyte-plugin
/plugin install frostbyte@frostbyte-plugin
```

Claude Code will prompt for your `api_token` (sensitive, stored in your OS keychain) and an optional `endpoint` override (default: `https://getfrostbyte.dev`).

Confirm the install with `/plugin list`. The Frostbyte skills will surface automatically: `/frostbyte:tasks` and `/frostbyte:planning`.

## Install — Codex

Codex's plugin platform uses a separate manifest under `.codex-plugin/`. The MCP server is the same.

```bash
codex plugin marketplace add Sky-Enterprises/frostbyte-plugin
codex
# inside Codex, run /plugins and enable Frostbyte

# in your shell, before launching Codex:
export FROSTBYTE_API_TOKEN=fb_pat_your_token_here
```

Codex does not yet have an in-product keychain prompt for sensitive plugin config, so the token is read from `FROSTBYTE_API_TOKEN`. Add it to your shell profile if you want the connection to survive restarts.

## What the plugin gives you

- **Bundled MCP server connection** to `https://getfrostbyte.dev/mcp`, authenticated with your Bearer token. Exposes ~30 tools across project / task / area / release CRUD plus the agent-update, read, and planning tools.
- **Two skills** that tell your agent when to call which MCP tool:
  - `frostbyte-tasks` — task lifecycle (`task_start`, `task_complete`, `task_spawn_subtasks`).
  - `frostbyte-planning` — `tasks_suggest_next` and `tasks_suggest_breakdown` for "what should I work on?" prompts.
- **A `SessionEnd` hook** that records a project-level activity entry when you close a session, so the Dashboard "What your agent did recently" card stays useful even when an agent forgets to call `task_complete`.

## Verifying the connection

After installing:

1. Open a Claude Code or Codex session.
2. Ask: *"What projects do I have on Frostbyte?"*
3. The agent should call `frostbyte:list_projects` and return your projects.
4. Open Frostbyte → **Settings → AI Agents** — your token's `Last active` column should show "Just now".

Once that works, ask: *"Start the task called X"* — the Dashboard "What your agent did recently" card will prepend an entry within ~2 seconds.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Invalid API token` | Token wrong or revoked | Re-generate at Settings → AI Agents and re-run `/plugin enable frostbyte` (Claude Code) or re-export `FROSTBYTE_API_TOKEN` (Codex). |
| `MCP access requires a Basic or Pro plan.` | Free tier; MCP gated at endpoint level. | Upgrade in Settings → Billing. |
| Plugin installed but agent never calls Frostbyte tools | Skills aren't matching the conversation | Mention "Frostbyte" or "this task" explicitly. The skill descriptions activate on task lifecycle and planning prompts. |
| `lastSeenAt` doesn't update on Settings → AI Agents | First call hasn't fired yet | Ask the agent to list your projects. The `list_projects` call updates `lastSeenAt`. |
| Dashboard "agent activity" card stays empty | Agent isn't calling `task_start` / `task_complete` | This is a known cold-start behaviour pattern; tell the agent explicitly to start the task once and the skill prose takes over from there. |

## Updating the plugin

```text
# Claude Code
/plugin update frostbyte

# Codex
codex plugin update frostbyte
```

## License

MIT — see [LICENSE](LICENSE).
