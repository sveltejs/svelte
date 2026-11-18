# Reactivity overview

This document describes the client runtime's reactivity model, including overlapping asynchronous updates and speculative forks. It focuses on the concepts and how they fit together, rather than individual helpers or storage layouts.

Related documents:

- [Decision log](decision-log.md) — design rationale, alternatives and historical notes.
- [Known bugs and gaps](known-bugs-and-gaps.md) — limitations, follow-up work and verification gaps.

## Core concepts

- **Signal** — a reactive source or derived value. Each value has a version.
- **Reaction** — a derived computation or an effect that reads signals and tracks dependencies.
- **Run** — one evaluation of a reaction: its ordered dependencies and the versions it read, plus its result or error if it is a derived.
- **Batch** — a group of writes processed and rendered together. Multiple batches can be in flight while asynchronous work is pending.
- **Real world** — the latest non-speculative signal values and the global state of reactions. These values can be ahead of what is currently rendered.
- **View** — the values visible to a particular batch, including its own writes and excluding changes from other batches that are not part of its update.
- **Record** — a run retained for a batch, separate from the reaction's global state.
- **Fork** — a speculative batch whose changes are not applied to the real world unless committed.

## Dependencies and freshness

Reactivity combines push-based invalidation with pull-based validation. Writes notify dependent reactions that they may need attention. When a reaction is checked, the runtime compares the versions its run read with those visible in the active view, bringing derived dependencies up to date as needed.

A run is current in a view when all its recorded dependency versions match. Dependencies are checked in read order, stopping at the first mismatch. Reactions can also be forced to run, for example when they have not run before or invalidate themselves while running.

Versions identify signal values, not positions in a batch's timeline. Equal results retain an existing version where possible, and downstream reactions can remain current even when an upstream derived is re-evaluated.

Each run has its own dependency list. The notification graph also retains dependencies needed by other live runs of the same reaction. These extra connections are pruned when they are no longer needed.

## Batches and views

Ordinary writes are captured by a batch, together with the values from before them, and normally update the latest signal values. A write owned by a later batch can take precedence. A fork keeps its writes speculative. Async results are captured by the batch whose run produced them, including results equal to the latest value.

When a batch is processed, reads use its view. Independent pending changes from other batches are undone in that view. Earlier ordinary batches that wrote some of the same signals are included instead; this is called **folding**. Their valid records are available for reuse, and a later ordinary batch that finishes first merges into the earlier intersecting batch rather than committing independently. Forks are not folded into other batches.

A single ordinary batch uses the real world directly. With overlapping batches or a fork, the runtime overlays the values that differ. A view is reconstructed as work continues; it is not an immutable snapshot taken when the batch began.

Scheduling is batch-aware. Processing one view must not consume another batch's pending invalidations. When another batch commits, remaining batches are **rebased**: affected reactions are checked in their updated views.

## Derived values and retained runs

Deriveds are evaluated lazily. In a view, a read can use an applicable assignment, a cached result, a retained record or a valid global run. Otherwise the derived is evaluated in that view.

A derived run becomes global state when it represents the latest inputs; otherwise it belongs to the batch. Older runs can remain available to batches whose views still need them. A short-lived cache avoids repeatedly validating deriveds within the same active view; records can survive across processing passes.

When a batch's view becomes the real world, a still-valid derived record can be adopted with its value and version intact. Block and async effect records become global runs when their batch commits.

An assignment to a writable derived temporarily overrides its computed value. It holds until a dependency of the applicable run changes through a write made after the assignment. A derived's evaluation time alone does not count as such a write.

Errors are retained as run results and thrown when read. A run can also become invalid independently of dependency versions, such as when a disconnected derived's abort signal is cancelled.

## Branches and rendering

Control-flow blocks select branches in each batch's view. A new branch can be prepared offscreen, and different batches can retain different selections. A batch processes the branches it selects, including revalidating a branch prepared by another batch when adopting it.

Processing prepares branch selections and asynchronous work before committing the update. In async mode, subsequent template and user effect runs are deferred until commit; initial render work can happen while content is still offscreen. User effects inside a boundary showing a pending snippet wait until its content is revealed.

A branch removed from the rendered view can remain offscreen while a pending batch still selects it. Visibility, selection and lifetime are distinct parts of branch management.

## Asynchronous work and boundaries

Compiler-managed continuations restore their reactive context and batch view after an `await`. Reads made in that context can extend the run's tracked dependencies. This does not make arbitrary asynchronous callbacks reactive.

A component script continues once with the batch that supplies its first awaited values; reactive expressions can subsequently update in other views. Async template content is also prepared in the view that supplies its values.

Pending work only blocks a batch where that work is relevant. Work inside a boundary showing a pending snippet does not prevent unrelated content from committing. Such a batch can commit its current writes, remain alive for pending results and commit again later. Already committed writes become part of the baseline seen by other batches.

Boundary content is prepared during processing and revealed at commit. Pending work is associated with its batch; speculative work does not hold up the real world's boundary.

`{#await}` blocks have a separate lifecycle from await expressions. Their pending, then and catch states are updates of their own, with real-world and fork runs tracked independently.

## Cleanup and cancellation

Cleanup uses a separate view, reverting the writes responsible for a teardown while keeping cleanup's own writes visible. Derived computations made only for cleanup do not replace ordinary global or batch runs.

Abort signals belong to individual runs and must be requested during synchronous execution, before an `await`. Replacement, supersession, discard, destruction and disconnection participate in cancellation; another view can still retain a run it needs. Fork runs remain independent until commit or discard.

Committing or discarding batches releases their records and unused branches. Destroying a reaction removes its graph connections and retained runs.

## Source map

The main areas of the client runtime are:

| Area                                                                | Responsibility                                                          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [Runtime](../../packages/svelte/src/internal/client/runtime.js)     | Dependency tracking, freshness checks, run storage and cleanup views    |
| [Reactivity](../../packages/svelte/src/internal/client/reactivity/) | Sources, deriveds, effects, batch scheduling and async coordination     |
| [DOM blocks](../../packages/svelte/src/internal/client/dom/blocks/) | Branch selection, offscreen content, boundaries and control-flow blocks |
