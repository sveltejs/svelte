# Per-batch script initialization: evaluation and implementation plan

## 0. Start here

This is a **design and handoff document, not an implemented runtime change**. It was prepared on 2026-11-16 for a fresh implementation session.

- Working branch: `batch-views-script-replay-plan`.
- Starting commit: `06910d5b2bd547e2bba7b0ffe5669dbf5f7b0a48`, from `batch-views-merge-on-abort`.
- The starting worktree was clean. This branch deliberately starts **before** the discarded-fork handoff implementations. Only this plan document was added in the planning session; it was left uncommitted.
- Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), and this document first. [batch-views.md](batch-views.md) is background on the existing view/record model, not a specification for this redesign.
- The user wants a substantially easier-to-reason-about model, and accepts repeated speculative initialization/work in exchange. Do not turn this into another first-value-owner handoff mechanism with different names.
- Do not reset, merge, or cherry-pick other experimental branches wholesale. They contain useful regression tests and lessons, but different runtime designs.

### The user's proposal

For a component script such as:

```svelte
<script>
	let { input } = $props();
	let a = $derived(await get_a(input));
	let b = $derived(await get_b(a));
	let c = $derived(await get_c(b));
</script>

<p>{a}</p>
{#if b}<p>{c}</p>{/if}
```

Instead of executing one shared script promise chain and selecting batches in which its continuations may run:

1. `run` schedules a separate execution of the initializer for each batch that needs the branch while it is being initialized.
2. Script checkpoints become reactive readiness values rather than one-shot shared promise blockers.
3. Template/block effects are installed once, immediately, and read their own batch's readiness before accessing script bindings.
4. Hoisted bindings acquire batch-aware indirection. For an async derived, this may conceptually be `Source<Source<V>>`.
5. Once an eligible completed initializer becomes real-world state, later batches use that established instance instead of replaying its entire script.

The user also explicitly requires:

> Committing an already-failed fork must commit/report its cached error, not retry the failed request. A successful run that genuinely supersedes the failed expression may replace that error. An unrelated successful view does not erase a fork's private failure.

### Evaluation in one paragraph

**This is worth a bounded prototype.** It replaces a global first-value/continuation arbitration problem with per-view initialization plus stable presentation. Reactive checkpoints should eliminate several missed-wakeup and stranded-shared-promise paths. But simply putting today's `run` inside an effect is incorrect. The hard parts become explicit: stable producer identity, ownership of attempt-created effects, batch-local binding storage, coherent checkpoint publication, and the transition to a permanent component instance. Prove those in a small runtime/compiler spike before converting the language surface. There is no evidence yet that the complete design is smaller; the acceptance criterion includes removing the old coordination machinery, not accumulating both systems.

## 1. Reference commits and recoverable work

Use hashes as well as branch names; branch tips can move.

| Reference                                                                                   | Commit at planning time                    | Use                                                                                           |
| ------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| This plan's base                                                                            | `06910d5b2bd547e2bba7b0ffe5669dbf5f7b0a48` | Simpler batch-merge runtime; already contains earlier merge/record fixes                      |
| Original handoff implementation                                                             | `dbdd1dfafd27f4b5a257830c2b4f75af27e050f3` | Twelve discarded-fork/error regression samples; independent suspension/cleanup fixes to study |
| Reduced handoff implementation                                                              | `2173053b0977bc3713139d9792e40544b8ff0ad5` | Cached-error/superseding-success/unrelated-owner regressions and repeated-commit assertion    |
| `batch-views-merge-on-abort-fork-discard` and `batch-views-merge-on-abort-fork-discard-alt` | Both pointed at `2173053b09`               | Reference only, not the starting runtime                                                      |
| Colleague's `batch-views-ready-or-not-run`                                                  | `6702cd2bda54b85e650f56764c016e8bb04188d1` | Alternative first-result arbitration, not per-batch script replay                             |
| Merge-base of this base and colleague's branch                                              | `4a669eb6073ac411a2779818bd3a892d972a40a9` | Avoid mistaking inherited work for the colleague's changes                                    |

Useful inspection commands:

```sh
git status --short
git log -5 --oneline
git show --stat dbdd1dfafd
git show --stat 2173053b09
git show 6702cd2bda:packages/svelte/src/internal/client/reactivity/async.js
git show 6702cd2bda:packages/svelte/src/internal/client/reactivity/deriveds.js
git diff 06910d5b2b..2173053b09 -- packages/svelte/tests/runtime-runes/samples
```

To recover tests, inspect the diff, then extract only the explicitly selected fixture files. Preserve their correctness assertions, but review assertions about exactly-once _speculative script execution_: the new model intentionally changes that optimization. Do not use a runtime cherry-pick as a shortcut to retrieving tests.

### What the colleague's branch actually does

At the inspected commit, `run` still builds one script promise chain. `batch_for_run` carries a mutable batch plus `continued` callbacks. `async_expression` has a resolver and waiting results, delays results until the selected first result has continued the script, and uses superseding-batch information/`overlaps` to coordinate merges. Its `flatten` still consumes promise blockers.

The new proposal is structurally different: **each eligible batch owns its own initialization progress**. Study the colleague's tests and ordering concerns, but do not preserve the resolver/waiting-result arbitration as a hidden requirement of replay.

## 2. Current wiring and specific traps

The following facts were inspected in the plan's base.

