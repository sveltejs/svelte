# Reactivity decision log

This log collects the rationale and historical notes behind the [reactivity overview](reactivity-overview.md). It is not a chronological changelog or a description of every implementation detail. Comparisons with earlier implementations describe the work recorded in the original batch-view notes, not the current state of other branches.

Outstanding limitations and uncertain claims belong in [known bugs and gaps](known-bugs-and-gaps.md).

## Validate runs with exact dependency versions

Earlier freshness checks relied on a dependency being newer than a reaction's last evaluation. That works along a single forward-moving timeline, but a batch's view can restore older values or apply values allocated earlier by a fork.

The runtime instead records the version of each dependency and checks for equality in the active view. This also lets it avoid restarting async work when a potentially affected run still has the same inputs. Comparing values directly was considered, but would retain those values for the lifetime of a run and would need to preserve notification semantics for mutable values and stores.

Version order still has narrower uses, such as identifying writes made during cleanup or after an assignment to a derived. Evaluation time is not sufficient evidence that a derived's inputs were written later.

## Keep ordered reads separate from notification edges

Different views can take different paths through a reaction and read dependencies in different orders. A run therefore keeps its own ordered reads, while the notification graph retains the dependencies of all live runs.

Combining the two required rearranging shared dependencies during promotion and late reads. Separating them preserves each run's read order and allows graph connections to outlive any one run. Unused connections are pruned to limit unnecessary checks and retention.

## Retain runs separately from the active view's cache

A batch can be processed more than once while it waits for async work. Its records preserve still-valid computations and branch selections across those passes. Replaced global derived runs can also be retained for views that still need them.

The active view has a separate, shorter-lived derived cache. Without it, repeatedly validating shared dependency trees can become excessively expensive. Earlier implementations mixed cached computations with writes; separating them avoids confusing invalidation of a computation with removal of an assignment.

When a retained run becomes applicable to the real world, adopting its value and version avoids repeating work. Fork commit preserves versions for the same reason: preloading would be much less useful if committing restarted it.

## Scope invalidation to the batch being processed

A shared dirty flag cannot express that a reaction is current in one view but stale in another. Pending marks are therefore held for the relevant batch, and reactions are revalidated when its view changes.

Earlier implementations forced block and async effects to rerun on commits and rebases. Exact checks make those forced reruns unnecessary and prevent avoidable async restarts. An explicit deferred-work queue is still needed for work not reachable from the batch's own writes, including newly created, resumed and deferred effects.

Even an ordinary batch that is currently alone retains block and async runs: another batch can begin while it is waiting, so its initial isolation is not a lasting guarantee.

## Keep async results owned by their runs

An async result belongs to the batch whose inputs produced it, even when it equals the latest value. Otherwise view construction and merging could lose track of which update owns it.

Earlier commits handed results to pending runs in other batches and relied on forced reruns to repair differences. That is not valid when another batch's run still applies to different inputs. Independent runs keep their results; merging explicitly combines the relevant work.

Abort signals follow run ownership as well. A replacement should cancel work it supersedes, not work that another independent view still needs. When cancellation replaces work needed by a suspended script, the replacement and waiting batch must be coordinated so the script can continue even if the cancelled promise never settles.

## Separate committing writes from finishing all pending work

A pending boundary lets a batch render other content before all its async work finishes. Once those writes are committed, they become part of other batches' baseline, even if the original batch remains alive for later results.

Earlier behavior kept undoing such writes until the batch was completely finished. That let the DOM show committed values while other batches still computed without them, and could recreate branches and restart their requests.

A boundary's readiness is now tracked by batch, and revealing its content is part of commit rather than speculative traversal. This separates speculative readiness from permission to change the real DOM. Completion also needs a real-world processing opportunity rather than relying on a fork that may have been discarded.

## Associate first awaited values with the script's continuation

A component script continues imperatively only once, while its reactive expressions can run in multiple views. Letting whichever result arrives first resume the script in its creator's view mixed values from different batches.

