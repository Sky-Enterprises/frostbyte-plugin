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

Confirm the install with `/plugin list`. The Frostbyte skills will surface automatically: `/frostbyte:tasks`, `/frostbyte:releases`, `/frostbyte:areas`, and `/frostbyte:onboarding`.

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

- **Bundled MCP server connection** to `https://getfrostbyte.dev/mcp`, authenticated with your Bearer token. Exposes ~30 tools across project / task / area / release CRUD plus agent-update and read context tools. (A `task_log_decision` tool is planned but not yet integrated.)
- **Four skills** that tell your agent when and how to call which MCP tool:
  - `frostbyte:tasks` — task lifecycle (`task_start`, `task_complete`, `task_spawn_subtasks`) plus the auto-tracking policy for grounded sessions.
  - `frostbyte:releases` — release lifecycle (`create_release`, `release_read_active`, `update_release`).
  - `frostbyte:areas` — area CRUD (`list_areas`, `create_area`, `update_area`) for projects that use epic-style groupings.
  - `frostbyte:onboarding` — offers to link an unlinked repo to a Frostbyte project (create new or match existing) and writes `.frostbyte.json`.
- **A session grounding hook** (Claude Code: bundled; Codex: one config snippet, below) that makes every session in a linked repo open already knowing which Frostbyte project it belongs to.

## Linking a repo: `.frostbyte.json`

One small file at the repo root links a folder on disk to a Frostbyte project:

```json
{ "projectId": "abc123XYZ" }
```

- **Commit it.** It holds no secrets — the whole team shares the link.
- Three ways it gets created: the onboarding skill creates a new project and writes it; the onboarding skill matches an existing project and writes it; or you paste the projectId by hand (it's in the project's URL).
- One link per repo, at the root. The hook walks up from the current directory to the nearest `.frostbyte.json`, stopping at the repo boundary (the first directory containing `.git`) — a `.frostbyte.json` outside the repo never grounds it.

## How session grounding works

On session start, the hook looks for `.frostbyte.json`. If found, it injects one instruction: *"this repo is Frostbyte project X — when you begin implementation work, call `list_tasks` for it and treat in-progress tasks and the active release as your working context."* The agent then fetches through the MCP server as usual. Quick one-off questions don't trigger a fetch, and if the MCP server isn't connected the agent says so once and carries on without tracking.

The hook never touches the network and never sees your token — the authenticated fetch happens inside the MCP server, which gets the token from your OS keychain (Claude Code) or `FROSTBYTE_API_TOKEN` (Codex). On any error — missing file, malformed JSON — the hook exits silently and your session starts normally.

With grounding in place, the `frostbyte-tasks` skill keeps the list correct as you work: it starts the obvious task, proposes a new task when work is big enough, adds subtasks when work fits an existing task, and completes tasks when done. Creating anything always asks you first.

### Hook setup — Claude Code

Nothing to do. The hook is bundled with the plugin (`hooks/hooks.json`) and registers automatically on install.

### Hook setup — Codex

Register the shared script in `~/.codex/hooks.json` (Codex will ask you to review and trust it via `/hooks` on next launch):

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "sh /path/to/frostbyte-plugin/hooks/frostbyte-grounding.sh" } ] }
    ]
  }
}
```

Replace `/path/to/frostbyte-plugin` with where Codex installed the plugin (check `~/.codex/plugins/cache/`) or a local clone of this repo.

### Turning it off

- **Per repo:** delete `.frostbyte.json` (unlinks the repo), or set `{ "projectId": "...", "grounding": false }` to pause grounding while keeping the link.
- **Globally:** disable or uninstall the plugin (Claude Code), or remove the hook entry from `~/.codex/hooks.json` (Codex).

## Repository layout

```
.mcp.json            MCP server config (Claude Code — lives at the plugin root, where Claude Code expects it)
.claude-plugin/
  plugin.json        Claude Code plugin manifest
  marketplace.json   Claude Code marketplace entry
.codex-plugin/
  plugin.json        Codex plugin manifest
  .mcp.json          MCP server config (Codex)
.agents/plugins/
  marketplace.json   Codex/agents marketplace entry
hooks/
  hooks.json                Claude Code hook registration (SessionStart)
  frostbyte-grounding.sh    Shared grounding hook script (Claude Code + Codex)
skills/
  tasks/SKILL.md       Task lifecycle + auto-tracking skill
  releases/SKILL.md    Release lifecycle skill
  areas/SKILL.md       Area management skill
  onboarding/SKILL.md  Repo-to-project linking skill
LICENSE
CHANGELOG.md
```

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
| `Invalid API token` | Token wrong or revoked | Re-generate at Settings → AI Agents, then re-enter it in Claude Code via the plugin's configuration dialog (`/plugin` → frostbyte → configure; reinstalling the plugin also re-prompts). On Codex, re-export `FROSTBYTE_API_TOKEN`. |
| `MCP access requires a Basic or Pro plan.` | Free tier; MCP gated at endpoint level. | Upgrade in Settings → Billing. |
| Plugin installed but agent never calls Frostbyte tools | MCP server not connected, or skills aren't matching the conversation | First check `/mcp` shows a connected `frostbyte` server — if it's missing, the token was never entered or the connection failed. If the server is connected, mention "Frostbyte" or "this task" explicitly; the skill descriptions activate on task, release, and area lifecycle prompts. |
| `lastSeenAt` doesn't update on Settings → AI Agents | First call hasn't fired yet | Ask the agent to list your projects. The `list_projects` call updates `lastSeenAt`. |
| Dashboard "agent activity" card stays empty | Agent isn't calling `task_start` / `task_complete` | This is a known cold-start behaviour pattern; tell the agent explicitly to start the task once and the skill prose takes over from there. |

## Updating the plugin

```text
# Claude Code
/plugin update frostbyte

# Codex
codex plugin update frostbyte
```

## Contributing

Contributions are welcome. The plugin itself has no build step — all files are plain JSON and Markdown.

To add or modify a skill, edit the relevant `SKILL.md` under `skills/`. The `name` and `description` frontmatter fields are what Claude Code and Codex index when deciding whether to surface the skill; keep `description` precise and action-oriented.

To test locally against `http://localhost:4000` (or your local Frostbyte instance), install the plugin from path rather than the marketplace, then:

- **Claude Code:** set the `endpoint` config value when prompted (no trailing slash).
- **Codex:** there is no endpoint config — edit the `url` in `.codex-plugin/.mcp.json` of your local clone directly.

## License

MIT — see [LICENSE](LICENSE).
