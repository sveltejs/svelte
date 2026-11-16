# Script replay compiler coverage and remaining design debt

Recorded on 2026-11-16 while default integration was being stabilized. This is a read-only compiler/runtime assessment, not another lowering extension. The only change made for this assessment is this document. Current integration results belong in [batch-script-replay-progress.md](batch-script-replay-progress.md).

## Fixed-corpus before/after measurement

The comparison captured the source text of 5,089 files matching `packages/svelte/tests/**/samples/**/*.svelte`, excluding `_output`, `_expected`, and `_actual` directories. It selected the 189 components with an instance-script top-level await according to the compiler's `has_await_expression` helper. Await expressions inside ordinary functions, template-only awaits, module compilation, and programmatic source strings inside unit tests are not part of this denominator. Server-only samples are included as language-shape probes, not as executed client-runtime tests.

- Capture time: `2026-11-16T22:09:29.365Z`.
- Captured corpus SHA-256: `a0ce06e06490896ec3a7ae87912cce4402e86e4d86e13bba2f6071d9132018a1`.
- Hash input: sorted paths relative to `packages/svelte`, followed by NUL, source text, and NUL for each file.
- Before: the actual `analyze_script_replay` implementation obtained with `git show e29a81d3d0:packages/svelte/src/compiler/phases/2-analyze/script-replay.js`, loaded in memory and applied to freshly analyzed copies of the same captured sources. This compares the old classifier, not an entire checkout of the old compiler.
- After: actual current `compile` calls with `experimental: { async: true }`, then strict `scriptReplay: true` and disabled `scriptReplay: false` calls for comparison. Fixture-specific compile options were not applied; source `<svelte:options>` were preserved.
- All 189 selected sources analyzed successfully. There were no discrepancies between current strict eligibility and actual default replay emission.

| Measurement on this same corpus                                          |                  Checkpoint classifier |      Current compiler |
| ------------------------------------------------------------------------ | -------------------------------------: | --------------------: |
| Script initializers in scope                                             |                                    189 |                   189 |
| Eligible for replay                                                      |                                     29 |                    93 |
| Rejected by the replay classifier                                        |                                    160 |                    96 |
| Default replay emission with `scriptReplay` omitted                      | 0, by the checkpoint's opt-in contract | 93, directly compiled |
| Newly eligible relative to the checkpoint classifier                     |                                      — |                    64 |
| Previously eligible but now rejected                                     |                                      — |                     0 |
| Default fallback output byte-identical to explicit `scriptReplay: false` |                                      — |              96 of 96 |

The earlier exploratory count of 28 accepted out of 182 was taken against a smaller, changing corpus. It must not be subtracted directly from this fixed-corpus result. Counts measure generated routing, not correctness or passing runtime tests.

## Exact first-rejection categories

These are mutually exclusive **first rejection** buckets, in classifier traversal order. A file can contain additional unsupported features hidden behind its first rejection. An increase in a later bucket can mean that an earlier restriction was removed, not that support regressed. Example paths below are relative to `packages/svelte/tests/`.