First results are coordinated with the batch that continues the script, with replacement results available when the creator's run becomes obsolete. Template content is prepared and revalidated in the view that supplies its values.

The old notes listed pending-boundary and first-value failures as open. The current source has the coordination above and active regression samples, including [fork boundary isolation](../../packages/svelte/tests/runtime-runes/samples/async-fork-pending-boundary-run/), [speculative branch hiding](../../packages/svelte/tests/runtime-runes/samples/async-fork-hide-pending-branch/) and [later-batch script results](../../packages/svelte/tests/runtime-runes/samples/async-resume-script-later-batch/). Those old failure descriptions are not carried forward as confirmed current bugs.

## Separate branch selection, visibility and lifetime

A block's retained run describes what it selected in a view. Offscreen branch management controls which batches may process the branch and when its DOM becomes visible. Neither mechanism replaces the other.

Earlier commits assumed that older batches would rerun their blocks and could therefore lose their selections. With exact validation, an unchanged run remains valid, so its branch must survive too. Adopting a branch prepared by another batch requires checking its contents in the adopting view.

Pausing content for transitions is a separate concern from retaining it for a pending batch. Simply resuming retained content can replay intros or leave transition state inconsistent. The remaining liveness problem is recorded in [known bugs and gaps](known-bugs-and-gaps.md#kept-offscreen-but-paused).

## Give cleanup its own view

The cleanup view is intended to give teardowns the values associated with the effect they clean up, including objects whose removal triggered destruction. It reverts the responsible writes while preserving writes made during cleanup itself. The remaining [paused-effect limitation](known-bugs-and-gaps.md#cleanup-of-paused-effects) is tracked separately.

Deriveds evaluated only for cleanup must not replace ordinary runs. Nested cleanup and flushes also need to restore their enclosing views. A separate cleanup context keeps these temporary computations out of global and batch state.

## Preserve common-case fast paths

The common synchronous case avoids constructing a separate view and reuses dependency storage where possible. Versions are recorded at the end of a run rather than on every read; invalidation during the run must therefore remain visible to scheduling.

Earlier experiments with recording on every read, removing fast paths and wrapping global runs in an extra object added overhead. The global run remains stored directly on the reaction, with records for batch-local runs.

Historical measurements were mixed and predated later changes. The notes reported roughly 5–8% overhead for exact-version recording in dependency-heavy benchmarks, about 0.95 KB additional gzip size in one sample app, and a 6–23% regression from the extra run-object prototype. A later small benchmark comparison against `f7a5597ab` was near parity in its sampled cases. These are historical observations, not current performance guarantees or measurements of overlapping-batch workloads.

## Keep behavioral regressions without preserving obsolete mechanisms

Some tests originated in another async implementation. Their observable assertions can remain valuable even when the mechanism they originally exercised no longer exists; their origin alone is not a reason to remove them.

Merge chains now preserve retained versions and route late results to the surviving batch. Active [intersecting-merge coverage](../../packages/svelte/tests/runtime-runes/samples/async-merge-intersecting/) includes chained merging without repeated async work and cleanup after errors. This also implements the old notes' suggested shared-write test. [Stale aborted resolution](../../packages/svelte/tests/runtime-runes/samples/async-abort-signal-stale-resolution/) has active coverage for avoiding observable restarts; broader internal-processing questions remain separate.

The earlier notes also listed writable-derived error recovery, fork write-back and several adoption cases as broken. Current active samples cover [assignment after an error](../../packages/svelte/tests/runtime-runes/samples/writable-derived-assign-after-error/), [fork write-back](../../packages/svelte/tests/runtime-runes/samples/async-fork-write-back/) and [each-item adoption variants](../../packages/svelte/tests/runtime-runes/samples/async-fork-each-item-adopted-variants/). Broader claims without matching reproductions remain follow-up questions rather than established failures.
