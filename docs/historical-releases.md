# Historical plugin releases

Audited 28 October 2026 against remote tags/releases and first-parent main. These are decided actions, not yet published. Existing tags are preserved even when inconsistent. Candidate 0.9.0 consolidates unpublished 0.8.2/0.8.3 branch work.

| Version | Introducing main commit | Later same-version main state | Existing remote tag | Existing release | Proposed target SHA and action |
| --- | --- | --- | --- | --- | --- |
| 0.1.0 | `6e3be8a2e83bdee856ff5942677ba0dd94340ad6` | `5311f420b8f2e36b2495e4635660248700787609` | Missing | Missing | `6e3be8a2e83bdee856ff5942677ba0dd94340ad6`: Tag and release at introducing main commit (decided) |
| 0.2.0 | `2b3d424cd214d6d7cbe5c24f34ad3554e2e117bb` | `2b3d424cd214d6d7cbe5c24f34ad3554e2e117bb` | Missing | Missing | `2b3d424cd214d6d7cbe5c24f34ad3554e2e117bb`: Propose tag and release at introducing main commit |
| 0.3.0 | `91b02fc59719621a1ac6fb39ce68eb0649d54584` | `622422c2be32ffcebf64b6e77eef49fd53131f52` | Missing | Missing | `91b02fc59719621a1ac6fb39ce68eb0649d54584`: Propose tag and release at introducing main commit |
| 0.3.1 | `a2c17ee361773d76dd90b1ad5c01cfa0589dec35` | `a2c17ee361773d76dd90b1ad5c01cfa0589dec35` | Missing | Missing | `a2c17ee361773d76dd90b1ad5c01cfa0589dec35`: Propose tag and release at introducing main commit |
| 0.4.0 | `dd34d1d1d02c99f27cac0c43c03f346a05bd0736` | `dd34d1d1d02c99f27cac0c43c03f346a05bd0736` | Missing | Missing | `dd34d1d1d02c99f27cac0c43c03f346a05bd0736`: Propose tag and release at introducing main commit |
| 0.4.1 | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | Missing | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23`: Prepare release notes for existing tag; preserve SHA |
| 0.4.2 | `1a16a64a29c49c5b283b3e4bdad4686ca36cd50d` | `05486947bce957de734324500ec708b84a38d0ac` | `1a16a64a29c49c5b283b3e4bdad4686ca36cd50d` | Missing | `1a16a64a29c49c5b283b3e4bdad4686ca36cd50d`: Prepare release notes for existing tag; preserve SHA |
| 0.4.3 | `f87c8abd2230541696c70e114a8b9191ed15098a` | `f87c8abd2230541696c70e114a8b9191ed15098a` | `05486947bce957de734324500ec708b84a38d0ac` | Missing | `05486947bce957de734324500ec708b84a38d0ac`: Keep tag unchanged; no release (decided). Tag manifests say 0.4.2 |
| 0.4.4 | `767b1fa855bb471976bae85e48f62e574d4620b2` | `767b1fa855bb471976bae85e48f62e574d4620b2` | `f87c8abd2230541696c70e114a8b9191ed15098a` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.4.4) | `f87c8abd2230541696c70e114a8b9191ed15098a`: Keep tag and release unchanged (decided). Tag manifests say 0.4.3 |
| 0.5.0 | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.5.0) | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55`: Preserve existing release/tag |
| 0.6.0 | `55417f885b949ebf9cb2839dd359709553af46f0` | `55417f885b949ebf9cb2839dd359709553af46f0` | `55417f885b949ebf9cb2839dd359709553af46f0` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.6.0) | `55417f885b949ebf9cb2839dd359709553af46f0`: Preserve existing release/tag |
| 0.6.1 | `d4d14a2d75a8d0e74a673581167efd9d7836a93c` | `d4d14a2d75a8d0e74a673581167efd9d7836a93c` | Missing | Missing | `d4d14a2d75a8d0e74a673581167efd9d7836a93c`: Propose tag and release at introducing main commit |
| 0.6.2 | `1091a3c70afd33a6f77c642947d0306dba893754` | `373a3513c8893ee40aa89e6c41bdfd7d57c04202` | Missing | Missing | `1091a3c70afd33a6f77c642947d0306dba893754`: Propose tag and release at introducing main commit |
| 0.7.0 | `d6cb4649cdc612e22c1fc382db6616c27576ab4a` | `d6cb4649cdc612e22c1fc382db6616c27576ab4a` | Missing | Missing | `d6cb4649cdc612e22c1fc382db6616c27576ab4a`: Propose tag and release at introducing main commit |
| 0.8.0 | `3dab813ef6f1391d0b09211334036f03a7d80319` | `3dab813ef6f1391d0b09211334036f03a7d80319` | Missing | Missing | `3dab813ef6f1391d0b09211334036f03a7d80319`: Propose tag and release at introducing main commit |
| 0.8.1 | `150a5513f174881f4660b6e791c82645f48d659b` | `150a5513f174881f4660b6e791c82645f48d659b` | Missing | Missing | `150a5513f174881f4660b6e791c82645f48d659b`: Propose tag and release at introducing main commit |

The 0.6.2 main state includes PR #4 and the PR #2 attachment merge after its 0.7.0 feature bump was reset. Its final main SHA is 373a3513c8893ee40aa89e6c41bdfd7d57c04202. PR #3 then consolidates the unreleased skills into main 0.7.0 at d6cb4649cdc612e22c1fc382db6616c27576ab4a.

Intermediate merged-branch evidence (not extra releases):

| Commit | Manifests | Interpretation |
| --- | --- | --- |
| 8f8b409ba07b2930a987459537e9646ca4d56d70 | both 0.7.0 | Attachment branch bump, reset before its main merge |
| b4c0bec3b6e6b331b46124f202486b16989984a6 | both 0.6.2 | Reset attachment branch to leave release selection to a release PR |
| 58651251f8c97cdb3f975786121854de6275b2c9 | both 0.8.0 | Intermediate Signals branch bump, superseded before merge |
| 65985b7ee7101e81be6a16d2e7de26d3a0bfce77 | both 0.7.0 | Consolidated unreleased skills, merged as main 0.7.0 |
| faf17daa3d8c78bce7fd0f76d2fb25226b7109a6 | both 0.8.0 | Links feature, merged as main 0.8.0 at 3dab813ef6f1391d0b09211334036f03a7d80319 |

Subjects alone are not version evidence. Missing-tag targets use the introducing first-parent main release commit, not later unreleased same-version work. Existing tags retain their SHAs. In particular, historical 0.6.2 targets 1091a3c70afd33a6f77c642947d0306dba893754; the later attachment/gap-tool merges belong to the consolidated 0.7.0 notes. 0.1.0 uses the initial package merge, matching the introducing-commit rule; the later same-version cleanup is folded into it. For 0.3.0, the later alternative changes only the changelog.

Decided 2026-10-28: both mismatched tags stay where they are. v0.4.3 gets no release, because a release on that tag would label 0.4.2 code as 0.4.3. The published v0.4.4 release is left unedited. No tag is moved or deleted, and no corrective tag is created; this map and CHANGELOG.md hold the accurate version history.

Exact proposed notes for each version are stored in historical-releases.json. Approve each action and SHA before public writes; the 0.9.0 publication command does not backfill history. Historical archives retain their original content and may not meet current marketplace requirements.
