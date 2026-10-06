# Maths practice: project instructions

Help Foundation GCSE learners working around grades 2–3 build towards grade 4+. Use short revision activities, accessible arithmetic and varied mathematical thinking. Computing provides lesson time, not subject matter; do not assume an exam board. Follow prerequisite teaching order rather than module IDs.

## Read only what the task needs

Start with [HANDOFF.md](HANDOFF.md) for current state. [docs/INDEX.md](docs/INDEX.md) routes to **every project Markdown document**, grouped by development area; do not read the entire documentation set by default.

| Work | Read next |
| --- | --- |
| Product/behaviour | [User specification](web_format.md), then relevant [standing decisions](docs/UI_UX_RULES.md) |
| Implementation | [Code style requirements](docs/CODE_STYLE.md), [website architecture/run guide](website/README.md) and [framework development skill](.agents/skills/maths-framework-development/SKILL.md) |
| Verification or a longer task | [Efficient development/testing skill](.agents/skills/maths-efficient-development/SKILL.md) |
| Future features/scoring | [Roadmap and interpretations](docs/WEBSITE_PLAN.md) |
| Content/questions/answers | [Teaching/source map](docs/INDEX.md#teaching-content), then the relevant topic and specifications |
| Earlier decisions or failures | [DEV_LOG.md](DEV_LOG.md); use Git for full prior versions |
| Publishing to GitHub | [Publishing instructions](.github/PUBLISHING.md), including applying repository topics |
| Slides or source-deck audit | [Legacy resources](legacy/README.md); do not run old publishers during website work |

## Authority and preservation

- Latest user decisions take precedence. `web_format.md` is directly authored and protected: do not edit it without explicit permission. Preserve other directly authored documents too; uncertain authorship is not permission to rewrite them. Its planning-era migration wording is superseded by the user's later implementation authorisation and saved-data waiver, recorded in DEV_LOG.
- Website delivery is primary. Keep authored content in `content/`, the app in `website/` and saved slide resources in `legacy/`. Preserve question IDs, accepted mathematics, manual deck edits, answers, checks and explanations. Audit source against saved decks before importing another topic.
- Defaults must meet contrast requirements. User theme adjustments are unrestricted by explicit decision; do not reopen their lower contrast as a defect or approval gate. Exact theme colours/gradients and intended layout remain the visual baseline.
- Preserve current schema-2 progress during ordinary fixes. Migration of old schema-1 profiles/attempts was explicitly waived. Avoid speculative compatibility layers or defensive abstractions.
- Use Git for history, not `_prevN`/version stacks. No slide regeneration, publication, deployment or unrelated edits as side effects.

## Work and record efficiently

Use the two project-local skills above when relevant; they live in `.agents/skills/` for repository-level discovery by Codex and VS Code Copilot; no global installation is required. Default to `npm run verify:changed` from website/; the cached dependency map selects checks. Inspect only named failures; do not repeat unchanged passing suites. Do not expand a status request into a new verification programme.

Keep responsibilities distinct: standing requirements in UI_UX_RULES; dated decisions/progress/issues in DEV_LOG; **only current state and next steps in HANDOFF**. Update HANDOFF at meaningful milestones during longer work, before a risky transition or pause, and at the end—not just when a session finishes. Record incomplete edits, running processes, last evidence, failures and exact next action so interruptions are recoverable. Never disguise an untested change as verified or overwrite historical results with present-tense claims.

HANDOFF should normally include a short, ordered outline of the logical next work slices, not just a backlog or the immediate next command. State each slice's outcome, dependencies and decisions still needed; distinguish proposed later work from authorised work. Refresh the outline when priorities change.

When adding/removing documentation, update INDEX; link rather than duplicate rules. Keep skill instructions narrow and concise.
