# Connect Frostbyte

Any Frostbyte account can connect, Free included. Paid plans are bought on the
[Frostbyte website](https://getfrostbyte.dev/pricing); the plugin never takes payments.

## ChatGPT and Codex

**ChatGPT.** Open **Plugins**, click **+**, then **Add custom MCP server**. Name it
Frostbyte, paste `https://getfrostbyte.dev/mcp`, choose OAuth, then sign in to
Frostbyte and approve access. Availability depends on your plan and workspace settings.

**Codex.** Install the plugin and save your token in your shell profile:

```sh
codex plugin marketplace add Sky-Enterprises/frostbyte-plugin
codex plugin add frostbyte@frostbyte-plugin
export FROSTBYTE_API_TOKEN=<your-token>
```

Get the token from Frostbyte → Settings → Connections → Connect your agent, and keep it
out of your repository. Open a new terminal, then start Codex. To connect only the
tools without the plugin's guidance, use
`codex mcp add frostbyte --url https://getfrostbyte.dev/mcp --bearer-token-env-var FROSTBYTE_API_TOKEN`.

## Claude Code

In a Claude Code session:

```text
/plugin marketplace add Sky-Enterprises/frostbyte-plugin
/plugin install frostbyte@frostbyte-plugin
```

Paste your API token when asked (Frostbyte → Settings → Connections → Connect your
agent). Claude Code stores it as a sensitive setting. Start a new session and check
`/mcp` shows `plugin:frostbyte:frostbyte` as connected.

**Upgrading from 0.8.x or earlier?** The plugin used to be called `Frostbyte` and is
now `frostbyte`. Install `frostbyte@frostbyte-plugin` and enter your token again.

The bundled SessionStart hook reads only `.frostbyte.json`, stops at the repository
boundary and makes no network calls. It needs jq or Python 3 to parse the file and
skips grounding without them. Set `"grounding": false` in the file to pause it.

## Claude chat

Open **Settings → Connectors**, add a custom connector with
`https://getfrostbyte.dev/mcp`, then sign in to Frostbyte. Chat sessions pick a
project by name; they don't need `.frostbyte.json`.

## Check and recover

Ask “Can you see my Frostbyte projects?” If your projects are listed, the connection
works. Then pick the project and task you want.

- **No Frostbyte tools:** reconnect in your app's connection settings.
- **Expired or revoked access:** reconnect (OAuth) or paste a new token (Claude Code, Codex).
  Deleting a Frostbyte account also deletes its tokens and app connections, so they
  stop working for good.
- **Project not found or forbidden:** check you're signed in to the right account
  and are a member of the project. Leaving or being removed from a project ends
  access to it straight away.
- **Email not verified:** verify your email address in Frostbyte, then try again.

## Updates

Claude Code: `/plugin` → Installed → Frostbyte → Update now, or
`claude plugin update frostbyte@frostbyte-plugin`. Custom marketplaces have
[auto-update off by default](https://code.claude.com/docs/en/discover-plugins#keep-plugins-updated).

Codex: refresh with `codex plugin marketplace upgrade`, reinstall with
`codex plugin add frostbyte@frostbyte-plugin`, then start a new session.

## Development preview

To try a local checkout, run `claude --plugin-dir /absolute/path/to/plugin`. Trust the
folder and enter the token when asked, then confirm the lowercase server in `/mcp`;
skills loading alone doesn't mean the connection is configured.
