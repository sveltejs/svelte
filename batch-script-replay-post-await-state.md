# Post-await state: generated regressions and baseline

## Scope and starting point

Work resumed on 2026-11-17 in `/Users/rich/Development/SVELTE/svelte`, branch `batch-views-whole-script-replay`, at `84e7ae403d7e22768a9b287498c3aafb96ba0a59` (`Replay whole instance scripts with scoped initialization writes`). The initial worktree was clean. The older detached worktree was not inspected or edited.

This work adds only three `async-script-replay-post-await-state-*` fixture directories and this note. Runtime/compiler changes and strict-admission unit tests belong to the implementation owners. Existing fixtures and assertions are untouched.

The current whole-script contract applies to state declared **after** a suspension too:

- Unpublished state/snapshots belong to the selected initializer attempt, not a shared continuation.
- First real publication establishes the winning state identity and ordinary snapshots. An older fork cannot replace that state, user edits, or DOM/event identity.
- External edits to a logical state binding must survive fresh whole initialization, including when the new state source is allocated only after a later await. Following snapshot initialization must observe the carried write.
- An initializer's own synchronous write stays in the same batch, runs once, and does not restart the factory or repeat earlier awaits.

## New fixtures

All fixtures use default compilation with `mode: ['client']`; no strict/opt-in replay flag or expected-error exemption is added. Small no-await wrappers keep controls available while async children initialize. Requests live in stable parent storage, are identified explicitly, and resolve only through buttons.

### `async-script-replay-post-await-state-isolation`

The child has this shape:

```svelte
const first = $derived(await load('first', input)); let local = $state(first); const snapshot =
local; const result = $derived(await load('last', input));
```

F initializes input 1 through its first await and leaves its last request pending. R independently initializes input 2, resolves both its requests, and must first publish:

```text
2|2|2|2
```

The fields are input, snapshot, local state, and last result. Editing R's local state produces `2|2|3|2`. Resolving and committing the older fork must produce `1|2|3|1`, preserving both the paragraph and edit-button nodes. Clicking that same edit button again must produce `1|2|4|1`, proving its handler still writes the established state, not the losing attempt's late-created source.

There is at most one request for each producer-site/input pair: first/last × 1/2. Unexpected repeats park on an unresolved promise and emit a diagnostic; they are not silently resolved or allowed to loop.

### `async-script-replay-post-await-state-external-write`

A raw controlled `start` await precedes `let n = $state(0)`, `const snapshot = n`, a registered `() => n++` callback, and a later async-derived `value` loaded from n.

After the first start resolves, the child waits on value 0. A parent event invokes the registered callback externally. Required behavior is a fresh `prefix` and a second, separately labelled start request. When that request resolves, logical state override 1 must apply **before** snapshot initialization: `state 1/1`, followed by value 1. Final output must be `<p>1|1|1</p>`. Resolving the obsolete value-0 request afterward must not alter output or node identity.

The two start requests have explicit occurrence indices 0 and 1. Value 0 and value 1 each allow one request. No generic queue-draining loop or unbounded request/retry allowance is used.

### `async-script-replay-post-await-state-self-write`

A raw controlled start await precedes state n=0, ordinary snapshot before=0, and a guarded synchronous `n++`. The later request is for value 1. While it stays pending, additional ticks and one macrotask must produce no extra prefix, write, or load. Final output is `<p>0|1|1</p>`.

A nonreactive parent-side write cap stops writes after four invocations if a broken implementation restarts repeatedly. Duplicate loader calls park; loaders do not automatically resolve. The assertions still require exactly `write 1` and one value-1 request, not any larger bounded count.

## Compiler/runtime surface required

The fixture/API requirements were sent to main before implementation work:

1. Allocate native scalar state within a continuation group, after its blocker is ready.
2. Register that source under a stable logical state slot, applying any incoming external override before subsequent snapshot statements read it.
3. Publish late state accessors for template reads and native write/update operations; do not expose an uninitialized accessor or a losing attempt's source.
4. Preserve a post-await registered callback's closure and later redirect live template handlers to established state after publication/adoption.
5. Admit the post-await state declaration, its template update, the registered callback arrow, and the direct synchronous update expression without using fixture-level compile flags.
6. Keep synchronous group ordering and initializer-write provenance so state construction/SELFWRITE does not recursively restart initialization.