| Area                      | Definitions and actual wiring                                                                                                                                                                                                                                                                              | Consequence                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script partitioning       | `calculate_blockers` in [analysis/index.js](packages/svelte/src/compiler/phases/2-analyze/index.js), called during analysis                                                                                                                                                                                | Splits the instance into synchronous statements, hoisted declarations, and async/sync continuation groups; assigns blocker metadata                   |
| Shared lowering           | [transform-async.js](packages/svelte/src/compiler/phases/3-transform/shared/transform-async.js), `transform_body`                                                                                                                                                                                          | Emits shared hoisted JS variables and assignments inside thunk arrays                                                                                 |
| Client caller             | [client/visitors/Program.js](packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js)                                                                                                                                                                                                   | Calls shared lowering with `$.run`                                                                                                                    |
| Server caller             | [server/visitors/Program.js](packages/svelte/src/compiler/phases/3-transform/server/visitors/Program.js)                                                                                                                                                                                                   | Calls the same lowering with `$$renderer.run`; do not accidentally impose client source storage on SSR                                                |
| More client `run` callers | [Fragment.js](packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js), [RegularElement.js](packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js), [DeclarationTag.js](packages/svelte/src/compiler/phases/3-transform/client/visitors/DeclarationTag.js) | Template declarations also use `run`; `DeclarationTag` explicitly reads `.promise` or calls `$.wait`                                                  |
| Current script runner     | [reactivity/async.js](packages/svelte/src/internal/client/reactivity/async.js), `run`                                                                                                                                                                                                                      | Starts a single promise chain outside its accounting effect. Only pending-accounting is rerun when a different batch adopts the branch                |
| First-value bridge        | [reactivity/deriveds.js](packages/svelte/src/internal/client/reactivity/deriveds.js), `async_derived`                                                                                                                                                                                                      | Returns one initialization promise for a source; its block restricts which batch may settle it                                                        |
| Async producers           | Same file, `async_expression`                                                                                                                                                                                                                                                                              | Creates an async effect, records its deferred by effect identity in `Batch.async_deriveds`, captures results in its originating/merged batch          |
| Template gates            | `flatten` in `async.js`, [dom/blocks/async.js](packages/svelte/src/internal/client/dom/blocks/async.js), `template_effect` in [effects.js](packages/svelte/src/internal/client/reactivity/effects.js)                                                                                                      | They currently delay installation using promise blockers. `flatten` already contains a create-once branch / later revalidate pattern worth preserving |
| Directive consumers       | `run_after_blockers`, called by binding, attachment, action, transition and animation transforms, plus `validate.js`                                                                                                                                                                                       | Changing the blocker contract affects more than text and if blocks                                                                                    |
| Views/records             | [batch.js](packages/svelte/src/internal/client/reactivity/batch.js), [runtime.js](packages/svelte/src/internal/client/runtime.js)                                                                                                                                                                          | Source versions and private effect records drive revalidation, abort replacement, merge, and publication                                              |

A direct in-memory compile of the user's example on this base produced the quoted shape: shared `var a, b, c`, three `async_derived` thunks, and template gates using `$$promises[2]`. Do not change checkpoint granularity as an unrelated optimization in the first prototype.

### Why `async_effect(() => run_the_script())` is not sufficient

1. `async_derived` takes a **non-coordinating, one-shot path** when `active_reaction !== null`. An effect wrapper makes that condition true. `untrack()` does not fix it: it changes dependency tracking, not `active_reaction` identity.
2. `update_effect` destroys previous child effects before rerunning its body. A second batch could therefore destroy the first batch's producers and waiters. A block effect preserves branch children, but that is not automatically per-attempt ownership.
3. The script runner itself may have no direct input dependencies: reads occur in child async producers. A no-dependency effect needs an explicit admission/revalidation rule for a newly adopting batch; it will not necessarily run simply because that batch exists.
4. Raw hoisted assignments still race, even if the promise chains are independent.
5. Checking cancellation after a thunk resolves is too late if the thunk already assigned shared variables after an `await`.

## 3. The central invariant and vocabulary

Use these names consistently in code and tests:

- **Initializer**: stable identity of a particular component/fragment initialization site, attached to a stable effect lifetime. It is not the parent effect of an arbitrary component: sibling components can share that parent.
- **Producer site**: stable logical identity of an async-derived declaration or equivalent producer. Distinct from an execution of that producer.
- **Attempt**: one initializer execution in a canonical batch and a generation. Contains its private execution environment, progress, resource ownership, and outcome.
- **Checkpoint**: progress through a particular continuation group for the selected attempt. Not a count of all promises and not a global “done” flag.
- **Published initializer**: a completed successful attempt that was actually committed for the still-selected component. This establishes the long-lived component state.
- **Presentation**: stable template/control effects and DOM ownership, shared across views according to the existing branch model.

**Invariant:** every checkpoint, binding handle, error, and continuation observed in one batch must refer to the same selected initializer attempt. A late result from another generation must not mutate that attempt, even if both originating batches now resolve through `merge_target()` to the same batch.

“Single batch” means a single logical execution view, allowing canonicalization through a real batch merge. It does not mean that a mutable batch can never be rebased. Define what rebasing does to an unfinished attempt; do not silently treat batch object identity as an immutable snapshot.

## 4. Candidate runtime design

### 4.1 Separate scheduling, execution resources, and presentation

Keep a stable initializer scheduler and the template skeleton outside attempt-owned resource scopes.

- On first admission of an initializer in batch B, start or reuse B's attempt.
- Traversing B again must not restart an unchanged attempt merely because an effect was visited.
- A changed dependency/view may invalidate an attempt or one of its producer runs; this requires an explicit validity rule, not unconditional replay on every flush.
- Execute script groups in the attempt's batch context; never continue an F attempt using R's local environment.
- A real batch or healthy fork that still needs a discarded/failed creator's branch can initialize independently. It need not inherit the creator's promise chain.
- Give attempt resources a disposal scope that does not destroy another attempt or the shared template tree.
- Starting another attempt must not recreate already-installed template/block effects.

The first prototype should distinguish two operations: **ensure an attempt exists in this view** versus **invalidate a particular execution because its inputs changed**. Otherwise checkpoint writes can trigger a replay loop.

A normal effect record may help represent admission, but inspect existing dirty checks first. Do not add an ever-growing registry and a parallel owner set if existing per-batch bookkeeping can answer the same question.