| First rejection category                        | Before | After | Current example or qualification                                                             |
| ----------------------------------------------- | -----: | ----: | -------------------------------------------------------------------------------------------- |
| Unsupported suffix statement/declaration shape  |     89 |    24 | Detailed breakdown below                                                                     |
| Nested/inline script awaits                     |     28 |    15 | `runtime-runes/samples/async-branch-commit-order/main.svelte`                                |
| Non-declaration synchronous prefix statements   |     16 |     0 | Prefix statements now stay in the stable shell                                               |
| Template awaits                                 |      7 |     0 | Ordinary helpers now use the common readiness contract                                       |
| Template binding directive                      |      4 |     0 | Proven for prefix state; replay-binding writes remain restricted                             |
| Suffix `$state` declarations                    |      2 |     5 | `runtime-runes/samples/async-binding-after-await/main.svelte`                                |
| Suffix `$derived.by`                            |      1 |     1 | `runtime-runes/samples/async-derived-batch-cache/Child.svelte`                               |
| Destructuring/uninitialized suffix declarations |      1 |     3 | `runtime-runes/samples/async-derived-destructured/Child.svelte`                              |
| Component exports/custom-element compilation    |      1 |     1 | `runtime-runes/samples/async-component-exports/Child.svelte`                                 |
| Template component                              |      3 |    12 | `runtime-runes/samples/async-record-initialization-private/main.svelte`                      |
| Template const tag                              |      2 |     3 | `runtime-runes/samples/async-const-closure-read/main.svelte`                                 |
| Template await block                            |      1 |     1 | `runtime-runes/samples/async-await-block/main.svelte`                                        |
| Template head                                   |      1 |     1 | `runtime-runes/samples/async-derived-title-update/main.svelte`                               |
| Suffix closures                                 |      2 |    13 | `runtime-runes/samples/async-nested-top-level/Foo.svelte`                                    |
| Template snippet block                          |      2 |     3 | `runtime-runes/samples/async-reference-in-snippet/app.svelte`                                |
| Nested suffix runes                             |      0 |     8 | Includes effects/inspect; e.g. `runtime-runes/samples/async-effect-after-await/Child.svelte` |
| Template attachment                             |      0 |     1 | `runtime-runes/samples/async-attachment/Inner.svelte`                                        |
| Custom-element readiness                        |      0 |     1 | `runtime-runes/samples/async-custom-element-attribute/main.svelte`                           |
| Template declaration tag                        |      0 |     1 | `runtime-runes/samples/async-declaration-tag/main.svelte`                                    |
| Template boundary                               |      0 |     1 | `runtime-runes/samples/async-derived-with-effect-and-boundary/main.svelte`                   |
| Template render tag                             |      0 |     1 | `runtime-runes/samples/async-snippet-coordinated-mount/Child.svelte`                         |
| Store subscription                              |      0 |     1 | `runtime-runes/samples/async-store-sub-teardown/main.svelte`                                 |
| Total rejected                                  |    160 |    96 | Not an executed-test count                                                                   |

The current broad suffix-shape bucket consists of **21 function declarations after the await boundary, 2 try statements, and 1 throw statement**. No current member of that first-rejection bucket is a multi-declarator declaration, even though that syntax remains restricted. Examples are `async-indirect-blockers/Component2.svelte`, `async-effect-orphan/main.svelte`, `set-context-after-await/Child.svelte`, and `async-error-in-script/main.svelte` under `runtime-runes/samples/`.

Other active classifier restrictions include writes to replay bindings, forward references, prefix captures of replay bindings, known state-mutating local/raw-await initializers, and a same-group local → derived → local/statement dependency. None was the first rejection of a source in this captured corpus. Some are covered by compiler unit tests; zero occurrences here is not proof that the restrictions or their edge cases are solved.

## Mutation gap: admitted does not mean safe

`calls_state_mutator` follows an identifier callee only when its binding's initial value is directly a function declaration/expression or arrow. Within those known functions it recognizes writes to bindings classified as state, raw state, or derived, including transitive direct function calls. It is not a purity analysis or a complete call graph.

Read-only compile probes produced the following results:

| Shape used as a local initializer or raw await                   | Default route  | Strict option |
| ---------------------------------------------------------------- | -------------- | ------------- |
| Direct known prefix helper mutating `$state`                     | Existing `run` | Rejected      |
| Direct known prefix helper reached through another direct helper | Existing `run` | Rejected      |
| Prop callback, e.g. `await mutate()` after `$props()`            | Replay         | Accepted      |
| Prop callback used by `const value = mutate()` after an await    | Replay         | Accepted      |
| Imported helper invoking a supplied mutating callback            | Replay         | Accepted      |
| Alias, e.g. `const alias = mutate; const value = alias()`        | Replay         | Accepted      |
| Member call, e.g. `helper.mutate()`                              | Replay         | Accepted      |

For example, this is currently admitted:

```svelte
<script>
	import { invoke } from './helper.js';
	let n = $state(0);
	function mutate() {
		n++;
		return n;
	}

	await Promise.resolve();
	const value = invoke(mutate);
</script>

{value}
```

If `invoke` calls its callback synchronously, the write runs under the initializer's tracked async reaction. The runtime currently retains that reaction while selecting the attempt-owned `active_effect`; changing resource ownership does not change the mutation rule. The guard in `reactivity/sources.js:set` rejects writes to pre-existing state under an `ASYNC` reaction unless untracking is active. A small in-memory guard probe under an async reaction produced `state_unsafe_mutation`.

This establishes a concrete admitted surface and the relevant runtime prohibition. It is **not** an end-to-end generated-component regression test for every imported/prop/alias case. Those cases must not be described as supported merely because the classifier accepts them or because the ordinary fixture corpus passes.

