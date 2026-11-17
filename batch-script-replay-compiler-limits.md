# Script replay compiler coverage and remaining design debt

Recorded on 2026-11-16 while default integration was being stabilized. This is a read-only compiler/runtime assessment, not another lowering extension. The only change made for this assessment is this document. Current integration results belong in [batch-script-replay-progress.md](batch-script-replay-progress.md).

> The inventory below records the 2026-11-16 suffix-based implementation, not the current whole-factory eligibility count. The 2026-11-17 whole-script context boundary is recorded at the end of this document.

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

## 2026-11-17: whole-script context boundary

The user subsequently replaced the stable-prefix proposal with [whole-instance initialization](batch-script-replay-whole-script-api.md). Supported scripts now create their user declarations, state, functions, and side effects inside each attempt factory. Initialization reads are tracked, and initialization-owned writes use an explicit runtime context rather than globally untracking the script. The historical mutation-gap counts and self-write diagnostic above are not results for this new implementation.

Component context maps are **not yet per-attempt**. In particular, `setContext` currently requires a pre-mount branch and no active reaction; simply executing it in the tracked factory would fail even on the first initialization. Clearing `active_reaction` or globally toggling `component_context.i`/`.c` would not establish isolation between concurrent attempts.

The compiler therefore keeps the entire component on its existing lowering when it recognizes an unsupported context mutation before suspension. It does not keep a context-setting prefix outside an otherwise replayed script. Strict `scriptReplay: true` reports `per-attempt component context setters`. The classifier recognizes named/aliased/namespace `setContext`, locally visible `createContext` setters, directly called module helpers containing setters, and known `getAllContexts()` map `set`/`delete`/`clear` operations. It is not inter-module effect analysis: an opaque imported helper can still conceal a context mutation, so this guard is not a full-language safety proof.

Read-only `getContext`/`hasContext`/`getAllContexts` access to a valid stable parent context is not rejected. Ordinary `$effect`, onMount, and onDestroy registration are not rejected merely for using component lifecycle machinery; their attempt resource ownership is a separate runtime contract. No claim is made that arbitrary shared context-map mutation or rebinding works under replay.

Other explicit whole-factory limits include unproved external proxy mutation carryover, bindable-prop mutation hooks, and `$props.id` hydration initialization. Actual native state sources use `facade.state(slot, source)` so external scalar state edits can be adopted before following initialization reads. That does not by itself prove deep proxy writes, derived overrides, or mutable local fallback state inside prop accessors. These restrictions must remain explicit until separately proved, not be hidden by passing unrelated tests.

### Stateful classes and constructors

A compile audit confirmed that prefix class fields, `this.value = $state(...)` constructor assignments, and constructor-local `$state` variables were admitted by replay while generating a native `$.state` call with **no** `facade.state` registration. Class-field lowering happens outside the hooked top-level variable-declaration path; constructor-local bindings are not top-level environment slots either.

For example, a prefix `class Counter { value = $state(0); }` followed by `const counter = new Counter()` can expose a callback that writes `counter.value` while the final script await is pending. Reconstructing the class on the next attempt cannot preserve that external edit using the scalar variable-slot hook alone. This is a generated-code capability finding, not a claimed passing runtime carryover test.

The classifier now rejects known stateful class/constructor initialization in strict mode and retains the whole existing component lowering by default. The guard covers visible class fields, constructor-local creation, statically visible helper-created state, and known component-module constructors reached through allocations, aliases, or inheritance. It does not implement generalized class ownership. Stateless classes remain eligible and retain native captures inside the attempt factory.

There is still an explicit opaque-constructor gap: `import Counter from './Counter.svelte.js'; const counter = new Counter()` can be admitted because the component compiler cannot inspect that imported constructor's state creation. A compile-only probe confirmed replay emission with no constructor state registration for this opaque form. Dynamic/imported stateful constructors must not be described as covered by `facade.state`; no class/proxy ownership generalization was attempted in this audit.

### Immutable versus mutable accessor reads

The current `Accessor.reactive` flag selects an equality-preserving reader; it is not a claim about the source-language binding kind. Immutable prefix `const` bindings use that path too. This prevents publication of another environment from invalidating a producer merely because an unchanged constant key is now read through another accessor. Mutable ordinary locals and reassignable functions remain live, uncached getter reads.

Memoizing a const binding caches its value/reference, not its object's properties or a function's captured state. Native property reads still observe the same mutable object, and genuinely different object/function identities are not collapsed. The focused prefix-error regression and the existing mutable-local environment test passed with this metadata distinction.

### Deferred helper state writes

`async-resolve-stale` exposed a different limit from synchronous initialization writes. Its initializer calls `asd`, which schedules `update_and_resolve` using `Promise.resolve().then(...)`. That callback increments `$state` before resolving the awaited request. The synchronous initialization context has already ended, so this write is external; admitting another whole factory can recreate the request/resolver environment and repeat the callback indefinitely. Keeping an ambient initialization context across foreign microtasks would misattribute unrelated work and is not a solution.

The compiler now conservatively retains the entire existing component lowering for known initialization-reachable deferred state writers. Strict mode reports `state writes in deferred initialization callbacks`. This is a general classifier, not a fixture-specific option or exception. The actual `async-resolve-stale` source is checked against disabled replay output in a compiler unit test.

The local call graph starts at executed instance initialization expressions. It follows visible function definitions, aliases/reassignments, callback parameter forwarding, and bound callback arguments. It recognizes `.then` (both callbacks), `.catch`, `.finally`, global timers/microtasks, common global-object aliases, and named `node:timers` imports. A known async helper containing its own await is conservatively treated as deferred for state-write analysis; the check is not path-sensitive enough to distinguish an otherwise-safe write before that await. Framework state/prop writes and known state-object mutations are identified by binding identity, including visible parameter/alias paths.

Function bodies are not inspected merely because they are declared. Uncalled after-publication event helpers and callbacks passed to an ordinary opaque `register` API remain eligible. Synchronous visible helpers, synchronous Promise executors, and opaque synchronous imported/prop callbacks also remain eligible. A Promise executor is synchronous; callbacks it schedules through a recognized deferred API are not.

The bounded regression `async-script-replay-deferred-writer-fallback` limits the bad path to three writes and four requests, so it fails finitely rather than starving timers. Before the guard it produced `3 / 42 / 4` instead of `1 / 42 / 1`. With default compilation and unchanged assertions, the guarded component uses the existing lowering and passes. The original resolve-stale DOM/hydration cases also complete and pass.

This fallback does not implement deferred-write attribution. An opaque imported or prop helper can conceal asynchronous state writes; arbitrary dynamic/higher-order callback production and effectful getters are not proved by this local analysis. Method-based mutations such as array mutators or collection `.set` calls are not expanded into writes, and recursion is bounded rather than interpreted for every possible callback-parameter flow. Conversely, branch/assignment unions and method-name recognition are conservative and can reject a path that would not actually write state during that initialization. In particular, the compiler cannot distinguish an opaque API that invokes a supplied callback synchronously from one that invokes it in a later microtask, while also preserving legitimate external callback registration. Such admitted opaque async behavior remains an explicit implementation gap. Class/context guards remain separate, and no runtime ambient-context propagation was added.
