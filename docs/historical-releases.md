# Historical plugin releases

Audited 28 October 2026 against remote tags/releases and first-parent main. These are proposed actions, not publication. Existing tags are preserved even when inconsistent. Candidate 0.9.0 consolidates unpublished 0.8.2/0.8.3 branch work.

| Version | First main commit | Final main commit before next version | Remote tag | GitHub release | Proposed action |
| --- | --- | --- | --- | --- | --- |
| 0.1.0 | `6e3be8a2e83bdee856ff5942677ba0dd94340ad6` | `5311f420b8f2e36b2495e4635660248700787609` | Missing | Missing | Propose tag and release at final main commit |
| 0.2.0 | `2b3d424cd214d6d7cbe5c24f34ad3554e2e117bb` | `2b3d424cd214d6d7cbe5c24f34ad3554e2e117bb` | Missing | Missing | Propose tag and release at final main commit |
| 0.3.0 | `91b02fc59719621a1ac6fb39ce68eb0649d54584` | `622422c2be32ffcebf64b6e77eef49fd53131f52` | Missing | Missing | Propose tag and release at final main commit |
| 0.3.1 | `a2c17ee361773d76dd90b1ad5c01cfa0589dec35` | `a2c17ee361773d76dd90b1ad5c01cfa0589dec35` | Missing | Missing | Propose tag and release at final main commit |
| 0.4.0 | `dd34d1d1d02c99f27cac0c43c03f346a05bd0736` | `dd34d1d1d02c99f27cac0c43c03f346a05bd0736` | Missing | Missing | Propose tag and release at final main commit |
| 0.4.1 | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | `73b3f1dacef4d32ec4dc27d3d3fb401af82d3e23` | Missing | Prepare release notes for existing tag; preserve SHA |
| 0.4.2 | `1a16a64a29c49c5b283b3e4bdad4686ca36cd50d` | `05486947bce957de734324500ec708b84a38d0ac` | `1a16a64a29c49c5b283b3e4bdad4686ca36cd50d` | Missing | Prepare release notes for existing tag; preserve SHA |
| 0.4.3 | `f87c8abd2230541696c70e114a8b9191ed15098a` | `f87c8abd2230541696c70e114a8b9191ed15098a` | `05486947bce957de734324500ec708b84a38d0ac` | Missing | HOLD: tag manifests say 0.4.2; preserve tag, ask for correction strategy |
| 0.4.4 | `767b1fa855bb471976bae85e48f62e574d4620b2` | `767b1fa855bb471976bae85e48f62e574d4620b2` | `f87c8abd2230541696c70e114a8b9191ed15098a` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.4.4) | HOLD: tag manifests say 0.4.3; preserve tag, ask for correction strategy |
| 0.5.0 | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | `d1b6b56524d8e74572ee5bb12fb8e4b8ef192d55` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.5.0) | Preserve existing release/tag |
| 0.6.0 | `55417f885b949ebf9cb2839dd359709553af46f0` | `55417f885b949ebf9cb2839dd359709553af46f0` | `55417f885b949ebf9cb2839dd359709553af46f0` | [Existing](https://github.com/Sky-Enterprises/frostbyte-plugin/releases/tag/v0.6.0) | Preserve existing release/tag |
| 0.6.1 | `d4d14a2d75a8d0e74a673581167efd9d7836a93c` | `d4d14a2d75a8d0e74a673581167efd9d7836a93c` | Missing | Missing | Propose tag and release at final main commit |
| 0.6.2 | `1091a3c70afd33a6f77c642947d0306dba893754` | `373a3513c8893ee40aa89e6c41bdfd7d57c04202` | Missing | Missing | Propose tag and release at final main commit |
| 0.7.0 | `d6cb4649cdc612e22c1fc382db6616c27576ab4a` | `d6cb4649cdc612e22c1fc382db6616c27576ab4a` | Missing | Missing | Propose tag and release at final main commit |
| 0.8.0 | `3dab813ef6f1391d0b09211334036f03a7d80319` | `3dab813ef6f1391d0b09211334036f03a7d80319` | Missing | Missing | Propose tag and release at final main commit |
| 0.8.1 | `150a5513f174881f4660b6e791c82645f48d659b` | `150a5513f174881f4660b6e791c82645f48d659b` | Missing | Missing | Propose tag and release at final main commit |

0.7.0 includes multiple merges (Signals, attachments and gap tools); use the final first-parent commit, not an intermediate feature-branch bump. 0.8.0 similarly uses the final main state. Subjects alone are not version evidence.

The existing v0.4.3 tag also mismatches: it points to a main commit with 0.4.2 manifests; retain it and resolve the annotation strategy before publication. The v0.4.4 release/tag has mismatched manifests and must not be force-moved. Options for approval: retain it as historical reality and annotate its release notes, or publish a separately named corrective historical reference. No action chosen here.

Exact proposed notes for each version are stored in historical-releases.json. Approve each action and SHA before public writes; the 0.9.0 publication command does not backfill history. Historical archives retain their original content and may not meet current marketplace requirements.