### 4.2 Storage: indirection is necessary; universal double-sources are not

For an async-derived binding, `get(get(a_slot))` is a reasonable conceptual reader: the outer cell chooses this view's binding, and the inner value remains reactive. It is not a universal lowering for all declarations.

Compare these two representations in the kernel spike:

| Representation                                                                                                        | Benefit                                                                                                                                | Obligation                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Stable per-binding outer cells plus readiness cells                                                                   | Close to the user's proposed output; selective dependencies                                                                            | Merge/reset/publication must keep all cells in the same generation                                                    |
| One stable frame-selection source containing an immutable initialization snapshot, with readiness/binding projections | A single snapshot can carry generation, checkpoint prefix, binding handles, and outcome coherently; fewer cross-cell consistency rules | Snapshot writes still need correct batch ownership; projections must preserve binding semantics and producer identity |

**Recommended first experiment:** test a single immutable snapshot/selection cell, then decide whether per-binding cells are a worthwhile refinement. It is an implementation option, not a requirement to replace the proposed readiness API. Stable readiness projections can still provide `Value<boolean>`-like gates. Do not hide mutable, unversioned readiness fields inside an object and call that reactive.

Use stable, equality-preserving projections for **bindings as well as readiness**. A producer that reads the entire snapshot just to obtain `a` would be invalidated when publishing an unrelated checkpoint changes the snapshot object. That can cause redundant requests or a self-publication loop. Conversely, a readiness projection can stay `true` across attempt replacement; its equality does not establish generation validity. Continuations and publication still need the attempt-identity check.

Two existing batch rules must be addressed before trusting either representation:

1. **Initial value isolation.** `Batch.capture` deliberately records no previous value for a source whose real value is `UNINITIALIZED`. A first non-fork value can therefore be visible in other views. Outer selection cells should have an undoable empty baseline such as `null`; readiness starts `false`. Test first publication with another pending view. Do not copy sketches that initialize outer binding cells with `UNINITIALIZED` without changing this rule.
2. **Rebase provenance.** `Batch.#commit` updates an earlier batch's own entries when a later commit changes their value and `!own.async`. Ordinary `source(false)`/slot writes could therefore overwrite a fork's private initialization outcome. Initializer results must be distinguished from ordinary input/state writes. Prove whether the existing async-result classification can express this; don't introduce a flag without specifying exactly which writes it protects. Real input updates must still be able to invalidate obsolete attempts.

### 4.3 Stable producer identity is an early go/no-go question

Today `abort_replaced`, `batch.records`, and `batch.async_deriveds` coordinate different runs of the **same effect**. Creating a completely new producer effect for every replay bypasses that identity. Abort-driven batch merging and supersession would no longer “just work”.

Choose and prove one approach early:

- Reuse a stable producer site/effect, with per-batch execution state and view-selected bindings; or
- Allocate attempt-owned producers but provide explicit logical-site correspondence for replacement, cancellation, merge, and eventual promotion.

The first option may make some inner sources stable, reducing the need for `Source<Source<V>>`. The second must not become another large owner-transfer framework. Use `async-merge-abort-chain` and fork isolation cases as acceptance tests before broad compiler changes.

Producer closures must not close over another attempt's JS locals. If a producer is reused, its reader must deliberately select the execution view; if it is attempt-owned, its lexical environment must remain alive for its whole lifetime.

### 4.4 Checkpoint publication protocol

For an admitted attempt/generation:

1. Register its pending work before starting its first thunk, including synchronously resolving and rejecting thunks.
2. Establish the batch-local empty/not-ready selection before exposing new-generation binding handles.
3. After every suspension, validate that the attempt remains selected and eligible, then restore the correct batch/reaction/component context before executing dependent code.
4. Publish the binding values/handles for the checkpoint through batch-aware internal writes.
5. Publish readiness **last**, or atomically as part of the same snapshot.
6. Let the gated effects observe that checkpoint in the same view. Any template async work they start must be registered before initialization is considered fully drained.
7. Settle/decrement the attempt's pending bookkeeping exactly once on success, error, replacement, discard, or destruction.

A generic `set()` inside a reactive runner is not necessarily an appropriate internal publication API; current mutation validation can reject it. Direct `.v` assignment is not acceptable either. Specify the batching and invalidation behavior of the internal write operation.

Do not use only a boolean to distinguish every terminal state. Gates can remain boolean-valued, but failed, cancelled and suspended attempts need distinct outcomes, with an observable error channel and cleanup. `false` forever is not error handling.

### 4.5 Immediate gates, once-created effects

The proposed guard is the right starting point:

```js
for (const ready of blockers) {
	if (!get(ready)) return;
}
```

But distinguish **re-running an effect body** from **recreating its effect/DOM identity**:

- Allocate render/control effects once per actual component/block instance.
- Read readiness before reading bindings, computing template async expressions, attaching actions, or evaluating dynamic selectors.
- If a control gate first creates a content branch, cache that branch. Later ready views revalidate it instead of invoking its construction callback again.
- If the branch already exists but another batch's gate is false, simply returning is insufficient if descendants can be scheduled independently. Use the batch's skip/unskip/branch-selection rules so that those descendants cannot run with uninitialized bindings in that view.
- Keep the cached content branch outside the runner's disposable attempt children.
- “Once” does not prohibit legitimate destruction/recreation when `{#if}` really changes, an each key changes, or the component unmounts.

Preserve hydration anchor capture/advancement in `dom/blocks/async.js`. Its current `.settled` fast path cannot just be deleted without testing hydration ordering. The same gate contract must eventually cover `run_after_blockers` users, not merely text interpolation.

## 5. Compiler contract and a deliberately limited sketch

The following is **pseudocode**, not existing API or a production patch:

