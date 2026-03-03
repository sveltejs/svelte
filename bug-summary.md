# Bug: `{@const}` derived re-evaluates with stale values inside inert `{#if}` blocks

## The problem

When a conditional block containing `{@const}` and a nested `{#if}` is torn down while a global outro transition keeps the DOM alive, the `{@const}` derived re-evaluates with stale/undefined values instead of being skipped.

Minimal reproduction:

```svelte
<!-- main.svelte -->
<script>
  import Inner from './Inner.svelte';
  let value = $state('hello');
  function compute(v) {
    return { data: v, ready: true };
  }
</script>

<button onclick={() => { value = undefined; }}>clear</button>

{#if value}
  {@const result = compute(value)}
  {#if result.ready}
    <Inner data={result} />
  {/if}
{/if}
```

```svelte
<!-- Inner.svelte (has a global outro transition) -->
<script>
  let { data } = $props();
  function fade(node) {
    return { duration: 100, tick: (t) => { node.style.opacity = String(t); } };
  }
</script>
<div out:fade|global>
  <p>{data.data}</p>
</div>
```

When the button is clicked, `value` becomes `undefined`. The outer `{#if value}` becomes false, and `compute(undefined)` is called even though the block is being torn down. In real applications this causes runtime errors (e.g. trying to access properties on `undefined`).

## Root cause

The bug is in `#traverse_effect_tree` in `batch.js`. This method uses a while loop with a linked list (`effect.first` / `effect.next`) to walk the entire effect tree depth-first. The critical sequence when `value` becomes `undefined`:

1. The outer `{#if}` creates a **BLOCK_EFFECT**. During traversal, `update_effect(BLOCK_EFFECT)` runs — this evaluates the condition as false and calls `pause_effect(BRANCH_EFFECT)`.

2. `pause_effect` marks the BRANCH_EFFECT as **INERT**. Because `Inner.svelte` has a global outro transition (`out:fade|global`), the branch is kept alive (not destroyed) so the transition can play out.

3. After `update_effect` returns, the traversal continues into the INERT BRANCH_EFFECT's **children** via `child = effect.first`. The traversal does not skip INERT branches.

4. Inside the INERT branch, it finds the nested BLOCK_EFFECT (from `{#if result.ready}`). It calls `is_dirty(effect)` to check if it needs updating.

5. `is_dirty` iterates the effect's dependencies. It finds the `{@const result = compute(value)}` derived is dirty (because `value` changed). It calls `update_derived(const_derived)`.

6. `update_derived` calls `execute_derived`, which calls `compute(undefined)` — **the bug**.

### Why this only happens in non-async mode

In async mode (`experimental.async: true`, the default in the test framework), `BranchManager.ensure` takes a deferred path: it calls `batch.skip_effect()` and `batch.oncommit()`, which adds the branch to `#skipped_branches`. The traversal then skips the branch via the `this.#skipped_branches.has(effect)` check.

In non-async mode, `should_defer_append()` returns `false`, so `BranchManager.ensure` calls `#commit(batch)` immediately. The `pause_effect` happens inside `update_effect`, and the traversal proceeds into the now-INERT branch's children without any skip.

### Why a nested `{#if}` is required

Without the nested `{#if}`, the children of the BRANCH_EFFECT are only RENDER_EFFECTs, which are safely pushed to the `render_effects` array and skipped when INERT. A nested `{#if}` creates a nested BLOCK_EFFECT, which triggers the `is_dirty` → `update_derived` path.

### Why a global transition is required

`pause_children` collects transitions to decide whether to defer destruction. For non-transparent children, `local` is set to `false`, and transitions are only collected if `transition.is_global || local`. A local transition (`transition:fade`) is not collected, so the branch is destroyed immediately and its effects are unlinked — the traversal never reaches them. A global transition (`out:fade|global`) is collected, keeping the branch INERT but alive.

## The fix (4 changes)

### 1. `deriveds.js` — Skip `update_derived` for INERT parents

The primary defense. Before re-evaluating a derived, check if its parent effect is INERT. If so, return the stale value — the block is being torn down so the derived's value doesn't matter.

```js
export function update_derived(derived) {
  var parent = get_derived_parent_effect(derived);
  if (parent !== null && (parent.f & INERT) !== 0) {
    return;
  }
  var value = execute_derived(derived);
  // ...
}
```

### 2. `batch.js` — Skip INERT BRANCH_EFFECTs during traversal

The secondary defense. Prevents the traversal from entering INERT branches at all, which is also more efficient.

```js
var skip =
  is_skippable_branch ||
  this.#skipped_branches.has(effect) ||
  ((flags & BRANCH_EFFECT) !== 0 && inert);
```

### 3. `branches.js` — Re-schedule resumed effects

When a branch is resumed (INERT cleared), the subtree was skipped during traversal. `schedule_effect(onscreen)` ensures a subsequent traversal processes it.

```js
resume_effect(onscreen);
this.#outroing.delete(key);
schedule_effect(onscreen); // new
```

### 4. `effects.js` — Remove redundant CLEAN marking in `resume_children`

The CLEAN-marking in `resume_children` for async mode is no longer needed because `schedule_effect` in `branches.js` handles re-scheduling, and the INERT skip in `batch.js` prevents premature processing.

## Test verification

The test (`if-block-const-inert-derived`) explicitly disables `async_mode_flag` at runtime via `before_test`/`after_test` hooks to exercise the non-async code path where the bug manifests. The `compileOptions: { experimental: { async: false } }` prevents the async import from being added to the compiled test output.

| deriveds.js patch | batch.js patch | Result |
|---|---|---|
| OFF | OFF | **FAIL** — `compute(undefined)` is called |
| ON | OFF | PASS — `update_derived` returns early for INERT parent |
| OFF | ON | PASS — traversal skips INERT branches entirely |
| ON | ON | PASS — both layers of protection active |

Full runtime-runes test suite (2387 tests) passes with all patches applied.

## Investigation timeline

1. **Observed the bug in GitButler** — the UI would freeze when Svelte 5 re-evaluated `{@const}` expressions with `undefined` values during block teardown.

2. **Initial test attempt** — wrote a test with `{#if value}` + `{@const}` + a child component with a transition. The test always passed because:
   - No nested `{#if}` meant no nested BLOCK_EFFECT — only RENDER_EFFECTs which are handled safely
   - The test framework runs with `async_mode_flag = true` by default, which takes the deferred path

3. **Instrumented the Svelte internals** — added logging to `update_derived`, `pause_effect`, `BranchManager.ensure`, `#traverse_effect_tree`, and `is_dirty` to trace the exact execution path.

4. **Discovered the async/non-async distinction** — `SVELTE_NO_ASYNC=true` confirmed the bug only triggers in non-async mode. In async mode, branches are deferred via `#skipped_branches`.

5. **Added nested `{#if result.ready}`** — this creates the BLOCK_EFFECT inside the BRANCH_EFFECT needed to trigger `is_dirty` → `update_derived`.

6. **Switched from `transition:fade` to `out:fade|global`** — local transitions aren't collected for non-transparent children in `pause_children`, causing immediate destruction. Global transitions keep the branch INERT but alive.

7. **Added `before_test`/`after_test` hooks** — explicitly toggle `async_mode_flag` since it's a global mutable flag that gets enabled by prior tests in the suite.

8. **Verified all four patch combinations** — confirmed the test fails without the patches and passes with either or both patches applied.
