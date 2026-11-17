# Replay binding storage: post-await state

> **Paused WIP at the user's request.** All agents were stopped so the repository can be used for other work. The focused handoff check has one deliberately preserved failing regression: equal-valued Source adoption reruns a renderer. The last full-suite-green checkpoint is `84e7ae403d`. No generic version-equivalence fix has been implemented.

## Starting point and location

Work resumed in `/Users/rich/Development/SVELTE/svelte`, branch `batch-views-whole-script-replay`, at clean checkpoint `84e7ae403d`. The user requested that ongoing work return here. The previous `worktrees/whole-script-replay` directory is now detached and is not the active task directory.

The user has already specified the semantics: whole instance initialization per admitted unfinished view; initialization writes stay in their batch without replaying imperative work; external writes start fresh initialization; publication preserves established state and effect identity. No new observable semantic choice is needed for the bounded scalar-state extension below.

## Scope

Support identifier `$state(...)` and `$state.raw(...)` declarations after an earlier script await, plus their ordinary reads, assignments, updates, and narrowly supported callback registration. Existing unsupported deep-proxy writes, stateful classes, context mutations, arbitrary suspensions, writable deriveds, and broader closure forms are not implicitly admitted.

This removes a whole-component fallback caused solely by placing an ordinary supported state declaration after an await. It does not solve asynchronous callback write ownership.

## Pinned storage and lowering contract

- Add one one-shot stage kind, `state`. A completed stage stores an actual native Svelte `Source`, not its current value, in the attempt snapshot.
- Retain the four-argument `script_replay(factory, kinds, checkpoints, groups)` ABI and existing atomic synchronous groups.
- `script.bindings[site]` remains a stable projection of the selected native Source handle for a state site. The established `script.locals` array retains the winning handles after publication. An older healthy fork adopts those handles, not its own discarded state allocation.
- Reads of state **values** go through a separate equality-preserving derived projection. Allocate it once in the existing `script.readers` map at `environment.length + site`, with the conceptual body `get(script.selection); return get(get(script.bindings[site]))`. The direct selection dependency preserves per-view projection versions when an equal-valued native Source is adopted; it must not collapse a private view's version into an unrelated global cache version. Compiler emission uses `facade.read(key)` in producer/stage expressions and `script_read(script, key)` in presentation. Handle replacement with an equal visible value must not itself force a producer request or template-effect body to rerun.
- Writes select the actual Source handle through `get(bindings[site])` or `get(script_binding(script, site))` before evaluating the RHS, and use the existing native state assignment/update helpers. Value reads and write-reference selection are deliberately distinct operations.
- The logical external-override key is also `environment.length + site`. Use the existing `facade.state(key, native_source)` registration while executing the controlled initialization group. The declaration initializer still executes; an explicit external override is applied before following statements read the newly allocated state.
- State declarations must produce actual Sources even where native declaration optimization would otherwise return a scalar or proxy directly. Reuse native proxy/tag and assignment semantics rather than confusing a raw value with a Source.
- Before atomic group publication, references to state declared in that group read its factory-local native Source directly. Same-group derived dependency validation must treat unpublished state handles like unpublished ordinary locals.
- An initializer-created registered callback that writes the newly declared state must capture its native Source, not choose a different attempt's Source when invoked later. Such a callback is **not** wrapped in an initialization context: invocation from an external event is still an external write. Forward references and unproved closure captures retain explicit fallback.
- Keep the existing private-failure rules: unrelated publication cannot swap away a failed fork's cached inputs/error or retry its failed expression. Source adoption is not permission to erase failures.

## Deterministic baseline

Three generated fixtures were added without replay opt-in or opt-out. At the starting checkpoint all three used the old `run` lowering:

```sh
pnpm test runtime-runes -t '^async-script-replay-post-await-state-'
```

Result: **FAIL, exit `1`: two failed, one passed**; no hang. Evidence: `/tmp/svelte-post-await-state-baseline.log`.