```js
// Stable component shell, created once. Empty state is undoable in other views.
const bindings = create_initialization_storage(null);

const ready = initialize_per_batch(bindings, (attempt) => {
	// Fresh lexical environment for this attempt, never raw shared a/b/c assignments.
	let a, b, c;

	return [
		async () => {
			a = await attempt.first_value('a', () => get_a($$props.input));
			attempt.publish(0, { a });
		},
		async () => {
			b = await attempt.first_value('b', () => get_b(read_attempt(a)));
			attempt.publish(1, { a, b });
		},
		async () => {
			c = await attempt.first_value('c', () => get_c(read_attempt(b)));
			attempt.publish(2, { a, b, c });
		}
	];
});

// Construct the template skeleton and its gated effects once, outside the runner.
install_template_once(ready, bindings);
```

Required contracts behind this intentionally abstract sketch:

- `first_value` represents a batch-local wait on the correct producer site/run. It must not return the old globally shared first-value promise.
- Its producer-creation boundary must retain the owning effect and batch without accidentally triggering `async_derived`'s `active_reaction !== null` fast path. Merely calling `untrack` is not that boundary.
- `publish` validates generation and performs internal batch writes. It cannot permit publication to a discarded or replaced attempt.
- The compiler must restore/check context at nested/inline awaits too. The sketch only shows one await per group and does not solve arbitrary `await` syntax by itself.
- A late assignment to attempt-local `a` may be harmless after cancellation; executing further user code, creating new effects, or publishing it is not. Check before those operations, not just after a whole thunk returns.
- Existing promise-based `save`/`unsave` preserves reaction context, but is not an attempt-validity token. Integrate the two concerns without a global “latest generation” that invalidates unrelated forks.

### Binding categories to preserve

| Binding                                          | Storage/semantic concern                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Async derived                                    | View-local binding selection plus a reactive producer result; writable overrides must still work                    |
| Synchronous derived                              | Preserve derived dependency/error/cache semantics, not just a plain value source                                    |
| `$state` source or proxy                         | Preserve state identity, ownership, write/update/mutation behavior and writes made after publication                |
| Ordinary local / raw awaited value               | Isolate initialization without making normal nonreactive assignments reactive                                       |
| Props / bindable props                           | Preserve callable/accessor conventions, fallback initialization, parent writes and binding timing                   |
| Functions, arrows, classes                       | Preserve hoisting and closure semantics; distinguish attempt-local producer captures from live template/event reads |
| Destructuring / compiler temporaries             | Use binding identity/scope, not generated-name prefixes, to decide which values need publication                    |
| Context, stores, effects, lifecycle registration | Avoid duplicating permanent registrations or leaking speculative mutations into the live component                  |

Important current lowering details:

- `binding.blocker` is readiness metadata, **not** a complete classifier for replay storage. It also covers earlier bindings assigned later and functions referencing blocked bindings.
- `transform_async_node` creates raw assignments after visiting variable declarations. Changing normal assignment transforms alone will not intercept these initializer assignments.
- Analysis hoists post-await declarations/classes, while some function declarations and direct arrow/function declarators remain in synchronous scope even when textually after an await.
- A multi-declarator statement containing an await can put its earlier declarators into the continuation groups too. “Before the first await” is not currently an exact textual boundary.
- Audit `read`, `assign`, `mutate`, `update`, destructuring/logical assignment and `bind:` setters, including scope shadowing.
- Both client and server call shared `transform_body`; make client-specific storage/publication an explicit strategy, preserving SSR's default transformation.
- Template declarations in `Fragment`/`RegularElement` also use `run`, and `DeclarationTag` knows about `.promise`. Do not globally change the meaning of `run`/`Blocker` while leaving these callers unchanged.

For the smallest spike, keep the existing synchronous prefix outside replay and support only the straight-line async-derived chain plus a plain post-await local. **That is a prototype restriction, not a decision that half of a user's script should permanently run under a different model.** Before generalization, decide whether to replay the full user initializer or an explicitly defined suffix with stable prefix state. Audit prefix writes after awaits, `setContext`, store setup, exports, and `$effect`/`onMount` registration before promising whole-script replay.

Readonly compiler probes also found existing edge-case output hazards for post-await classes with runes and destructured state temporaries. Keep them as explicit compiler-extension tests; a general replay lowering must not silently inherit them. They are not evidence that the new model works, and need not be folded into the first kernel spike.

## 6. Suspension, replacement, and merging

### UNINITIALIZED is not undefined or an application error

The historical sandbox reached a dependent async expression before its input had a value in that view, producing `TypeError: Cannot convert a Symbol value to a number`.

Sequential replay prevents one way of reaching that state, but not all of them: a producer created by one attempt can rerun after adoption, rebasing, or an upstream update. A gate around the template does not guard the producer's own reads.

Define one consistent suspension protocol:

- An uninitialized async input is tracked as a dependency **before** suspension.
- Do not call the user's dependent loader with a sentinel.
- Do not turn “not yet runnable” into a fulfilled `undefined` value or route it to a failed snippet.
- Keep the necessary dependency/version record so the producer wakes when the input becomes available in that same view.
- Do not leave a promise or pending count stranded when suspension replaces a run.
- Handle this inside nested deriveds and after inline awaits as well as direct synchronous reads.

The handoff reference contains an experimental implementation using `UNINITIALIZED` as an internal suspension signal, caught in async producers/error handling, plus `REACTION_RAN` bookkeeping for suspended runs. Study the accompanying `async-resume-recheck` regression before reusing it. The plan's base does **not** already have that fix.

### Decide what invalidates an unfinished script attempt

Prefer local producer revalidation while a checkpoint is still waiting. If a rebase invalidates a completed prefix that later script statements relied on, the simple conservative option is to invalidate/replay that batch's attempt, with a new generation. Do not blindly replay the whole initializer for every inner-source update.

Add a test with a plain snapshot computed from `a`, a later suspended `b`, and a change to `a` before final completion. Specify whether the prefix is still valid or must restart; do not publish an accidental mixture simply because each individual promise resolved successfully.

