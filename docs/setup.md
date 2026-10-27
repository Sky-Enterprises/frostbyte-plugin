# Connect Frostbyte

You need a Frostbyte account with Indie or higher access. Buy subscriptions on
[Frostbyte](https://getfrostbyte.dev/pricing). The plugin cannot initiate payments.

## ChatGPT and Codex

The public-directory candidate uses OAuth against `https://getfrostbyte.dev/mcp`.
Its shared skills do not require local hooks or a repository. Directory publication
is pending; no public listing link is available yet.

For an existing manual connection, use your host's custom MCP connection settings,
add that URL with OAuth, sign in to Frostbyte and approve access. ChatGPT exposes
custom MCP setup through Plugins, subject to plan/workspace controls. Codex desktop
also supports local marketplaces; see the [official package guide](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work).
Installing a local source copy and installing a public directory release have
separate update paths. Refresh/reinstall the local copy after source changes.

For token-based clients that support it, the legacy `.codex-plugin/mcp.json`
reads `FROSTBYTE_API_TOKEN` from your environment. Keep it outside Git and prompts.
The portable root manifest uses OAuth; its OpenAI extension replaces the compatibility
overlay rather than merging it. Do not assume exporting a token changes that OAuth
connection. For a manual Codex MCP-only connection, use `codex mcp add` with the
hosted HTTP URL and its supported bearer-token environment option, or OAuth login;
check your installed client's help. MCP-only setup does not install these skills.

## Claude Code

In a Claude Code session:

```text
/plugin marketplace add Sky-Enterprises/frostbyte-plugin
/plugin install frostbyte@frostbyte-plugin
```

Obtain an API token from Frostbyte → Settings → AI agents → Connect your agent.
Enter it in the plugin's sensitive API-token configuration. The token is used by
the MCP connection, never by the grounding hook. After a rename from the old
`Frostbyte` identifier, reinstall `frostbyte@frostbyte-plugin` and configure the token
again. Start a new session and check `/mcp` before relying on tracking.

The bundled SessionStart hook reads only `.frostbyte.json`, stops at the repository
boundary and makes no network calls. It uses jq or Python 3 to parse complete JSON;
without either parser it skips grounding. Skills still support explicit selection.
Set `grounding: false` in the link to pause automatic grounding.

For an isolated development preview, use `claude --plugin-dir /absolute/path/to/plugin`.
Claude Code requires its workspace-trust decision and any required token configuration
before the bundled MCP server is usable. Seeing skills load is not proof that the
connection is configured; verify the lowercase server in `/mcp`.
Do not edit the installed cache or change another checkout's server.

## Claude chat

Use Settings → Connectors to add `https://getfrostbyte.dev/mcp`, then sign in through
OAuth. A manual connector supplies tools; it does not prove the directory plugin's
skills are installed. The coordinated directory release is still pending. Chat-only
sessions select the project explicitly and do not require `.frostbyte.json`.

## Check and recover

Ask “Can you see my Frostbyte projects?” A real `list_projects` result proves the
connection can read that account. Then select the intended project and task.
If tools are unavailable, reconnect once and continue without claiming tracking.
For a revoked/expired OAuth grant, reconnect in the host. For a token connection,
replace the token using the host's secure settings. A forbidden project can mean
wrong account or missing membership; a free account lacks paid MCP access.
Do not solve either by changing access rules.

## Updates

Claude Code: use `/plugin` → Installed → Frostbyte → Update now, or
`claude plugin update frostbyte@frostbyte-plugin`. Custom marketplaces have
[auto-update off by default](https://code.claude.com/docs/en/discover-plugins#keep-plugins-updated);
choose the marketplace's auto-update setting deliberately.

The Claude directory tracks the configured branch and applies its actual publish
setting after scanning. OpenAI hosted-tool updates and uploaded skills/assets use
separate update procedures. A GitHub push does not universally publish a new version.