Standalone continuation statements now use `$.untrack`, which fixes the existing `await wait(); set(1)` case without changing its assertions. That does not justify untracking raw awaits or local initializers: those reads currently provide pre-seal dependency/version information needed to reject mixed snapshots. Resource ownership, dependency tracking, and permission to execute imperative script writes need distinct contracts.

## Prefix self-write feedback

The stable prefix is not replayed, but its state can be written by a replayed continuation. Consequently this shape is admitted by both default and strict compilation:

```svelte
<script>
	let n = $state(0);
	const load = (value) => Promise.resolve(value);
	function bump() {
		n++;
	}

	let a = $derived(await load(n));
	bump();
	let b = $derived(await load(a));
</script>

{a} {b}
```

The dependency cycle is real: `n` drives the first producer; its checkpoint admits `bump`; `bump` changes `n`; the completed prefix can then invalidate an unfinished attempt; the replacement executes `bump` again. `untrack` permits the statement's write and prevents its own reads from becoming dependencies, but it does not erase the first producer's dependency on `n`.

A bounded in-memory kernel diagnostic used the compiler's current four-argument stage/group ABI, limited the statement to **three actual writes**, and deliberately left the final producer pending. It observed:

- 12 factory executions;
- 7 statement executions for those 3 writes;
- repeated first-producer inputs across views;
- 4 pending attempts before cleanup;
- no sealing while the final producer was deliberately unresolved.

The diagnostic completed with exit `0` under `node --conditions=development --input-type=module`; its root was destroyed afterward. The intentionally unresolved final producer means “not sealed” is expected and is not itself a failed assertion. The useful evidence is replay amplification after a bounded set of self-writes. An unlimited variant was **not** executed, and this is not a proof that every such program loops forever. It is also not a generated DOM/fork regression test.

The already passing continuation test mutates prefix state that is not an upstream input of the initializing producer. That proof must not be extended to this feedback case. Stable-prefix state preservation and coherent replay invalidation do not, by themselves, define a terminating policy for writes made by initialization itself.

The existing batching path makes this more than a local effect-recursion question. `sources.set` passes `legacy_updates` to `internal_set`, which passes it through `Batch.capture` to reaction marking. During batch traversal that array is active; marked effects are subsequently scheduled in another `Batch.ensure()` batch. Despite its deprecated name, this path also applies to ordinary `set` calls in runes code. `untrack` neither suppresses those writes nor removes the producer's already-recorded input dependency. Replay then has both new-view admission and completed-prefix invalidation to consider while the earlier attempt is still unfinished. Simply bypassing the mutation guard therefore leaves the write scheduling/replay interaction unresolved, and globally suppressing these updates would change existing ordering semantics.

A new contract must connect three separate questions: which initializer reads are tracked, how its writes participate in the existing `legacy_updates`/batch scheduling path, and which of those changes are allowed to invalidate or replay the initializer that caused them. No change to that contract was attempted here.

## Remaining design obligations

Do not change lowering further merely to improve the eligibility count while the current default-integration failures are being fixed.

Before broadening imperative initializers, define and test:

1. How ordinary script writes are allowed while reads needed for unfinished-attempt validity remain tracked.
2. Which writes belong to the attempt, which mutate established prefix state, and what survives attempt replacement/discard.
3. How the runtime distinguishes an initializer's own write from an external invalidation, without suppressing legitimate producer updates or publishing mixed snapshots.
4. Cancellation and validity checks at each nested/inline suspension, including per-producer-run validity after sealing.
5. Kind-correct signal/prop/state publication and writes; multi-binding output and closure lifetime; no unversioned staging cache for same-group derived reads.
6. The remaining template consumers, including template declarations whose own shared `run` lowering has not yet become replay.

Globally untracking local/raw-await work, suppressing mutation errors, or permanently rejecting arbitrary imported calls would each hide a different part of the problem rather than complete the design.

## Explicit migration debt and verification status

Default auto-eligibility, the retained shared runner, and `experimental.scriptReplay` are temporary migration mechanisms. The compiler currently has two script-initialization models, and 96 of the 189 inventoried initializers still use the older one. A passing full suite would be necessary evidence for default integration, but would not prove the original single-model goal or cover the admitted mutation gaps above.

This assessment ran no broad suite and changed no compiler, runtime, or test source. The comparison and compile probes completed with exit `0`; 96/96 fallback outputs matched the explicitly disabled route. The bounded development-mode kernel probe also completed with exit `0`. Current runtime failure counts and the eventual full-suite result must be reported separately by the integration owner, not inferred from these read-only checks.