After publication, ordinary async-derived changes must update their dependent computations without replaying script-side effects or recreating component state.

### Merge as one coherent attempt selection

Existing `Batch.#merge` copies source writes, forwards deferreds, transfers pending counts and non-block effect records, then unlinks the incoming batch. It does not understand initialization frames.

For replay:

- Define which whole attempt/generation wins when two relevant batches merge, including when it is still pending. The conservative prototype should choose one coherent attempt rather than stitch together arbitrary checkpoints/locals.
- Canonicalize ownership through `merge_target`, but also check the selected attempt's identity/generation.
- Retire losing work and settle its bookkeeping without requiring its user promise to resolve.
- Preserve the incoming deferred chain: later replacements must reach intermediate deferreds, not just the oldest waiter.
- If the scheduler is a block effect, account for the fact that existing merge intentionally does not transfer block records.
- Avoid losing deferred render effects when merging; completing the script is not the same as completing the DOM work.
- Retain guards against self-merges, discarded/unlinked targets, and callbacks mutating batch lists during cleanup.

Do not remove `#move_to_front` as a shortcut. Earlier investigation proved that disabling it leaks uncommitted state into committed output (`async-pending-boundary-committed-run-resolves-last`, both DOM and hydration). Reordering is part of the current view model, not the root cause of initialization ownership bugs.

_User's edit: if there's another way to prevent uncommitted state leaking into committed output, without reordering batches, it's worth investigating._

## 7. Completion, publication, and existing forks

**A batch committing is not an initializer finishing.** Pending boundaries let batches commit and remain alive while their scripts still await. Similarly, a fork can complete without publishing anything.

Stop admitting _new whole-script attempts_ only when:

1. The selected attempt has succeeded through its final required checkpoint.
2. Its binding values and producer ownership are valid in the committing real view.
3. The completed attempt is actually committed for a branch still selected by that view.

Freezing replay must preserve the selected producers; destroying the runner and all its children would destroy the deriveds that must keep updating.

Do not implement this as `batch.committed`, `!batch.is_fork`, `current.size === 0`, or “the first promise resolved”. A batch can commit repeatedly and later acquire writes. Completion/publication is initializer state, not a global property of that batch's entire lifetime.

### Existing speculative attempts after real publication

This requires an explicit rule, not a blanket `if (initialized) return`:

- New adoptions can use established real-world initialization without replay.
- Already-existing fork attempts can still carry a valid private failure that must surface on their later commit.
- Real success does not automatically supersede such an error; dependency/run identity determines that.
- An old attempt must not overwrite a newer published frame merely by resolving late.
- Committing an old successful fork must not reset live local state, input focus, event registration or DOM identity just because its initialization environment was created earlier.

**Make this a phase-1 decision/test.** Example: F starts a component; R independently initializes and displays it; the user edits R's local state; F then commits. Define which initialization values may be adopted and which established identities/state must remain. Stable state/producer sites may be necessary here. A single frame pointer does not solve this by itself, and keeping every old attempt forever is not an acceptable answer.

## 8. Errors, discard, and pending accounting

### Required failure semantics

| Scenario                                                                    | Required outcome                                                                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| F fails; R initializes successfully using different inputs                  | R remains healthy; F retains its private error                                                                        |
| F later commits without a valid replacement                                 | Surface the original cached error, no loader retry caused by commit                                                   |
| A genuinely superseding successful execution replaces F's failed expression | Do not replay a captured stale error callback                                                                         |
| An unhandled failed fork commits                                            | Reject commit before speculative state is partially published; repeated commit must not silently succeed              |
| Commit requested while the request is still pending, then it rejects        | Specify and test error delivery to the commit waiter; this was an existing uncovered gap, not solved by prior patches |
| A real attempt fails                                                        | Route through the real view's boundary; don't attribute it to the original fork                                       |
| A losing/discarded attempt rejects late                                     | No leaked unhandled rejection and no damage to a live attempt                                                         |

Readiness sources can make failure observable, but do not repeat the old mistake of skipping an entire speculative boundary so permanently that it cannot revalidate a successful replacement. Error state must be associated with the current expression/attempt outcome, not an unconditional stale commit callback.

### Discard is terminal for an attempt, not destructive to shared presentation

Discard can be simple if attempts are genuinely independent:

- Mark the attempt ineligible before invoking callbacks/abort listeners.
- Cancel its producers/bookkeeping promptly; do not wait for uncancellable user promises.
- Remove its frame selection/private resources without destroying a template tree another batch uses.
- A continuation must check validity before restoring a discarded view, starting a new async stage, or publishing readiness.
- Stop speculative revalidation for retired work, but do not skip a live owner's readiness/template traversal.
- Merged work continues under the canonical winning attempt, not under a newly resurrected discarded batch.

The prior “keep discarded forks alive until pending reaches zero” experiment was insufficient: it restarted speculative requests, changed prompt-abort behavior, and could retain a fork forever when an old request was deliberately never resolved.

### Accounting and boundary reveal

Keep these quantities separate:

- Producer work in flight.
- Unfinished script initialization for a given view.
- Template async work started when a checkpoint becomes ready.
- Work that blocks normal commit versus work contained by a pending boundary.

`settled()`, `$effect.pending()`, and pending-boundary reveal need terminal paths for success, rejection, suspension replacement, discard and destruction. A failed or discarded fork must not hold up real-world reveal. Do not remove script/template wait counts merely because booleans replace promises; replace the accounting contract deliberately.

Readiness-triggered effects must get a chance to register their work before the final initialization decrement reveals a boundary or runs deferred user effects. Test microtask ordering, not just final DOM after an arbitrary number of ticks.

JavaScript cancellation cannot undo external side effects or prevent all user `finally` code from running. The enforceable contract is that obsolete framework work cannot publish, create live effects, or select the wrong view after cancellation; document repeated external requests/script effects as a replay tradeoff.