- `post-await-state-isolation`: the real input-2 view could not publish independently while the speculative input-1 continuation was pending. The test also requires later user edits, snapshots, DOM nodes, and event behavior to survive an older fork commit.
- `post-await-state-external-write`: editing initialized state while a later await was pending requested a later value but did not execute a fresh whole initializer. The test requires the override to survive late state allocation before its fresh snapshot is taken.
- `post-await-state-self-write`: the old lowering already executes its synchronous increment once. This is a compatibility test, not evidence that replay supports the shape. Compiler admission tests must prove that the extension actually selects replay.

## Interim implementation checks

All five generated fixtures now pass under default replay emission, with the three original regression assertions unchanged. Two additional fixtures cover readonly state boxing, number/BigInt pre/post updates, raw-state replacement, `bind:value`, retained nodes, and preservation of the `state_unsafe_mutation` restriction inside a user derived.

```sh
NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-script-replay-post-await-state-(isolation|external-write|self-write) '
NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-script-replay-post-await-state-(operators|derived-purity) '
pnpm test runtime-runes -t '^async-' --reporter=verbose
```

These working-tree runs passed, exit `0`: **3**, **2**, and **881** tests respectively. All five generated state components were inspected for actual `script_replay` emission; the passing self-write/operator cases are not being credited merely because old fallback would also pass. The broad async log is `/tmp/svelte-post-await-state-async-first.log`.

The new handwritten kernel proof still found a counterexample: a private state-value projection and the first global projection can independently reach the same value with different versions. Adopting the winning Source does not refetch the producer, but later promotion can unnecessarily execute the renderer. Its exact no-extra-render assertion remains strict. This is not effect recreation, and it is not a reason to relax the proof.

Cross-view reuse of an older value version was considered and rejected because `changed_since` uses numeric version ordering for writable-derived overrides. The current investigation is limited to equivalence of versions representing the **current unchanged global value**, without changing version chronology or transferring records/abort controllers. It requires generic signal regressions, including multiple private forks, unequal values, and writable overrides—not only a script-specific test.

New inline initializer callbacks are intentionally limited to those that capture at least one already-initialized suffix state binding. Native prefix captures may accompany that state capture. Prefix-only or unrelated callback syntax is not incidentally admitted by this storage extension.

## Paused handoff

The user requested a natural stopping point to do other work in this repository. All agents were stopped before this handoff. The implementation is checkpointed as WIP, not as a completed or fully verified migration.

Frozen-source handoff checks:

| Command                                                                  | Result                                   |
| ------------------------------------------------------------------------ | ---------------------------------------- |
| `pnpm test script-replay`                                                | FAIL, exit `1`: **145 passed, 1 failed** |
| `pnpm exec tsc --project packages/svelte/tsconfig.runtime.json --noEmit` | PASS, exit `0`                           |
| `pnpm exec tsc --project packages/svelte/tsconfig.json --noEmit`         | PASS, exit `0`                           |

The new client/server state snapshot was generated, reviewed, and then checked without update mode: `FILTER=async-script-replay-post-await-state pnpm test snapshot` passed, exit `0`, **one test**. Source and handoff-note formatting and `git diff --check` passed. No full suite was run for this WIP checkpoint.

The one failure is `post-await state kernel > adopts equal-valued winning Sources without refetching or recreating presentation` in `packages/svelte/tests/script-replay/state.test.ts`. It observes two identical `[7, 7, 7, -100]` renders instead of one. Winning Source identity and no-refetch assertions passed before that assertion; the failure was not weakened. Complete output: `/tmp/svelte-post-await-state-handoff.log`.

No generic changes to `runtime.js`, derived version comparison, or version-equivalence metadata were made. The possible bounded equivalence approach above is a proposal, not a fix. The next investigation must prove multiple independently initialized equal-valued forks and writable-derived override chronology, then run focused signal tests and the full suite. Do not claim this checkpoint is green based on the five generated cases or the diagnostic 881-test async pass.

The last completed full-suite-green checkpoint remains `84e7ae403d` (8,424 passed, 39 skipped).
