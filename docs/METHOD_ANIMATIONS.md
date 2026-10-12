# Method animation contract

Teach the operations a learner performs on paper, in their mathematical order. Highlighting must explain why the next mark is written, not merely decorate newly appearing ink. This contract applies to every level, worked example and recap, including method references. [UI taste](UI_TASTE.md#teaching-animation) owns presentation; [UI/UX rules](UI_UX_RULES.md) owns interaction and accessibility.

## Author the sequence before the drawing

1. Start with a checked mathematical model: operands, intermediate values, place values, result and any carry/remainder. Reuse that model for the complete static solution and the animated solution.
2. List the ordered operations, their input marks, output location and dependency on earlier outputs. An incoming carry is an input to the next operation, not a new result of that operation.
3. Separate **inspect/calculate**, **write result**, and **transfer carry/remainder** whenever they are distinct acts. Do not reveal a result or carry before its calculation. Omit transfer frames when there is nothing to transfer. Preserve meaningful zeros.
4. Define each frame's visible ink and active region from its frame data, independent of elapsed wall time or the previous DOM. Revisiting a frame must reproduce the same state.
5. Supply concise numerical explanations as a non-colour alternative. Keep completed working visible, retire the previous highlight, and retain the current explanation. Avoid pulsing or flashing.

## Topic-owned sequences

Each topic specification owns a **Method animation** section: ordered operations, highlighted inputs, revealed outputs, dependencies, carry/remainder destinations and method-specific edge cases. Review and update it alongside changes to that method. This shared document owns the repeatable process and playback contract; do not duplicate competing sequence tables here.

- [Lattice multiplication](../content/M01_lattice_multiplication.md#method-animation)
- [Bus-stop division](../content/M02_bus_stop_division.md#method-animation)
- [Solving equations](../content/M10_solving_equations.md#method-animation)

## Implementation boundaries

- `arithmetic-demo.mjs` and `equation-demo.mjs` create deterministic ordered frames from method data. Arithmetic uses the existing logical `step`/`count`, plus explicit operation `phase`, cell identity and carry target where required. Logical steps still drive guidance and Previous/Next; operation phases drive highlights and fine-grained playback.
- `ArithmeticWorking` and `EquationWorking` render a complete state for any frame. Drawing coordinates stay with the renderer; mathematical ordering stays with the model. No DOM inspection decides the next mathematical operation.
- `ShowDemo` and the shared player own timing, pause, speed, replay, step navigation and disposal. Highlight changes use the same frame cursor as ink; no separate highlight timer. `demo-motion` interpolates newly written ink only.
- Reuse semantic theme colours for a restrained fill and outline. Keep numerals legible over highlighted regions. The region/outline and numerical explanation supplement colour; static feedback and topic previews remain complete and unhighlighted.
- Reduced motion removes interpolation, not instructional frames or explanations. Pausing retains the current highlight. Speed changes affect time only. Replay resets both ink and highlights. Manual logical-step navigation presents a coherent completed step. No frame scrolls or moves keyboard focus.

## Repeatable review and evidence

For a new method or a changed sequence, review its operation table before coding. For every current example/recap and level, check mathematical dependencies and answer equality. Include an explicit carry example, a zero/no-carry case and any applicable decimal or remainder boundary; do not rely on one visually convenient example.

Pure sequence checks establish calculation → write → transfer order and validate carries against the next place. Browser checks establish that the prescribed region and new ink appear in those frames, earlier results remain visible, future results are absent, and final rendering is complete. Capture representative input, result and carry frames at phone width; inspect them for ambiguous highlight extent, contrast, cramped digits or clipping.

Reuse existing playback checks for pause/resume, speed, replay, stepping, reduced motion, method references and stable scroll. Run change-selected verification; do not add a separate animation engine or an unrelated test programme. Record evidence and any unverified limitation in HANDOFF/DEV_LOG. A new topic is not animation-complete merely because it plays without errors.