## 9. Lessons from the previous investigation

| Observed problem                                              | Lesson for replay                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `async-merge-abort-chain` left intermediate deferreds pending | Transfer all waiters; don't only forward the oldest first-value promise                       |
| Fork rebase requested a merge into itself                     | Same canonical batch is not a merge target; never form a merged cycle                         |
| Abort listener targeted an already-unlinked batch             | Validate lifecycle eligibility before enqueueing work                                         |
| Error thrown outside the first-value bridge's rejection `try` | Every wait needs an error/terminal path; ignoring destroyed blockers doesn't settle promises  |
| Supersession changed permission but no source version         | Permission/readiness transitions need a reactive/scheduled wakeup                             |
| Late async record after an early pending-boundary commit      | New producer metadata must be published or owned correctly even after earlier partial commits |
| Dependent async input was UNINITIALIZED in a new view         | Gate/suspend producers as well as templates, while preserving dependency tracking             |
| Shared script resumed in a discarded creator                  | Independent attempts should remove the need to rescue that creator's continuation             |
| Fork error permanently rejected shared initialization         | Failures must be per attempt/view, not a single irreversible shared promise state             |
| Cleanup callbacks discarded batches during list traversal     | Cleanup traversal must tolerate mutation without skipping later live batches                  |
| Later success did not clear a speculative cached error        | Retain current result/run identity, not only a captured error or sticky failed flag           |

Do not infer that all old fixes can be deleted together. Some address independent ordering, cancellation, suspension, or cleanup bugs. Replace them only when the new invariant covers their tests.

## 10. Regression inventory and expectation policy

Tests are under `packages/svelte/tests/runtime-runes/samples/` unless otherwise noted.

### Present in the starting base

- `async-merge-abort-chain`, `async-merge-abort-boundary`, `async-merge-abort-intervening`.
- `async-abort-signal-fork-earlier-batch`, `async-abort-signal-batches`, `async-abort-signal-merge-newer-run`, `async-abort-signal-committed-batch-rerun` and neighboring abort/fork cases.
- `async-discard-obsolete-batch`, `async-fork-discard-revalidation`, `async-pending-boundary-committed-run-supersedes-abort`.
- `async-resume-script-first-value-skipped`, `async-resume-script-superseded-late`, `async-resume-script-first-thunk`, the buffered/merged/later-batch/aborted variants.
- `async-update-during-first-render`, `async-update-during-first-render-aborted`, `async-update-during-first-render-unrelated`.
- `async-record-initialization-concurrent`, `async-record-initialization-committed-view`, `async-record-initialization-fork`, `async-record-initialization-private`, `async-record-initialization-late-read`.
- `async-pending-boundary-committed-run-resolves-last`, `async-pending-boundary-uncommitted-first-value`, `async-read-pending-value-in-committed-batch`.
- `async-resume-recheck`, `async-resume-unrelated-fork`, `async-resume-fork-discarded-midway`, `async-fork-discard-await-inside`.

These are historical anchors, not a claim that all will pass unchanged under intentional replay semantics.

### Added by `dbdd1dfafd` (not present as runnable source fixtures in the base)

- `async-fork-discard-shared-chain`: deterministic version of the historical dependent-await sandbox.
- `async-fork-discard-shared-continuation`: independent stages isolate the discarded continuation problem.
- `async-fork-discard-shared-before-init`: raw script await before the first async-derived declaration.
- `async-fork-discard-settled-result`: already-settled result/discard race and cleanup.
- `async-fork-discard-no-restart`: no new work after a fork is discarded.
- `async-fork-shared-script-error-real-owner` and `async-fork-shared-script-error-fork-owner`.
- `async-fork-shared-script-error-real-failure`.
- `async-fork-shared-script-error-unhandled` and `async-fork-shared-script-error-unhandled-commit`.
- `async-fork-shared-script-error-other-fork`.
- `async-commit-discards-earlier-forks`: cleanup must not truncate later rebasing.

### Added/extended by `2173053b09`

- `async-fork-failure-commit-cached`: unrelated real success must not erase a private failure or cause a retry on commit.
- `async-fork-failure-superseded`: a valid successful replacement suppresses the earlier failure.
- `async-fork-discard-unrelated-owner`: a continuation must not take an unrelated speculative view.
- Repeated-commit assertion in `async-fork-shared-script-error-unhandled-commit`.

### One pre-existing gap preserved outside Git

The local diagnostic fixture `async-fork-failure-commit-pending` was archived at:

`/tmp/svelte-pending-fork-6AJRAZ/async-fork-failure-commit-pending`

The path existed at planning time (macOS also exposes it under `/private/tmp`). It is not durable repository storage and is not in the reference commits. Reconstruct it if missing:

1. Main owns a controlled promise and an `Error` object; a fork sets `show = true`.
2. A child inside the conditional begins `$derived(await load())`; use no explicit failed/onerror boundary.
3. Start `fork.commit()` while `load()` is still pending, recording whether its rejection is the original error.
4. Reject the request, await a tick, assert commit caught the original error, no unhandled rejection, no successful child output or loader retry.

Both the original handoff and reduced handoff failed this test with an unhandled `Error: pending fork failed`. Do not describe it as a regression caused by replay. Make its desired contract explicit before productionizing the new error path.

### Expectations that may legitimately change

- Exact number of speculative requests and script-continuation logs can increase.
- Which attempt performs work first can change, provided visibility/isolation and defined checkpoint ordering remain correct.
- Tests that assert one global initializer or explicit handoff should be rewritten to test the semantic outcome, not the discarded optimization.

Do **not** relax:

- Cache/no-retry-on-failed-commit behavior.
- No late overwrite or cross-view binding mixtures.
- No new work in a discarded attempt, prompt abort where promised, and no leaked pending counts.
- Exactly-once installation/lifetime of a stable block/template instance, actions, event handlers, and applicable lifecycle effects.
- Correct boundary visibility, component state preservation, and late dependency tracking.
- Real/fork isolation or error identity/delivery.