Strict-admission compiler coverage is separate. A default fixture passing through fallback is not evidence that this new generated path is supported.

## Baseline on unchanged `84e7ae403d`

Immediately before the run, `git diff --quiet -- packages/svelte/src` confirmed runtime/compiler sources were unchanged from HEAD.

```sh
pnpm test runtime-runes -t '^async-script-replay-post-await-state-'
```

**FAIL, exit `1`: 2 failed, 1 passed, 3181 skipped** (3184 total tests). Started 13:01:05; Vitest duration 5.00s. No hang or forced termination. Full local output: `/tmp/svelte-post-await-state-baseline.log`.

| Fixture              | Baseline | Meaningful evidence                                                                                                                                                                                                                   |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `...-isolation`      | FAIL     | After R's first and last requests resolve, output is still empty instead of `<button>edit local</button><p>2                                                                                                                          | 2   | 2                                                                                                              | 2</p>`. F's last request is deliberately still pending. Later edit/old-fork commit/handler-identity assertions are unreached. |
| `...-external-write` | FAIL     | External state edit logs only `load value 1 #0`, instead of a fresh `prefix` and `load start 0 #1`. The old shared initializer is reused. Override-at-late-allocation, recomputed snapshot, and late-result assertions are unreached. |
| `...-self-write`     | PASS     | Exactly one synchronous write, no prefix/await restart while pending, and final `<p>0                                                                                                                                                 | 1   | 1</p>` under the existing fallback. This is a compatibility baseline, not a passing new replay implementation. |

Generated client output was inspected for all three children. Each uses shared hoisted variables with `$.run([...])` and `$.async_derived`, not `$.script_replay`. State is currently created as a native source inside the one shared continuation; the external-write closure captures that shared late variable. This confirms that default compilation exercised the current unsupported-surface fallback rather than accidentally enabling the proposed extension.

The failing output and fresh-initialization assertions remain unchanged. No result was weakened to match fallback, and no runtime/compiler edits were made by the regression agent.

Static verification passed, exit `0`: Prettier checked this note and all three `_config.js` files; `node --check` passed for each config. Test `.svelte` files are excluded from Prettier by repository policy and were compiled by the focused runtime command above. No full-suite result is claimed for this regression-only task.

## First implementation check — interim, not frozen verification

After the compiler owner reported admission support and the runtime owner added state-value projections, ran only the three original fixtures with forced regeneration in `/Users/rich/Development/SVELTE/svelte`:

```sh
NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-script-replay-post-await-state-(isolation|external-write|self-write) '
```

**PASS, exit `0`: 3 passed, 3183 skipped** (3186 total tests). Started 13:20:01; Vitest duration 7.03s. Evidence: `/tmp/svelte-post-await-state-implementation-first.log`. The fixture source, assertions, request bounds, and compile options were unchanged.

All three generated client `Child.svelte.js` files were read after the run. Each now uses `$.script_replay` and a `state` stage; none uses the old `$.run`/`$.async_derived` fallback described in the baseline:

- The state source is allocated and registered with `$$access.state(...)` inside its late atomic group, before the following snapshot reads the native source.
- The external-write callback captures that group's native `n` source (`() => $.update(n)`), preserving the target identity needed for an explicit external edit and fresh late allocation.
- Isolation's live edit handler selects the current state handle through `$.get($.script_binding(...))` before updating it, rather than retaining F's discarded source.
- Producer/presentation value reads use the separate facade/`script_read` projection instead of confusing a native Source handle with its current value.

The passing semantic assertions include independent R publication with state/snapshot 2, edited state 3 and retained DOM/handler identity after old F commit, the carried external write and recomputed snapshot 1 after fresh initialization, and the once-only synchronous SELFWRITE without factory restart.

This is a temporary working-tree result while implementation work continues. In particular, the runtime owner was still investigating the generic equal-value fork-adoption/duplicate-render issue, which these three cases do not exhaustively prove. This run is not final frozen verification, a full-suite result, or a result for main's separate operator/purity tests.
