# Session handoff — 20 September 2026

Read [AGENTS.md](AGENTS.md) first. It was shortened and updated; [old_agents.md](old_agents.md) is the exact archived predecessor, not active guidance. Detailed teaching and layout requirements are linked from AGENTS.

## Current state

| Topic | Current outputs / state |
| --- | --- |
| M01 lattice, M02 bus stop, M03 applications | Existing questions accepted. Preserve the consolidated deck and its initial assessment. Answer Markdown exists; separate answer slides still need development. |
| M04 ratio | Questions v7, answers v6, matching PDFs in [topics/ratio](topics/ratio/README.md). Revised question variety, approved arrows and four-question initial assessment are included. No outstanding requested fix. |
| M13 signed addition/subtraction | Questions v4, answers v1, matching PDFs in [topics/signed_numbers](topics/signed_numbers/README.md). Questions accepted; rules recap added; final tick-label correction accepted. No outstanding requested fix. |
| Other topics | Drafts/plans, not finished decks. Check the content before treating it as approved or meeting current requirements. |

## Next work

Follow the prerequisite-led [teaching sequence](content/TOPIC_PLAN.md#teaching-sequence--foundations-before-applications). The next unbuilt arithmetic set is [M14 signed multiplication/division and order of operations](content/M14_signed_multiplication_division_and_order.md), then fraction arithmetic. Review its older draft for current variety requirements, add the four-question assessment and a clear recap, and ensure complete separate diagnostic answers. Do not assume the older draft already includes those changes.

The user prefers PowerPoint for easy review of M13 and authorised that exception to Markdown-first approval. Maintain exact Markdown for all topics; follow the user's requested review format without repeated confirmation. No request to build M14 has been executed yet.

## Decisions to carry forward

- Each topic begins with four assessment questions: two Guided level, one Core, one Depth; no hints. Assessment answers stay in the separate deck.
- Recap rules clearly; use an extra recap slide when needed. Keep the worked demonstration intact.
- Tick labels centre the digit portion only; a negative sign extends left. This is implemented in the M13 generator and questions v4.
- Progression arrows are the approved thick curved light-peach shapes, without text; use stored grid-relative offsets.
- Once individual topic decks are finalised, the single compiled question PowerPoint must follow the agreed teaching sequence. The separate compiled answer deck uses the same topic order. Preserve each topic's assessment and internal slide order. Module IDs and build dates do not set compilation order.

## File safety

Topic READMEs identify current versions and generator limitations. Some scripts still overwrite fixed versions: inspect them before running. The older consolidated builder would lose the added assessment; the old assessment script is not repeat-safe. Preserve manual edits and existing outputs, saving new versions. Historical OneDrive read/write issues occurred; save through a temporary file and verify saved bytes when needed.

Do not treat historical “approval pending”, “current version” or “no slides built” notes appended in old content as more recent than this handoff and the current topic READMEs. Check the latest user direction if the task changes.