Use labelled request queues per attempt/site when duplicate speculative loads become legitimate. Tests indexed only by a value can accidentally resolve the wrong run after replay; update the control mechanism rather than weakening assertions.

## 11. New tests the design needs

Add these incrementally with the relevant implementation, using TypeScript, button-driven updates, controlled promises, and `<output>` assertions. Keep child components where cross-component initialization is the point; otherwise prefer one file.

| Priority | Scenario                                                                                                   | Proof obligation                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P0       | Two batches run `a -> b -> c`; resolve them in opposite/mixed orders                                       | Every local, checkpoint, and continuation stays in its selected attempt              |
| P0       | False/true readiness differs between F and R; a branch exists before the second view is ready              | No checkpoint leak; descendants don't run through a false parent gate                |
| P0       | Abort-driven supersession while the old attempt is still pending; then merge                               | Stable producer identity, complete waiter transfer, losing generation cannot publish |
| P0       | Rebase after a prefix checkpoint and before the next await resolves                                        | Defined prefix invalidation; no mixed snapshot                                       |
| P0       | F fails, R succeeds; later F commits, with and without genuine successful replacement                      | Cached error/no retry and correct invalidation                                       |
| P0       | Pending boundary commits before final checkpoint; another batch adopts                                     | No premature sealing or stranded late record                                         |
| P0       | R publishes; user changes local state; older F then commits                                                | Established state/DOM identity survives according to an explicit policy              |
| P0       | Gate toggles across views, using a visible creation counter and retained DOM node reference                | Template/block factory created once, body may update many times                      |
| P1       | Discard before raw await resumes, during an inline await, and after promise settlement but before callback | No resurrection, publication, or extra stages from discarded attempts                |
| P1       | Producer reruns with UNINITIALIZED direct/indirect/late-read dependency                                    | Suspension with retained dependencies, no sentinel in user code                      |
| P1       | Own checkpoint writes and producer result updates                                                          | No self-triggered whole-script replay loop                                           |
| P1       | Completed published initializer gets ordinary later input updates                                          | Deriveds still update; ordinary script/state/lifecycle initialization does not rerun |
| P1       | Each/key/if and pending boundaries, nested component creation                                              | Stable per-instance identity; no assumptions specific to BranchManager               |
| P1       | Partial hydration and already-ready synchronous path                                                       | Markers and anchors consumed once and in order                                       |
| P1       | Failure before commit, failure after commit requested, repeated commit                                     | Correct handled/unhandled promise behavior and no partial publication                |
| P1       | Teardown/abort callback discards another batch                                                             | Safe cleanup traversal and exactly-once release                                      |
| P2       | Plain locals, sync deriveds, state/proxies, overrides, destructuring, classes and escaping closures        | Kind-correct lowering and no cross-attempt assignment                                |
| P2       | `getContext`/`setContext`, stores, bindings, actions, attachments, transitions and effects                 | No speculative global registration/mutation leaks or duplicate lifetime hooks        |
| P2       | Template async declarations and mixed script/template blockers                                             | Coherent replacement of `.promise`, `.settled`, `.failed` and `wait` consumers       |

The current sandbox is **not** the historical fork/discard demo. At planning time `App.svelte` has “one”/“two” updates and `Child.svelte` has one async derived plus a `Math.random()` if/body. This is useful motivation for once-created block identity, but there are no controls to resolve its requests. Use deterministic fixture counters rather than random values for assertions. Do not follow the old fork → shift → real → discard instructions against the current file.

## 12. Staged implementation and exit criteria

### Phase 0 — Establish the baseline and write down choices

- Verify branch/base/worktree and read the actual source; do not rely on this document's line numbers after edits.
- Recover the selected regression fixtures without importing either handoff runtime.
- Run the focused baseline, recording real failures and expectation/optimization assumptions separately.
- Choose the replay region (prototype suffix versus eventual full initializer), binding storage representation, producer identity strategy, and post-publication policy for existing forks.
- Define attempt validity, admitted-batch detection, outcome/error representation, and the exact condition for sealing.

**Exit:** the P0 state transitions can be explained without “pick whichever first-value owner looks alive”.

### Phase 1 — Runtime kernel with hand-written/test-generated inputs

- Add a minimal initializer scheduler and per-view progress storage.
- Keep a stable shell and separate resources for concurrent attempts.
- Implement admission/deduplication, stale-generation rejection, coherent checkpoint publication, disposal, and once-created gates.
- Prove first-write isolation, rebase provenance, producer-site supersession, and merge behavior before building a general compiler transform.
- Test an actual source update after sealing; a static initial render is insufficient.

**Exit:** the small chain, two-view isolation, discard, cached-error replacement, existing-fork-after-publication, and once-created-template cases work without template recreation or invalid effect contexts. If this requires rebuilding the old handoff state machine, stop and reconsider the representation.

### Phase 2 — Narrow client compiler lowering

- Add separate binding-storage metadata rather than overloading `binding.blocker`.
- Generate an attempt factory/local environment, not thunks that assign shared JS variables.
- Introduce an explicit client publication transformation in shared lowering, leaving SSR defaults unchanged.
- Support straight-line identifier async deriveds, a sync derived, and a plain post-await snapshot first.
- Instrument every supported suspension for context restoration and token validation.
- Preserve the stable template factory and existing coarse checkpoint assignments initially.

**Exit:** reviewed generated code contains no cross-attempt shared assignment; producer creation avoids the one-shot fast path; runtime tests exercise generated rather than only hand-written code.

### Phase 3 — Failure, fork commit/discard, merge, and publication

