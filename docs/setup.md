# Connect Frostbyte

Any Frostbyte account can connect, Free included. Paid plans are bought on the
[Frostbyte website](https://getfrostbyte.dev/pricing); the plugin never takes payments.

## ChatGPT and Codex

**ChatGPT.** Open **Plugins**, click **+**, then **Add custom MCP server**. Name it
Frostbyte, paste `https://getfrostbyte.dev/mcp`, choose OAuth, then sign in to
Frostbyte and approve access. Availability depends on your plan and workspace settings.

**Codex.** Install the plugin, then sign in to Frostbyte:

```sh
codex plugin marketplace add Sky-Enterprises/frostbyte-plugin
codex plugin add frostbyte@frostbyte-plugin
codex mcp login frostbyte
```

Your browser opens: sign in to Frostbyte and approve access, then start Codex. Check
`codex mcp list` shows `frostbyte`.

To use a token instead, for example on a machine without a browser, add your own
`frostbyte` server. It replaces the plugin's sign-in and keeps its skills:

```sh
codex mcp add frostbyte --url https://getfrostbyte.dev/mcp --bearer-token-env-var FROSTBYTE_API_TOKEN
export FROSTBYTE_API_TOKEN=<your-token>
```

Get the token from Frostbyte → Settings → Connections → Connect your agent, keep it out
of your repository, and put the `export` line in your shell profile. The same
`codex mcp add` command connects the tools without the plugin.

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

## Cursor

Cursor doesn't prompt for a token the way Claude Code does. It reads it from the
`FROSTBYTE_API_TOKEN` environment variable, so set that first:

```sh
export FROSTBYTE_API_TOKEN=paste-your-token-here
```

Get the token from Frostbyte → Settings → Connections → Connect your agent and put the
`export` line in your shell profile, then start Cursor from that shell. A Cursor opened
from the Dock or Spotlight doesn't see your shell profile on macOS, so quit it and run
`cursor .` from a terminal, or set the variable with `launchctl setenv`.

The plugin is `.cursor-plugin/plugin.json` in this repository: the same eight skills
and `.cursor-plugin/mcp.json`, which points at the hosted server. Install it from the
Cursor Marketplace once Frostbyte is listed there. Until then, to try a checkout, copy
the repository to `~/.cursor/plugins/local/frostbyte/` and reload Cursor, or add the
server alone to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "frostbyte": {
      "url": "https://getfrostbyte.dev/mcp",
      "headers": {
        "Authorization": "Bearer ${env:FROSTBYTE_API_TOKEN}",
        "X-Frostbyte-Client": "cursor"
      }
    }
  }
}
```

Check that Cursor's MCP settings show `frostbyte` as connected. Cursor doesn't expand
Claude Code's `${user_config.api_token}`, which is why Cursor has its own MCP file.

## Claude chat

Open **Settings → Connectors**, add a custom connector with
`https://getfrostbyte.dev/mcp`, then sign in to Frostbyte. Chat sessions pick a
project by name; they don't need `.frostbyte.json`.

## Grok

Open **Plugins**, click **New Connector**, then **Custom**. Name it Frostbyte,
paste `https://getfrostbyte.dev/mcp`, click **Add Connector**, then sign in to
Frostbyte and approve access. Chats pick a project by name.

## Check and recover

Ask “Can you see my Frostbyte projects?” If your projects are listed, the connection
works. Then pick the project and task you want.

- **No Frostbyte tools:** reconnect in your app's connection settings.
- **Expired or revoked access:** reconnect (OAuth, or `codex mcp login frostbyte` in Codex)
  or paste a new token (Claude Code, Codex with a token).
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

Cursor: update from Customize, or copy the new checkout over your local copy.

Codex: refresh with `codex plugin marketplace upgrade`, reinstall with
`codex plugin add frostbyte@frostbyte-plugin`, then start a new session.

## Development preview

To try a local checkout, run `claude --plugin-dir /absolute/path/to/plugin`. Trust the
folder and enter the token when asked, then confirm the lowercase server in `/mcp`;
skills loading alone doesn't mean the connection is configured.
