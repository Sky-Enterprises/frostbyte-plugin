# Prepare and release the plugin

The plugin version is independent of Frostbyte's application version. This candidate
is plugin **0.9.2**, supporting the application **v1.17.0** and companion MCP **1.5.1**. Production **1.5.0** already supplies Signals and What’s Next; deploy the companion app changes before final host verification/submission.

## Prepare

Use Node 22 or newer, Git, zip and unzip. Install development dependencies with
`npm ci --ignore-scripts`. They are never shipped inside the plugin.

1. Reconcile feature branches on a release branch. For this initiative, PRs #6 and
   #7 remain intact; the candidate is stacked on #7 and includes the separate local
   pasted-task tracking commit. Merge #6, then #7, then the candidate after review.
   Recheck their bases after each merge. Do not publish intermediate 0.8.2/0.8.3.
2. Choose the version deliberately. Update `plugin.json`, both compatibility
   manifests, both Claude marketplace version fields and the changelog together.
   Use patch for fixes and minor for compatible additions. For an incompatible
   contract, explicitly choose a major bump and document migration; there is no
   bot restricting releases to patch/minor. The 0.x identifier migration in 0.9.0
   is documented in setup. Never change the version of already published bytes.
3. Run `npm run check`, `npm test` and `claude plugin validate .` where available.
   The pinned portable schemas are copied unchanged from agent-plugins.org 1.0.0.
   OpenAI's documented MCP server extension is validated separately because the
   portable 1.0 MCP schema currently rejects extension keys.
4. Commit source and run:

   ```sh
   npm run prepare:release -- --ref FULL_COMMIT_SHA --out /tmp/frostbyte-candidate
   ```

   This reads the immutable Git tree, uses a positive file inventory, parses YAML
   and JSON, checks assets/auth/versions, creates two archives, extracts both and
   validates their actual contents and byte checksums. It writes `candidate.json`
   and `release-notes.md`. Rerunning the same commit produces identical archives.
   The OpenAI archive excludes every local hook, compatibility token config and
   marketplace; Claude keeps its sensitive user-config token and literal hook.
5. Review that exact receipt, notes and final inventories. Run host installation,
   authentication and natural-language cases against this candidate. A package
   parser pass does not prove an installed host works. Complete the launch sheet.

CI checks PRs and prepares downloadable artifacts on main. It has read-only contents
permission and cannot push tags or create releases. There is no automatic public
publication on merge. Main preparation is an unpublished candidate artifact, not a
public GitHub draft or marketplace submission.

## Approval and publication

Before publishing, show Thomas the exact new version/SHA, notes, asset
names/checksums and coordinated marketplace actions. Past releases follow
[historical-releases.md](historical-releases.md); its two tag mismatches stay as
published. Never force-move/delete those tags.

After merge, **prepare again at the exact remote main SHA** and obtain approval for
that receipt. A reviewed feature SHA does not automatically approve new merge bytes.
With explicit approval, the single publication trigger is:

```sh
node scripts/release.mjs publish --out /tmp/frostbyte-candidate \
  --approved-sha FULL_APPROVED_MAIN_SHA --approved-receipt SHA256_OF_CANDIDATE_JSON
```

This verifies remote main, rebuilds and compares the receipt/notes/assets, rejects a
conflicting tag, creates an immutable tag once and creates the GitHub release with
its exact assets. A retry preserves existing releases and stops for inspection;
it never overwrites assets or a draft. GitHub release publication does not publish
the marketplace listing. Historical backfills are separate approved actions; this
command does not infer or execute them.

## Platform updates and recovery

- **OpenAI:** use the existing submission identity through **With MCP**, hosted OAuth,
  and shared skills. Uploading a draft, submitting for review and publishing approval
  are distinct actions. Hosted-tool updates and package skills/assets/metadata have
  different update procedures. Replacing a ZIP can reset attestations; inspect the
  saved draft first. Never cancel an in-review version without authorisation.
- **Claude directory:** inspect the existing identity and tracked branch/publish
  setting. Prefer release-ready main after agreement. Scheduled/webhook scans can
  publish a passing version according to that setting; verify it before merging.
  Do not confuse the directory with Anthropic's curated `claude-plugins-official`.
- **Claude Code:** custom marketplace users control refresh/auto-update. See setup.
- **Codex local:** installed copies live in the host cache. Refresh/reinstall them;
  a source checkout edit alone does not update an installed package.

If preparation fails, publish nothing. Retain the last known-good revision and
receipt. If review is held, keep the live version and address the finding. Correct
a bad publication through a new version or a supported directory rollback; never
rewrite public tags or assume a source revert changes the live listing.

Official references, checked 28 October 2026:
[OpenAI package](https://developers.openai.com/plugins/build/plugins),
[submission](https://developers.openai.com/plugins/deploy/submission),
[OAuth](https://developers.openai.com/plugins/build/auth),
[MCP review](https://developers.openai.com/plugins/deploy/app-review),
[Claude directory](https://claude.com/docs/plugins/submit),
[Claude Code distribution](https://code.claude.com/docs/en/plugins/publish).