- Complete the source/run-identity-aware error path; handle commit before/after rejection.
- Finish prompt cancellation and pending counts, including never-settling user promises.
- Wire completed-attempt promotion to real commit, not ordinary batch completion/history.
- Preserve the selected producer lifetime and existing live component state when freezing new replay.
- Cover all P0/P1 cases and the earlier abort/merge/order regressions.

**Exit:** no sticky error callbacks, resurrected discarded contexts, stranded waiters, leaked private readiness, or stale generation writes.

### Phase 4 — Generalize the compiler and all readiness consumers

- Resolve full-prefix versus suffix semantics and all binding categories.
- Handle template declarations, `wait`, directives, validation, nested components, each/key branches and hydration.
- Retain server semantics and client/server output agreement.
- A temporary script-only helper/API is acceptable for the spike; remove transitional adapters/dual blocker contracts when the new contract is complete. Do not leave permanent heuristic routing between both models.

**Exit:** broad generated-code/runtime coverage and no unclassified declaration/consumer silently using the old shared assignment model.

### Phase 5 — Delete superseded machinery, then broaden verification

- Remove shared first-initialization promise arbitration and its lifecycle exceptions only where the new invariant replaces them.
- Reevaluate the first-async-run `is_recorded_effect` exception using the existing concurrent/private/fork/late-read tests; do not delete it just because it looks heuristic.
- Retain independent batch ordering, suspension, cancellation and cleanup guarantees.
- Document the final invariants and compare runtime state/lifecycle complexity, not just line counts.
- Run broad runtime/compiler/hydration/SSR checks, then the full suite before a PR.

**Exit:** one understandable model, not replay plus the previous owner-handoff model hidden underneath.

## 13. Commands and verification discipline

The repository uses `pnpm test` → Vitest. `FILTER=name` is an exact literal sample name; `FILTER=/text/` is a literal substring filter, **not regex**. Use `-t` for alternatives/regular expressions. Require positive executed-test counts; absent fixtures or ignored `_output` leftovers are not a pass.

Suggested focused baseline and implementation checks:

```sh
FILTER=async-update-during-first-render pnpm test runtime-runes
FILTER=async-merge-abort-chain pnpm test runtime-runes
FILTER=async-resume-recheck pnpm test runtime-runes
FILTER=async-pending-boundary-committed-run-resolves-last pnpm test runtime-runes

# After recovering the reference fixtures:
pnpm test runtime-runes -t '^async-fork-(discard-(shared|settled-result|no-restart|unrelated-owner)|shared-script-error|failure-)'

# Resume, ownership and first-render coverage:
pnpm test runtime-runes -t '^async-(resume-|record-initialization-|update-during-first-render|merge-abort|abort-signal-)'

# Force regeneration after lowering changes where appropriate:
NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-script-replay-'

# Focused existing compiler snapshots:
pnpm test snapshot -t '^async-(in-derived|const|top-level-group-sync-run|top-level-inspect-server|if-|each-)'
```

Use `UPDATE_SNAPSHOTS=true` only after reviewing the intended generated-code change; never use it to obscure a runtime regression. Add explicit client/server snapshots for the new lowering. Existing snapshot families include `async-if-*`, `async-each-*`, `async-const`, `async-in-derived`, `async-top-level-group-sync-run`, and `async-top-level-inspect-server`.

After focused proof, broaden for the shared runtime/compiler surface:

```sh
pnpm test runtime-runes runtime-legacy signals
pnpm test snapshot compiler-errors validator server-side-rendering hydration
pnpm exec tsc --project packages/svelte/tsconfig.runtime.json --noEmit
pnpm exec tsc --project packages/svelte/tsconfig.json --noEmit
# Run ESLint and Prettier on the actual touched source/config paths.
git diff --check
# Before a PR, follow CONTRIBUTING.md and run the full suite:
pnpm test
```

Read the `agent-browser` skill if doing browser verification later. Recheck whether a sandbox server exists; a previously running user-owned server/session is not current evidence and should not be stopped casually.

### Evidence available at handoff

- This planning session inspected compiler/runtime wiring, local git references, current test harness configuration and sandbox source.
- Document checks passed: `pnpm exec prettier --check batch-script-replay-plan.md` and `git diff --check` (exit `0`). An automated local reference check also passed for 16 linked paths, 5 commit references, 44 fixture references at their stated commits, and 8 test-suite paths.
- A direct compiler probe of the user's three-derived example passed (exit `0`) and confirmed the existing generated shape. Other readonly compiler probes identified the declaration hazards described above. These were code-generation observations, not runtime verification of replay.
- No new replay runtime/compiler code was implemented or tested. No runtime suite was rerun merely to write this plan.
- Historical verification: the original handoff passed `pnpm test runtime-runes runtime-legacy signals` with **6,558 passed, 30 skipped**; the reduced implementation passed with **6,561 passed, 30 skipped**. Those results belong to their reference implementations, not this base or the proposed design.
- Historical negative evidence: removing batch reordering failed the committed-pending ordering fixture; lazy fork retention broke immediate abort/restarted work; the archived pending-commit rejection test failed on both handoff variants.

## 14. Fresh-session opening instruction

A useful opening request for the next session is:

> Read `AGENTS.md`, `CONTRIBUTING.md`, and `batch-script-replay-plan.md`. We are exploring per-batch script initialization with reactive readiness and stable template effects, starting from `06910d5b2b`, not extending the handoff branches. First verify the checkout and recover the narrowly selected regression tests. Resolve the phase-0 choices and build the phase-1 kernel/phase-2 narrow compiler spike. Preserve cached failed-fork errors on commit, prompt cancellation, established component state, and effect identity. Do not import the old runtime wholesale or declare success from initial rendering alone. Report counterexamples and unmet design obligations before generalizing.

The most important question to answer early is not “can three booleans gate this example?” It is:

> Can one initializer keep per-batch execution and errors coherent, retain stable producer/presentation identity, and publish exactly one established component lifetime without needing the old continuation-arbitration machinery?
