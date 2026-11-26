# Known bugs and gaps

This is the follow-up list for the [reactivity overview](reactivity-overview.md). It distinguishes limitations documented by skipped reproductions from older reports that still need revalidation. An active regression test is evidence of intended coverage, not by itself proof that every related case works.

Historical behavior and design rationale are in the [decision log](decision-log.md).

## Kept offscreen, but paused

Status: documented limitation with skipped reproductions.

A committed update can remove a branch or each item that a pending batch still selects. The content is retained offscreen but remains paused. If the pending batch's view changes, it does not update that content or restart its async work before committing it. The content can therefore reappear stale and only update in a subsequent batch.

For example, one batch hides a branch, another pending batch keeps it, and a third commits a value used inside it. The pending batch should refresh the retained branch and wait for its async work before showing it again.

Reproductions:

- [Conditional branch](../../packages/svelte/tests/runtime-runes/samples/async-if-branch-kept-offscreen-live/)
- [Each item](../../packages/svelte/tests/runtime-runes/samples/async-each-item-kept-offscreen-live/)

Both samples are currently skipped. A fix needs to cover the time during an outro as well as the time after content has moved offscreen. It must also preserve transition behavior and prevent batches that did not select the retained content from processing it. The associated design constraint is described in the [decision log](decision-log.md#separate-branch-selection-visibility-and-lifetime).

## Cleanup of paused effects

Status: documented limitation with a skipped reproduction.

An effect paused during an outro does not rerun when its dependencies change. If the batch containing those changes commits before cleanup, the effect can lose access to its previous values, and its teardown sees a newer value than the effect's last run did.

The [paused-effect teardown sample](../../packages/svelte/tests/runtime-runes/samples/effect-teardown-paused-old-value/) records this separate cleanup limitation and is currently skipped.

## Older reports needing revalidation

These reports came from the original batch-view notes. They are not confirmed current bugs, and their old comparisons with other branches should not be treated as current status.

| Area                             | Open question                                                                                                               | Available evidence                                                                                                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overtaken forks                  | Does the originally reported equal-value case still lose content when a fork is overtaken by the real world?                | The original `async-fork-obsolete-equal-values` reproduction is not present. Related obsolete-fork tests are not a substitute for its exact scenario.                                                                                                                                            |
| Adoption of fork-created content | Are component and nested-branch adoption safe across fork discard and reprocessing, without tearing or repeated async work? | [Each-item adoption variants](../../packages/svelte/tests/runtime-runes/samples/async-fork-each-item-adopted-variants/) and other adoption samples are active. Some originally named component and nested-branch reproductions are absent, so a blanket adoption-failure claim is not justified. |
| Render-effect ordering           | Can a render effect in a newly created branch run before existing effects that should precede it?                           | The original `new-render-effect-order` sample is absent. Restore a minimal reproduction before treating this as an open ordering bug.                                                                                                                                                            |
| Error recovery in a fork         | Does assigning to an errored writable derived inside a fork recover correctly?                                              | Ordinary assignment recovery has active [coverage](../../packages/svelte/tests/runtime-runes/samples/writable-derived-assign-after-error/); the old fork-specific crash needs a matching reproduction.                                                                                           |
| Superseded async completion      | Can completion of a superseded but non-aborted run still cause avoidable processing?                                        | [Stale aborted resolution](../../packages/svelte/tests/runtime-runes/samples/async-abort-signal-stale-resolution/) checks that no observable work restarts in the aborted case. It does not count all internal processing or establish the broader claim.                                        |

## Coverage and measurement gaps

- **Tracing across views:** some development tracing highlights still fall back to ordered version comparisons. The earlier notes identified older versions restored by a view or committed fork as cases that may not be highlighted. This needs focused validation; it is separate from runtime freshness checks.
- **Retained-content isolation:** the earlier offscreen notes raised an untested case for retained dynamic-element content being processed by a batch that did not select it. Revalidate this alongside the paused-content issue rather than assuming every retained branch has the same behavior.
- **Test relevance:** review whether sample setups still exercise their intended behavior. Coverage should not be inferred solely from a test's name or the mechanism it originally targeted.
- **Performance:** heap retention and workloads with many overlapping batches still need measurement. Historical synchronous benchmarks and bundle sizes in the decision log are not current measurements of these costs.
- **Untriaged follow-up:** the original notes linked [#18997](https://github.com/sveltejs/svelte/issues/18997) without a local reproduction or diagnosis. Its current status has not been assessed here.
