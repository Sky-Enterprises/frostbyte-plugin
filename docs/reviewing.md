# Review the 0.9.0 candidate

The exact prompts and expected tool calls are packaged in `plugin.json` under
`extensions.com.openai.review.test_cases` (five positive, three negative). Results
belong in the execution evidence, not invented fields in that schema.

Use a dedicated paid demo account and a clean **Plugin Demo** project.
Create **Projects** and **Docs** areas, active **v1.17.0**, upcoming **v1.18.0** and
**v1.19.0**, and a To Do **Improve setup checklist** task with a small disposable
repository change and an agreed check. Keep GitHub sync and portal notifications
off. The named-release regression creates a demo Grok task; do not alter FB-331.
Record actual IDs privately in execution notes so each host targets fixtures.
Reset by moving/renaming fixture tasks with an explicit instruction; never delete
production records as test cleanup.

Run P1–P5 and N1–N3 on ChatGPT, Codex, Claude chat and Claude Code. Additionally:

| Case | Observable result |
| --- | --- |
| S1 Signals | Supported list/review/link/unlink tools work after explicit review intent; approved unnamed-release work uses null/Backlog. |
| R1 Pending checks | A task stays In progress while its required test or requested review is outstanding. |
| R2 Release proposal | An all-done release prompts readiness discussion/draft only; no independent completion or notification. |
| R3 Linking | Linked root/nested path use nearest link inside `.git` boundary; opt-out/unlinked/unavailable tools produce no fake tracking or repeated offers. |
| R4 Access | Expired/revoked connection reconnects through the host; free/non-member accounts stay gated. |

A backend placement integration test protects persistence. A natural-language host
run protects argument choice. Neither substitutes for the other. Record host,
version/SHA, prompt, actual calls/arguments, read-back and Passed/Failed/Blocked/Not
run. A current development connection is not a clean installation of the candidate.

## Walkthrough to rehearse and record

1. Show the installed candidate version and sign-in without displaying credentials.
2. Ask P1. Pause on the real recommendations; show that no task started.
3. Ask P2 against the sample repo. Show In progress while the agreed check is pending,
   then the successful check and factual completion. Open the resulting board.
4. Ask P3 naturally. Open/read back the demo task's v1.18.0 release and Projects area.
5. Ask P5. Show the factual draft and unchanged release state.
6. Ask N2 or N3. Show the purchase boundary or exact-item clarification without writes.

Capture real prompts, tool results and the resulting board/release state. Use a
recorder that can capture the intended host. Computer control and screenshots do
not alone provide video capture. Play back the saved recording, check readable
text and absence of private data, then host it at a reviewer-accessible destination
and verify playback without creator login. Only then set `review.demo_recording_url`
and rebuild the package. A script or local capture is not a verified recording URL.

Provide reviewer credentials only through the secure portal fields. Verify that
reviewers can log in and run the cases without the owner's mailbox, phone, social
account or private network. Do not put credentials in Git, the ZIP or this document.

## Listing and launch

Publisher requested: **Sky Enterprises**; the portal's verified identity still needs
confirmation. All supported countries are intended; the OpenAI package uses an
empty country allowlist (unrestricted). Verify the saved targeting in each portal.
No in-agent purchases/payments; a website subscription is required. Legal attestations
must be completed by the developer. Published privacy/terms URLs are present, but
policy coverage and attestations are distinct from a successful HTTP response.

Directory submission, review approval and publication are separate milestones.
Keep all four surfaces coordinated and record their state independently. Do not
claim directory availability from a ZIP, a GitHub tag, an upload or a passing scan.

The commerce boolean is deliberately omitted until the target portal question is inspected. The package declares the website subscription requirement and absence of in-agent payments in commerce_description; confirm the actual saved question before selecting its boolean.
