# Batch views and version checking

This document describes how the `batch-views` branch decides whether a reaction (derived or effect) is up to date, in the presence of several batches that are in flight at the same time. It covers what each part does, why it is needed, why it can't easily be simplified (and what behavioural changes elsewhere would allow simplifying it), how the parts fit together, and where they overlap.

The relevant code lives in

- `packages/svelte/src/internal/client/runtime.js` — `version_of`, `is_current`, `is_dirty`, `update_dependencies`/`update_record`, `keep_global_run`, `promote_record`, `get`, `record_late_read`
- `packages/svelte/src/internal/client/reactivity/batch.js` — `Batch` (`activate`, `get_record`, `capture`, `schedule`/`#add`, `#process`, `#revalidate`, `unskip_effect`/`#revalidate_branch`, `#commit`, `#merge`), `fork`, `uncommitted_first_value`
- `packages/svelte/src/internal/client/reactivity/deriveds.js` — `update_derived`, `adopt`, `get_view`, `async_derived` (its first value)
- `packages/svelte/src/internal/client/reactivity/sources.js` — `internal_set`, `mark_reactions`
- `packages/svelte/src/internal/client/dom/blocks/branches.js` — `BranchManager` (the branch each batch selected)
- `packages/svelte/src/internal/client/dom/blocks/each.js` — each items that only exist offscreen for some batches

## Contents

1. [Vocabulary](#1-vocabulary)
2. [Why `main`'s approach isn't enough](#2-why-mains-approach-isnt-enough)
3. [Versions](#3-versions)
4. [Exact dependency versions (`dv`)](#4-exact-dependency-versions-dv)
5. [Checking: `is_dirty`, `is_current`, `version_of`](#5-checking-is_dirty-is_current-version_of)
6. [Views: `activate`, `batch_values`, `folded`, `get_record`](#6-views-activate-batch_values-folded-record)
7. [Runs of deriveds: `get_view`, latest values, `adopt`, errors](#7-runs-of-deriveds-get_view-latest-values-adopt-errors)
8. [Effect records and the edges of the graph: `update_record`, `promote_record`](#8-effect-records-and-the-edges-of-the-graph)
9. [Writes: `internal_set`, `capture`](#9-writes-internal_set-capture)
10. [Statuses are scoped to batches: `schedule`, `#unprocessed`, `#revalidate`, rebases](#10-statuses-are-scoped-to-batches)
11. [Offscreen branches](#11-offscreen-branches)
12. [Reads after `await`: `record_late_read`](#12-reads-after-await-record_late_read)
13. [Teardowns, invalidated runs, and destroyed reactions](#13-teardowns-invalidated-runs-and-destroyed-reactions)
14. [How it fits together — walkthroughs](#14-how-it-fits-together--walkthroughs)
15. [Overlaps](#15-overlaps)
16. [What could be simplified, and at what cost](#16-what-could-be-simplified-and-at-what-cost)
17. [Cost](#17-cost)
18. [Known bugs and gaps](#18-known-bugs-and-gaps)

---

## 1. Vocabulary

- **Real world** — the latest value of every signal: `source.v` / `source.wv`, and the global state of reactions (`reaction.deps`, `reaction.dv`, `derived.v`, `derived.wv`, status flags). It's what you'd see if every in-flight batch had committed in order.
- **Batch** — a set of writes (`batch.current`, with the values from before the writes in `batch.previous`) that is processed and committed (that is, rendered) as a unit. Batches form a linked list (`first_batch` … `next`). A batch is **alone** if it is the only one and isn't a fork. A batch commits when it has no pending work left except inside boundaries that show their pending snippet, at which point writes are cleared ([§10.5](#105-committing-with-pending-work)).
- **View** (of the world) — what a batch sees: its own writes, plus the real world minus other (non-intersecting) batches' writes. The active view is set by `Batch#activate` and stored in two module-level variables:
  - `view_batch` — the batch whose view is active.
  - `batch_values` — a `Map<Value, { v, wv, assigned? }>` of overrides relative to the real world: the batch's writes, and the values from before other batches' writes that the view undoes. It is `null` when the view **is** the real world. That's the case for an alone batch, which is the hot path.
  - `view_cache` — the values of deriveds in the view, for as long as it is active ([§6.3](#63-caching-deriveds-view_cache)). It exists whenever `batch_values` does.
- **Version** — every value of a signal has a version (`wv`). Reactions remember the exact versions of what they read.
- **Run** — the result of running a reaction: the values it read, their versions and, for a derived, the value (possibly an error) and its version. A run is stored either as the reaction's **global state** (the run that is the real world) or as a record in a batch.
- **Record** (`BatchRecord`) — a run that belongs to a batch rather than to the real world: the values read (`deps`), their versions (`dv`) and, for deriveds, the value, its version and whether it is an error (`v`, `wv`, `e`). Records are stored in `batch.records`.
- **Folded** — an earlier batch is _folded_ into a later batch's view if the two **intersect**, i.e. both wrote at least one of the same sources. Its writes are then kept in the later batch's view instead of being undone, and its records can be reused there. This is because if the later batch finishes first, it doesn't commit on its own: it's merged into the earlier batch (`#merge`). So the two are treated as one set of changes. Forks are never folded. `activate` recomputes `batch.folded` each time it runs (see [§6.1](#61-batchactivate-batchjs992), [§6.2](#62-folded-and-batchrecordreaction)).
- **Latest** — a value is _latest_ if it's the real-world value: its version is the real-world version and, for a derived, that one is up to date (see [§7.2](#72-latest-values)).

## 2. Why `main`'s approach isn't enough

On `main`:

- A reaction is dirty if any dependency has `dep.wv > reaction.wv`. Every write increments a global counter, and `reaction.wv` is the counter's value when the reaction last ran.
- Status flags (`DIRTY`/`MAYBE_DIRTY`/`CLEAN`) are global. During "time travel" (processing a batch while others are in flight), `is_dirty` doesn't reset `MAYBE_DIRTY` to `CLEAN`, "so that traversal of the graph in the other batches still happens".
- When a batch commits, `mark_effects`/`depends_on` mark the async and block effects of other batches that depend on the committed sources as `DIRTY`, and newly created effects are re-checked against the batch's changes (`register_created_effect`).
- Deriveds evaluated during time travel are cached in `batch_values`, and in some cases captured into the batch as if they were writes.

This breaks down with several batches, for a few reasons:

1. **Views go backwards.** In batch B's view, batch A's write to `x` is undone: `x` has its _previous_ value, with its previous (smaller) version. A reaction that last ran in the real world (after A's write) sees `dep.wv < reaction.wv` and concludes it's clean in B's view, but what it computed is based on A's value. Monotonic comparisons only work if time only moves forwards. Views don't.
2. **One version per reaction can't describe several views.** A block effect might have selected branch X in batch A's view and branch Y in batch B's view. A single `reaction.wv` (or a single status flag) can't represent "valid in A, not valid in B".
3. **Coarse invalidation means wasted async work.** Marking async/block effects `DIRTY` on commit or rebase re-runs them even if nothing they read actually changed in that view. Re-running an async effect restarts its async work (a new request, a new promise).
4. **Global flags leak between views.** If processing batch A clears a flag that batch B's write set, B never re-runs the reaction. If A sees a flag B set, A re-runs a reaction in its own view for no reason, which is wasted work or worse.

The `batch-views` design replaces all of this with **exact versions**: a reaction is up to date in a view if and only if every value it read has, in that view, exactly the version it read. Equality works in any direction. It doesn't matter whether a view is "before" or "after" another.

## 3. Versions

### 3.1 One counter

Every new value gets a new version from `increment_write_version()` (`runtime.js`), whether it's a real-world value or one that only exists inside a batch:

- latest writes, and deriveds evaluated with latest inputs;
- writes in a fork;
- writes that aren't the latest because a later batch already wrote the same source;
- deriveds evaluated in a view from non-latest inputs.

Versions are **only ever compared for equality**. A version identifies a value; it says nothing about which value is "newer". That's why one counter is enough: batch-only values can't collide with real ones, because every version is handed out once. After a fork commits, its values _keep_ their versions in the real world ([§9.3](#93-fork-commit)). Those versions can be older than the versions of reactions that ran in the meantime, which is fine, because nothing orders them.

The one remaining ordered comparison is dev-only. `$inspect.trace` in `dev/tracing.js` shows values, versions and the dependencies of deriveds as the active view sees them (`get_view`, `batch_values`, and the run of a derived that applies there). A value it highlights has changed since the reaction last ran. If the reaction's previous run in that view (its record in the batch, else its global run) read the value, the version is compared exactly with the one that run saw. Otherwise (dependencies of deriveds, new reads), it falls back to `version > reaction.wv`. That's why `update_effect` still sets `effect.wv = write_version`, which has no other purpose. All versions come from the same counter, so this mostly works. It can fail to highlight values that a committed fork wrote (see above), or that a view gave an older version again by undoing another batch's write.

### 3.2 "The same value has the same version"

Wherever two views (or two evaluations) agree on a value, the system tries to give it the **same version**. This turns "did the value change?" into "did the version change?", and it's what makes equality cut-offs (an `equals` check stopping propagation) work across views:

| Where                                | Rule                                                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Batch#capture(source, value, same)` | If the value equals the real one (`same`), the entry gets `source.wv` instead of a new version. This is possible for async results, see [§9.2](#92-internal_setsource-value--own_result-sourcesjs193). |
| `Batch#activate`                     | Another batch's write is only undone in this view if its previous value differs from the real value. Otherwise the real value, and its real version, applies.                                          |
| `derived_version`                    | A derived's run that belongs to a batch reuses the version of an equal value: the previous record's version, else the global version, else a new one.                                                  |
| `set_derived_value`                  | As on `main`, the version of the global state is only incremented if `!derived.equals(value)` (errors always get a new version).                                                                       |
| `adopt`, fork commit                 | Records and fork values keep their versions when they become the real world.                                                                                                                           |
| `keep_global_run`                    | A derived's global run that a new one replaces is kept for the batches that may still see it, with its version ([§7.5](#75-replaced-global-runs-keep_global_run-runtimejs641)).                        |

Two consequences. First, reactions that saw a value don't re-run when it's recomputed to something equal in another view, or later. Second, "is this source latest in this view?" becomes `version_of(dep) === dep.wv`, which `update_record` relies on ([§8.1](#81-update_record--where-a-run-belongs-runtimejs494)).

## 4. Exact dependency versions (`dv`)

Every reaction has `reaction.dv: number[] | null`, next to `reaction.deps`:

- `dv[i]` is the version of `deps[i]` that the last **global** run (the run whose result is the reaction's global state) read.
- `deps` and `dv` describe exactly the global run, in read order. The graph's edges are stored separately in `reaction.edges` (see [§8.3](#83-edges-are-a-superset)); they can include dependencies of other live runs.
- `dv === null` means there's no global run yet. `is_dirty` treats that as dirty.

### 4.1 Recording versions at the end of a run

`update_dependencies` runs after `fn()` in `update_reaction` and records the versions. In the fast path (same deps as last time, no other edges, real world, not a block/async effect) that's simply `dv[i] = deps[i].wv` in place:

```js
if (
	new_deps === null &&
	batch_values === null &&
	dv !== null &&
	length === deps?.length &&
	reaction.edges === deps &&
	(flags & (BLOCK_EFFECT | ASYNC)) === 0
) {
	for (var i = 0; i < length; i++) dv[i] = deps[i].wv;
	if (dv.length !== length) dv.length = length;
	return length;
}
```

Versions are recorded at the **end** of the run, not when each value is read. That is cheap: `get()` doesn't do any extra work. But it means a write that happens _during_ the run, after the reaction read the value, would be absorbed silently, because the post-write version would be recorded as "seen". This is handled with flags, not versions: such a write goes through `mark_reactions` → `Batch#schedule`, and `schedule` applies the status immediately whenever `active_reaction !== null` ([§10.1](#101-batchscheduleeffect-status-batchjs1077)). The reaction ends up `DIRTY`, and `DIRTY` wins over `dv` in `is_dirty`. If the write reaches it through a derived instead, it ends up `MAYBE_DIRTY`. That's also fine: a derived's version only changes when it's re-evaluated, so the recorded version is the derived's old one, and the next check re-evaluates the derived and sees the difference.

What remains is a reaction writing a value _before_ reading it (`$effect(() => { x = 1; x; })`). That's handled exactly as on `main`, via `untracked_writes` / `schedule_possible_effect_self_invalidation`.

An earlier version of the branch recorded versions at read time, in `get()`. It needed no reliance on flags, but cost a noticeable amount on every read.

### 4.2 What two runs read

Two runs of a reaction read the same values in the same order, **up to and including the first read whose version differs**. After that, a different value may have steered the run elsewhere. For example, `flag ? a + b : b + a` reads `[flag, b, a]` with `flag = false`, and `[flag, a, b]` in the view of a batch that set `flag = true`. That's why every run has its own list of what it read: the global state uses `reaction.deps`, and a record has its own `deps` copy. A batch's view differs from the real world for as long as the batch is pending, so that divergence lasts, too.

Run dependencies are independent of edge order. Promoting a run replaces `deps`/`dv`; a late read appends to them. Neither operation needs to rearrange a shared edge list. Checking runs in their original read order also avoids evaluating dependencies after the first mismatch.

### 4.3 Why exact versions can't be simplified away

Views can contain older values ([§2.1](#2-why-mains-approach-isnt-enough)), so any order-based check is wrong in some view. Exact versions are the minimum per-reaction information that is correct in every view. The cost is writing one number per dependency per run, instead of one number per run. We measured about 5–8% on dependency-heavy benchmarks for this alone: a naive version of just this change applied to `main` came out at about 1.08x.

## 5. Checking: `is_dirty`, `is_current`, `version_of`

### 5.1 Flags filter, versions decide

Status flags still exist and act as a cheap **push** filter:

- `CLEAN` — not checked at all.
- `MAYBE_DIRTY` — check versions.
- `DIRTY` — re-run without checking.

Versions are the **pull** truth for `MAYBE_DIRTY`. This is the classic push-pull model. The new part is that both the push side (which reactions get marked, and for which batch, see [§10](#10-statuses-are-scoped-to-batches)) and the pull side (versions in _which view_, [§5.3](#53-is_currentdeps-dv-and-version_ofsignal)) are batch-aware.

### 5.2 `is_dirty(reaction)` (`runtime.js:209`)

- An **assigned derived** (`ASSIGNED`) that is `DIRTY` or `MAYBE_DIRTY` is checked by versions only: it's dirty if one of its dependencies (what its global run read) was written after the assignment (`unchanged_since`, [§7.1](#71-get_viewderived-derivedsjs435)). Its flags can't tell, because writes that don't change the real world — a fork's, or one that isn't the latest — mark it, too. Without this, a fork's write to a dependency made the real world drop the assignment the next time the derived was read (`async-derived-assign-fork-discarded`).
- `DIRTY` → `true`.
- `MAYBE_DIRTY`:
  - A reaction is checked against **the run that applies** in the active view (`run_of`): for a block or async effect, its record in the active batch (including folded batches) if there is one; otherwise the reaction itself, whose `deps`/`dv` are its global state. Block/async runs inside a batch are stored as records, not as global state ([§8](#8-effect-records-and-the-edges-of-the-graph)).
  - In the real world (`batch_values === null`) there's an **inline loop**: for each `i < dv.length`, bring derived dependencies up to date (`is_dirty(dep) → update_derived(dep)`), then compare `dep.wv !== dv[i]`. This duplicates `is_current` on purpose. Recursing `is_dirty → is_dirty` directly, instead of going through `is_current`/`version_of`, was measurably faster (about 3% on kairo benchmarks).
  - In a view: `!is_current(deps, dv)`.
  - If the reaction is up to date and `CONNECTED`, it's set to `CLEAN`. Unlike `main`, this also happens in views. That's safe because statuses are scoped to batches and other batches re-validate ([§10](#10-statuses-are-scoped-to-batches)), so a `CLEAN` set in one view doesn't hide a change from another batch.

### 5.3 `is_current(deps, dv)` and `version_of(signal)`

`is_current` checks dependencies **in order** and stops at the first mismatch. As on `main`, this means we never evaluate a derived the reaction would no longer read (in `a ? b : c` where `a` changed, `b` isn't evaluated). In the real world it updates dirty deriveds along the way. In a view, `version_of` does that lazily.

`version_of(signal)` is the version the signal has in the active view, evaluating a derived if needed:

- real world → `signal.wv`
- view, derived → `get_view(derived).wv` ([§7](#7-runs-of-deriveds-get_view-latest-values-adopt-errors))
- view, source → `batch_values.get(signal)?.wv ?? signal.wv`

It's used to **check** runs. Recording the versions a run saw uses `seen_version` instead, which never evaluates anything ([§8.1](#81-update_record--where-a-run-belongs-runtimejs494)).

## 6. Views: `activate`, `batch_values`, `folded`, `get_record`

### 6.1 `Batch#activate()` (`batch.js:992`)

Makes the batch the current one (`current_batch`), sets `view_batch = this` and builds `batch_values`. It's called when the batch is processed, and when work continues in the batch: after an `await` (`restore` in `async.js`) and when an async expression resolves.

- **Alone** (no other batch, not a fork): `batch_values = null`. The view is the real world. Every check takes the real-world fast path. This is the common case and the one the benchmarks measure.
- Otherwise `batch_values` starts as a copy of `this.current`, i.e. its own writes. Then, for every other non-fork batch:
  - **Earlier and intersecting** (writes some source this batch also writes): the earlier batch's writes are part of this view. They aren't undone, and the batch is added to `this.folded`. The later batch will be merged into the earlier one if it finishes first, so they're treated as one set of changes.
  - **Otherwise**: undo its writes by putting its `previous` values in `batch_values`, unless this batch has its own value, or the previous value equals the real one ([§3.2](#32-the-same-value-has-the-same-version)).
  - An undone **assignment to a derived** is put in `batch_values` like any other undone write (also if the value before equals the real one), but it's mainly the **version** the derived has in this view. Its value is only used if it was assigned, too (`previous.assigned`, [§9.1](#91-batchcapturesource-value-same-batchjs723)). A computed value was computed in some view of the world — typically the real world, including the writes of other pending batches — and may depend on writes that this view undoes. Then the derived is evaluated in the view instead ([§7.1](#71-get_viewderived-derivedsjs435)). And because the version the view has for the derived differs from the real one, the real-world state (the assignment) doesn't apply in the view, and the run there is stored in the batch ([§8.1](#81-update_record--where-a-run-belongs-runtimejs494)).
  - `async-derived-assign-keeps-maybe-dirty` covers this. Before, batch B undid C's `d = 99` with the value `d` had before, which was computed with batch A's write to `s` — which B undid, too. B's view then had `s = 0` but `d = 10`, and B committed `<p>0</p>` next to `<i>10</i>`. `async-derived-assign-previous-assigned` covers the case where the value before was assigned (and so is used).

Forks always build a map, even when alone: their writes aren't in the real world.

While `fork(fn)` runs `fn`, the fork's view is the real world plus its own writes (it starts with an empty map, not with `activate`). Other pending batches' writes aren't undone there, so that `count++` in `fn` builds on them, like outside a fork. When the fork is processed, they are undone, unless the fork wrote the same source (then they're folded, [§6.2](#62-folded-and-batchrecordreaction)).

### 6.2 `folded` and `Batch#record(reaction)`

`record(reaction)` looks up the record of `reaction` in this batch's view: this batch's own record first, then those of the folded batches, latest first. An intersecting earlier batch's results (an async effect that already resolved, a derived it evaluated) are part of this view too, so they can be reused if `is_current` says they're still valid. Otherwise every intersecting batch would redo the earlier batch's async work.

`folded` is reset on every `activate`.

### 6.3 Caching deriveds: `view_cache`

`view_cache` caches the values of deriveds in the view for the lifetime of the view (until the next `activate`). An entry is what is current in the view: a record, the derived itself if its global state applies (`get` then reads it like in the real world), or a write to it that holds (an assignment, [§7.1](#71-get_viewderived-derivedsjs435)). Without this, every read of a derived in a view would re-validate its whole dependency tree, which can blow up exponentially for chains of diamonds. The cache is invalidated by `mark_reactions`, which does `view_cache?.delete(derived)` when a dependency is written while the view is active (e.g. by an async result), and by `capture` when the derived itself is assigned. Disconnected deriveds aren't cached: nothing would invalidate their entry, because `mark_reactions` doesn't reach them.

It used to be part of `batch_values`, which then held writes and runs side by side. Telling them apart needed extra checks in `get_view`, and `mark_reactions` deleted a derived's write entries along with its cached run.

## 7. Runs of deriveds: `get_view`, latest values, `adopt`, errors

A derived's global state (`v`, `wv`, `deps`, `dv`, flags) always describes the **real world**. Other runs of it are records in batches. Where a run goes is decided in exactly one place: `update_dependencies`/`update_record` ([§8.1](#81-update_record--where-a-run-belongs-runtimejs494)) store the whole run, including the value, when it ends.

### 7.1 `get_view(derived)` (`deriveds.js:435`)

In a view, deriveds are never checked via their flags. Their value is the run that is current in the view, which `get_view` finds in this order:

1. **Cached** in `view_cache` → return it.
2. Otherwise, what the view holds for the derived is a **write** to it — an assignment in this batch (its entry is part of `batch.current`), or the value from before another batch's assignment that this view undoes ([§6.1](#61-batchactivate-batchjs992)) — or else its **global state**. If that's an assigned value (an assignment in this batch, a value from before that was assigned, too, or a global state flagged `ASSIGNED`) that still holds in this view (`unchanged_since`, see below) → that value. It takes precedence over records: a record that is current in the view was computed before the assignment, or while the view undid it (`async-derived-assign-stale-record`: a batch's record from before another batch committed an assignment).
3. **A record in this view** (`batch.get_record(derived)`, including folded batches) that `is_current` → that record.
4. **The global state is a run that is valid in this view** (`is_current(derived.deps, derived.dv)`, and the view has no write to the derived) → the derived itself.
5. Otherwise **run it**. The run is stored where it belongs: in the batch, or as the global state, in which case any record of it in the batch is deleted. So the entry is `batch.records.get(derived) ?? derived`.

`get` treats an entry that is the derived itself like a real-world read, and otherwise uses the record's `v` (throwing it if `e`).

**Assigned values** hold until one of the derived's dependencies is written after the assignment: while none of the dependencies has a newer version than the assignment (`unchanged_since(deps, wv)`, `runtime.js`). That's the rule both in views and in the real world (`is_dirty`, [§5.2](#52-is_dirtyreaction-runtimejs209)). The dependencies are what the run that applies read: in the real world the global run, in a view the batch's record of the derived (`get_record`) if there is one, else the global run. Not the edges, which also cover the runs other batches hold. With them, a pending fork that retains an older run of the derived made the real world drop an assignment when a value that only the fork's run read changed, and checking them could evaluate a dependency the derived no longer reads. Comparing the versions with those the dependencies had at the time of the assignment, like `is_current` does, would be wrong:

- The assignment saw the real world, including the writes of other pending batches, and a view may undo one of them. `async-derived-assign-pending-dependency` covers this: batch C assigns `d` while batch A, which wrote `s`, is pending. Before, C committed without its own assignment (its view undoes A's `s`, so the assignment looked outdated), and so did a batch B that committed after C.
- A fork's write that happened before the assignment isn't seen by the assignment, but the fork's view keeps the assignment, as it happened later. When the fork commits, the real world keeps it, too (`async-derived-assign-fork-write-before`). Before, the real world compared exact versions, so the commit dropped the assignment: the fork showed one value and committed another, and redid the async work that read it. A fork's write that happened after the assignment does make it outdated, in the fork's view and once it's committed (`async-derived-assign-fork-write-after`).

A dependency that is a derived which was evaluated again, and got a different value, does count as changed (which is conservative). `ASSIGNED` is set by `internal_set` (if the assignment is the latest value) and by a fork commit, and cleared by `set_derived_value` and `promote_record`, i.e. as soon as a run replaces the value. An assignment doesn't record any versions: the derived's `dv` is still that of its last run, which isn't used while it's `ASSIGNED`.

### 7.2 Latest values

`update_record` must decide whether a derived's run in a view belongs to the real world. It does if **everything it read is latest**. For every value read, that means the version seen is the real-world version (`version_of(dep) === dep.wv`). For a derived dependency, it additionally means its global state is up to date, i.e. it is `CLEAN`. The global state can be valid in the view yet outdated in the real world: that happens when the view undoes exactly the change that made it stale, and it hasn't been re-evaluated in the real world yet. By [§3.2](#32-the-same-value-has-the-same-version), an equal value counts as latest, which is correct.

Without this rule, we'd either update global state from non-latest values (wrong), or make every derived evaluated in a view batch-local. That would be correct, but everything would be recomputed in the real world after the commit, and effects that saw the batch's versions would re-run.

The rule is conservative for disconnected deriveds, which are never `CLEAN`: runs that read them in a view always belong to the batch.

### 7.3 `adopt(derived, records)` — when a view becomes the real world

`update_derived` (a real-world evaluation) first checks whether the active `view_batch` holds a record of the derived that `is_current` in the real world. If so, it **adopts** it via `promote_record`: global state := record, including its value and version. This happens when a batch's view turns into the real world before it commits:

- a fork is committed: `fork.commit` writes the fork's values, with their versions, into the real world, then processes the fork as an alone batch;
- the batches the record's batch was isolated from commit or are discarded, so it becomes alone.

Keeping the record's version is what lets block/async effects whose records refer to that version stay valid. Without `adopt`, the derived would be recomputed, get a new version (unless it happens to equal the old _global_ value), and every effect that saw the record would re-run. For forks, that means redoing the preloaded work.

Derived records are **not** promoted on a normal commit ([§8.4](#84-promoting-a-run)). They're dropped together with the batch's `records`.

### 7.4 Errors

An error is just the value of a run, marked as an error: `e` on a record, the `ERROR_VALUE` flag on the global state (set only by `set_derived_value`). `get` throws it.

- It doesn't matter whether the derived returned the error (`handle_error` does that for deriveds without an owning effect) or threw it. `update_reaction`'s catch stores the run with the error as its value either way. The only exception is when an error boundary took care of the error; the value is then `undefined`.
- A stored error is current like any other value: readers re-throw it until one of the derived's dependencies changes, without re-running the derived. Nobody evaluates it again (and throws from the wrong place) while recording the versions of what they read.
- When the error propagates, it does so from wherever the derived was run: if that's a dependency check in `is_dirty`, the check throws; if it's a read, the reader throws.
- Errors always get a new version, as does a value that replaces one.

### 7.5 Replaced global runs: `keep_global_run` (`runtime.js:641`)

When a run of a derived becomes its global state — in the real world, or in a view in which everything it read is latest — the run it replaces may still be the one that other batches see. Their views differ from the real world, and can undo the write that made it outdated. If they had to evaluate the derived again, an equal value would get a new version ([§3.2](#32-the-same-value-has-the-same-version) only reuses the version of an equal value the batch held before, or of the global one), and every reaction that saw the old one would re-run in their views, restarting async work. So the old run is kept as a record in each other batch that doesn't have one of the derived. Like any record, it's only used where it `is_current` ([§7.1](#71-get_viewderived-derivedsjs435)). Examples:

- `async-derived-replaced-run-kept`: batch A writes `a`, and its `await f(a, d)` read `d = b * 2` in the real world. Batch B writes `b`. In B's view, which undoes A's write, `d` only reads latest values, so its run there becomes the global state. When A is processed again, its view undoes B's write. Before, `d` was evaluated there again, with a new version, and `f(a, d)` restarted. `async-derived-replaced-run-kept-read` is the same with `d` read in the real world (in an event handler), and both pass on `main`.

Runs aren't kept if they're invalid (`dv === null`), don't depend on anything (such a derived only runs again if it was invalidated), are assigned values (not runs), or used an abort signal (running the derived again aborted it), or if the value keeps its version anyway. All batches that keep the replaced run share one record, which shares the derived's `deps`, but has its own `dv` ([§8.5](#85-sharing-arrays)). On the real-world fast path, that's one more check for deriveds.

## 8. Effect records and the edges of the graph

### 8.1 `update_record` — where a run belongs (`runtime.js:494`)

The non-fast-path part of `update_dependencies` first decides which batch, if any, the run belongs to:

- **Block and async effects** that run while a batch is processed (`view_batch?.committing === false`) belong to that batch. The exception is a block effect's **first** run (no `REACTION_RAN` yet), which creates and commits the initial branch right away. Why these two kinds:
  - A block effect's result is the **branch it selected**. The new branch stays offscreen until the batch commits ([§11](#11-offscreen-branches)), and another batch may select differently.
  - An async effect's result is the **value its expression resolves to, for this batch** (`internal_set(..., own_result)`, [§9.2](#92-internal_setsource-value--own_result-sourcesjs193)).
  - Other effects are always global. In async mode, re-runs of template/render/user effects happen when a batch commits, i.e. in the real world. Their **first** run, however, happens on creation, which can be inside a new branch while a batch's view is active. That first run is recorded as global state with the view's versions. This is fine because the branch is offscreen for every other batch ([§11](#11-offscreen-branches)), and a batch that adopts it re-validates its effects in its own view.
- **Even an alone batch records** block/async runs. Being alone can change before the batch commits: another batch can start and commit while this one waits for async work. `async-state-new-branch-unrelated-update` covers this. The pending batch selected a branch, an unrelated batch then re-runs the block in its own view (where the branch isn't shown) and commits. The pending batch's selection must survive, rather than the branch (and its in-flight request) being recreated.
- **Deriveds** belong to `view_batch` if any of their inputs isn't latest ([§7.2](#72-latest-values)), else to the real world. That includes the derived's own version: if the view has a write to the derived that isn't the real-world one (it undoes an assignment, or the derived was assigned in a fork), the run belongs to the batch. Otherwise a view that undoes an assignment, but not the writes to the derived's dependencies, would overwrite the assignment in the real world.

It then records `dv[i] = seen_version(dep)` for each value read: the version the run saw. In the real world that's `dep.wv`. In a view it's the version of the view's entry for `dep` (in `view_cache` for a derived, in `batch_values` for a source). If a derived has no entry, it was invalidated by a write during the run, or it can't be cached because it's disconnected. The run then gets `-1`, which never matches, so it doesn't count as having seen the derived's current version. That mirrors the real world, where a derived invalidated during the run only gets a new version once it's evaluated again. **Recording never evaluates anything.** Before, it used `version_of`, which in a view could evaluate a derived invalidated during the run and record its new version. The run would then count as having seen a value it never read.

`update_record` reuses `reaction.dv` in place only for a global run in the real world. Otherwise it uses a fresh array: a record has its own `dv` ([§8.5](#85-sharing-arrays)), and a derived's run can turn out to be batch-local halfway through the loop.

For a batch run, it stores a record in `batch.records` **without touching the global state**: `{ deps: read, dv }` for an effect, plus the value, its version (chosen by `derived_version`) and `e` for a derived. For a global run, it assigns `reaction.deps = read` and `reaction.dv = dv` and, for a derived, sets the value (`set_derived_value`) and deletes the active batch's record of it, which is now outdated. Effects never have such a record at this point: their runs only become global outside of processing, on their first run, or once the batch commits, whose records are promoted by then.

### 8.2 Record lifecycle

- **Created** by `update_record` (effects and deriveds), and by `keep_global_run` (a derived's replaced global run, in the other batches, [§7.5](#75-replaced-global-runs-keep_global_run-runtimejs641)).
- **Looked up** via `Batch#record`: by `run_of` for block/async effects (used by `is_dirty` and `record_late_read`), and by `get_view` for deriveds.
- **Extended** by `record_late_read` ([§12](#12-reads-after-await-record_late_read)).
- **Merged**: when a later batch Y merges into an earlier batch X (`#merge`), Y is discarded when X commits or is discarded (so that, e.g., the branches it selected are cleaned up either way — before, they were only cleaned up if X committed, `async-merge-intersecting`), and Y's non-block records move to X. X's view now includes Y's writes, so Y's async results and derived values are still valid (and are re-checked with `is_current` anyway). Block records are _not_ moved: branch selections are keyed by batch, and X re-selects them when it processes.
- **Promoted** when the batch commits (`#process`, after `committing = true`): every live effect record becomes global state via `promote_record`, and the effect's edges are pruned (`prune_edges`, [§8.3](#83-edges-are-a-superset)). For an async effect, this supersedes the in-flight runs of other batches that hold no record of it ([§10.6](#106-first-values-inside-a-pending-boundary)). Derived records are dropped.
- **Released** by `#release_records`, shared by commit and `#unlink` (discard, merge). It clears `batch.records` before promoting committed effect runs and pruning their edges, so the retention check sees only the other batches' records.

### 8.3 Edges are a superset

`reaction.edges` and the `reactions` arrays of its dependencies are the **edges** of the graph. They determine which reactions `mark_reactions` and `#revalidate` reach. They must therefore be a **superset of the dependencies of every live record**. If a block effect read `a` in batch A's view and `b` in the real world, a change to either must reach it. `reaction.deps` only describes the global run.

`update_record` keeps that invariant. Since every run's dependencies are among the edges, `edges === null` implies `deps === null`, and `edges === deps` means the edges are exactly what the global run read:

- **Some batch holds a record of the reaction** (this run's batch, or any other: `keep`), and there are edges: new dependencies are appended to `edges` (deduplicated, with edges added) and nothing is removed. The edge list is replaced by an extended copy ([§8.5](#85-sharing-arrays)). The global run and each batch record keep their own read order.
- Otherwise, the edges become what the run read (and `edges === deps` again, if it's a global run):
  - **The edges are the previous global run's reads** (`edges === deps`, which includes having no edges yet): retain the unchanged prefix and replace the suffix, as on `main`.
  - **Otherwise** (they include edges retained for runs that no batch holds anymore): reconcile the edge set with the new read list.

Block and async effects run in batches, so their runs hardly ever take the pruning paths: every re-run during processing appends. A block that reads `items[index]` while `index` changes would otherwise end up as a reaction of every item it ever read, which causes spurious `MAYBE_DIRTY` checks and keeps those items from being garbage collected. So when a batch's records of effects are promoted (on commit) or dropped (in `#unlink`: discard, merge), `prune_edges` removes the edges that no live run needs anymore, once no batch holds a record of the effect: the edges become the global run's `deps` again. As edges are a superset of `deps`, that only removes. `async-block-edges-pruned` covers both cases (it observes the pruning through deriveds that are disconnected, which aborts their signal). Both fail before this, also before `edges` were split from `deps`. `main` prunes on commit, but not after a discarded fork.

Deriveds are left out. Their edges also notify the reactions that read the value of a derived's record that was dropped, which must notice that the record is gone when one of its dependencies changes. They are pruned by the derived's next global run. Until then they only cause spurious `MAYBE_DIRTY` checks, not wrong results. The same holds for the edges of an effect that another batch still has a record of.

The `skipped_deps` optimisation in `get()` still compares reads directly with `reaction.deps`. Disconnection, reconnection and effect liveness use `reaction.edges` instead. (Tracing shows what the run that applies in the active view read.) A reaction that only has batch-local runs can have edges even though its global `deps` is `null`.

### 8.4 Promoting a run

`promote_record` installs the record's `deps`/`dv` as the global run, without changing the graph's edges. For a derived, `dv` is copied, because other batches may still hold the record ([§8.5](#85-sharing-arrays)).

For a derived, the record's value, version and error flag become the global ones too, and its status is updated. Promotion is used for effects on commit and when `update_derived` adopts a batch's run.

## 9. Writes: `internal_set`, `capture`

### 9.1 `Batch#capture(source, value, same)` (`batch.js:723`)

Records a write in the batch and decides its version:

- `later`: the next non-fork batch after this one that also wrote `source`. If one exists, this write is **not the latest** value. This happens when an async expression resolves in an earlier batch after a later batch wrote the same signal.
- `previous`: the value before this batch's change. That's the real value or, if a later batch also wrote the source, the later batch's `previous`. It's needed so other views can undo this batch's write ([§6.1](#61-batchactivate-batchjs992)) correctly even when batches write the same source out of order. For an assigned derived, `assigned` says whether the value before was assigned, too (the `ASSIGNED` flag), or computed.
- Version:
  - `same` (equal to the real value) → `source.wv`;
  - latest → `increment_write_version()`, and `source.v`/`source.wv` are updated;
  - otherwise (fork, or not the latest) → also `increment_write_version()`, but the source itself isn't touched.
- Errors are never batch-local (`same` is forced off, and they aren't put into `current`/`batch_values`), or `get` wouldn't throw them.
- The new entry is also put into the active `batch_values`, so the current view sees the write immediately. (For a derived, its entry in `view_cache` is dropped.)

### 9.2 `internal_set(source, value, ..., own_result)` (`sources.js:193`)

- A write is a change if it differs from the real value, **or**, for an `own_result` (an async expression resolved for this batch), if it differs from what the batch's view currently holds. An async result can equal the real value while the batch's view has something else, for example because the batch undid another batch's write to the same signal. It must still be written for this batch, with the real version (`same`).
- Even if the result equals both, `own_result` still calls `capture(source, value, true)`: the value **belongs to the batch**. The signal ends up in `batch.current`, which determines what other batches undo, what intersects, and what is committed.
- Writing to a dirty derived executes it first (as on `main`), so its dependencies are tracked. Not if it's assigned already: its dependencies are tracked, and its flags don't say whether the assignment still holds ([§5.2](#52-is_dirtyreaction-runtimejs209)). Executing it would replace the assignment with a computed value, which is what views that undo the new assignment then see (`async-derived-assign-fork-marked-previous`).
- **Assigned deriveds**: the assigned value holds until one of the derived's dependencies is written after it ([§7.1](#71-get_viewderived-derivedsjs435)).
  - If the write is the latest, the derived is flagged `ASSIGNED`. Otherwise (e.g. in a fork) the assignment is only part of the batch's writes.
  - `async-derived-assigned-view` covers the case of `d = 100; count++` while another batch is pending. Before, the assigned value showed up in the batch's view even after `count` changed, because `activate` copies the batch's writes into the view.
  - Other batches undo the assignment in their views: with the value from before it if that was assigned, too, and otherwise by evaluating the derived ([§6.1](#61-batchactivate-batchjs992)). (`main` undoes it with the previous value, without checking.)

### 9.3 Fork commit

`fork.commit` writes the fork's values **with their versions** into the real world (`source.v = entry.v; source.wv = entry.wv`). Entries of deriveds (assignments) are flagged `ASSIGNED`. Then the fork is processed as an ordinary, now usually alone, batch. Everything computed in the fork (records of async/block effects, derived records via `adopt`) is still valid, because its versions didn't change. The fork's writes don't go through `mark_reactions`, so `#process` re-validates ([§10.3](#103-revalidatevalues-batchjs558)) everything depending on them; anything already computed passes the version check.

## 10. Statuses are scoped to batches

Flags are global, but whether a reaction is dirty depends on the view. A batch's marks must not be seen or consumed by another batch's processing.

### 10.1 `Batch#schedule(effect, status)` (`batch.js:1077`)

Called by `mark_reactions` (via `schedule_effect`) and others:

- If **this batch is being processed right now** (`is_processing && current_batch === this`) or **a reaction is running** (`active_reaction !== null`) → apply the status now (`#add`). The second case is required by [§4.1](#41-recording-versions-at-the-end-of-a-run): the running reaction records its versions at the end, so a write during its run must flag it.
- Otherwise, if there are other batches (or this is a fork) → add the effect to `#unprocessed`, as `MAYBE_DIRTY` (an entry that is `DIRTY` stays so). Its status is left alone, so another batch processed first won't run it in the wrong view or consume the mark. When this batch is processed, it gets that status and versions decide.
- If alone → apply it right away, but as `MAYBE_DIRTY`, not the requested status. The view is the real world, so marking is safe, but the write may not change what the effect sees by the time the batch is processed, and `DIRTY` would force a re-run. For an async effect, a re-run means restarting its async work. With `DIRTY` here, `async-stale-derived-2` renders `a: 0` instead of `a: 2`.

`#add` sets the status without downgrading `DIRTY`, and queues the effect for `#resolve`/`#traverse`.

`#unprocessed` also holds the effects whose run is deferred because the batch has pending work (`#defer_effects`): the template and user effects collected during traversal, with their status, reset to `CLEAN`. `#process` adds everything in it at the start and clears it. Effects that are still deferred are put back at the end. They can't be left to `#revalidate`, which only reaches what depends on the batch's own writes:

Effects inside a pending boundary that haven't run yet are deferred by the boundary instead (`Boundary#defer_effect`), and handed to the batch that resolves it. That isn't necessarily the batch they were deferred in: work inside a pending boundary doesn't block a batch, so a batch can commit (and go away) while the boundary is still pending.

### 10.2 `CLEAN` in views

Because statuses are scoped like this, `is_dirty` can set `CLEAN` in views ([§5.2](#52-is_dirtyreaction-runtimejs209)). On `main`, statuses stayed `MAYBE_DIRTY` during time travel, so other batches would still traverse them, which meant more checks and more cross-talk.

### 10.3 `#revalidate(values)` (`batch.js:558`)

Walks the reactions that transitively depend on `values`. Deriveds that are `CLEAN` become `MAYBE_DIRTY`, and effects not in a branch this batch skips are scheduled `MAYBE_DIRTY`. It's used:

- **When a batch is processed again** (`#process` with `started`), for its own writes. Since it last ran, other batches may have processed (and cleaned) reactions in _their_ views, or created new reactions that read this batch's writes without knowing about them (new effects in new branches). On `main` this was `register_created_effect`/`depends_on`.
- **When another batch commits** (`#commit`, also if it still has pending work, [§10.5](#105-committing-with-pending-work)), for the committed sources that change each remaining batch's view:

  - a source the batch didn't write;
  - a source an earlier batch wrote with a different value, which it then takes over.

  Sources with the same value, and sources a later batch wrote (its value is more recent), are left out. Such batches are added to `rebases`, and `flush` processes them again at the end, so block effects re-select branches and async work restarts in the new view right away.

- Indirectly for **fork commit** (via `#process`).

Marking deriveds `MAYBE_DIRTY` matters for the real-world case: after a fork commit, or after another batch's commit, a derived's global `CLEAN` may be stale, because the writes didn't go through `mark_reactions` for it. In views, deriveds don't use flags anyway.

### 10.4 Why `MAYBE_DIRTY` everywhere

On `main`, commits and rebases marked async/block effects `DIRTY`. Here everything is `MAYBE_DIRTY`, and the exact versions in the batch's view decide. Only effects whose inputs actually differ in that view re-run. That's what keeps async work from being restarted needlessly, which was the original motivation.

Some of `main`'s code relied on those forced re-runs, and is gone, because with exact versions it would be wrong or is redundant:

- **Handing async results to earlier batches.** When a batch committed, `#commit` resolved the pending runs of its async expressions in every earlier batch with the committed batch's results. That's wrong if the earlier batch's run read different values, e.g. `await (flag ? f(d) : f(x))` where the earlier batch set `flag = false` and the later one set `d`. On `main`, the forced re-run in the earlier batch superseded the handed-over result. Here the earlier batch's run is still valid, and it now keeps its own result (`async-earlier-batch-own-result`). (`#merge` still hands over results: the merged batch's records replace the earlier batch's.)
- **Re-checking block effects on every process.** Block effects that ran were put into `#dirty_reactions`, so that they were checked again whenever the batch was processed. `#revalidate` reaches them whenever something they read may have changed in the batch's view.
- **Branch selections of earlier batches**, see [§11](#11-offscreen-branches).

### 10.5 Committing with pending work

Work inside a boundary that shows its pending snippet doesn't block a batch (`increment_pending`), so a batch can commit while such work is still in flight. It then stays in the list of batches (`#pending > 0`), so that the results arrive in it: they are written to it, and it is processed and commits again.

Its writes are in the DOM from the commit on, so they are part of the real world for everyone: `#commit` rebases the other batches right away (not only once the batch is done), and clears the batch's `current` and `previous`. Until its pending work resolves, it has no writes. So other views don't undo what it committed, don't fold it, and later batches don't merge into it. And for `capture`, a write it committed is never "later" than another batch's write.

Before, the other batches went on undoing the writes until the batch was done, although the DOM already showed them (this is also what `main` does):

- An earlier batch committed in a view without them. With `x + y` and a batch Y that writes `y` and commits while its async work is pending, a batch X that writes `x` and commits after it showed `x + y` without Y's `y`, until Y was done (on `main`, for good: `async-commit-with-pending-rebases`).
- A later batch re-ran blocks in a view without them. With `{#if show && a >= 0}`, whose branch has pending async work, a batch that writes `a` selected no branch, because its view undid `show = true`. The branch was destroyed, and created again when the batch that showed it was rebased, which started the async work again. On `main`, it was removed (`async-commit-with-pending-not-undone`).
- A late read ([§12](#12-reads-after-await-record_late_read)) in a batch that committed saw the value from before a write that another batch committed after it, and the batch committed the reader with that value, next to the newer one (`async-read-pending-value-stale-reader`). The reader then re-ran in the other batch, which fixed it.

### 10.6 First values inside a pending boundary

While a boundary shows its pending snippet, batches commit without waiting for their runs of the async expressions in it ([§10.5](#105-committing-with-pending-work)). Such a batch holds no run (record) of the expression's async effect anymore: it was promoted on commit. So once another batch's run of it is committed, that run is the one that applies in the batch's view, and the batch's own in-flight run is superseded (rejected as `OBSOLETE` by `#release_records`). Otherwise:

- its result would arrive in a batch whose writes are already cleared, and be written as the latest value, over the committed one (`async-batch-derived`: the boundary shows `1` next to `count = 2`);
- a run that was aborted (`getAbortSignal`) when the other batch re-ran the effect would never settle, and the boundary would keep showing its pending snippet (`async-abort-signal`).

Batches that still hold their run — they haven't committed, or are forks — keep it, and the boundary can show their result in their view (`async-pending-boundary-later-batch-result`).

Before, like on `main`, `async_derived` rejected all in-flight runs whenever a new one started inside a pending boundary, whichever batch it belonged to. That also superseded the runs of batches that hadn't committed (which is why the boundary had to wait for those batches), and the runs of real batches when a fork re-ran the expression ([§18](#18-known-bugs-and-gaps), `async-fork-pending-boundary-run`). `main` doesn't need the rule for the cases above, because it settles those runs in other ways: `#commit` hands the committed batch's results to earlier batches ([§10.4](#104-why-maybe_dirty-everywhere)), and a batch that commits with pending work keeps its writes, so a later batch that writes the same sources merges into it and hands its results over (`#merge`).

The code that awaits the expression's first value continues in the view of the batch that created it: the template effects of the boundary's content (`flatten`), or the rest of a component's script (`run`). It waits for the latest run, whichever batch it belongs to. Once all work inside the boundary is done, it reveals its content right away, not when some batch commits.

So the first value can be the result of another batch, which the creator's view can't undo: there's no value from before it (`capture` doesn't record `UNINITIALIZED`). That happens when the creator's run was superseded and the latest run belongs to a batch that hasn't committed. The content then showed that result before its batch committed, next to the old values elsewhere (`async-pending-boundary-uncommitted-first-value`).

Now `async_derived` only hands out its first value once no other batch holds it uncommitted (`uncommitted_first_value`, which relies on committed writes being cleared, [§10.5](#105-committing-with-pending-work)). Otherwise it waits until that batch commits or is discarded, and the boundary keeps showing its pending snippet. It doesn't wait

- if the creator has its own write of the value, which is what its view sees;
- if the other batch's write isn't the expression's first value (an earlier run's value was written before): other views undo it;
- for forks, whose writes aren't part of other views at all;
- outside pending boundaries. There, the creator's own run provides the first value, because a run in another batch doesn't supersede it. And waiting could deadlock: the creator waits for the code that awaits the value, and could be the batch that the other one merges into.

## 11. Offscreen branches

A branch created by a block effect while a batch is processed (`BranchManager`, `each` items and fallbacks) is flagged `EFFECT_OFFSCREEN` until it's committed. It exists for the batches that select it, and its effects ran (and hold state) in that batch's view.

- `#traverse` skips offscreen branches unless this batch selected them (`unskip_effect`, `#unskipped_branches`). `#skips(effect)` combines this check with skipped branches, for `#is_skipped` and `#revalidate_branch`.
- When a batch selects a branch that so far existed offscreen for another batch, that it skipped before, or that a folded batch skips, `unskip_effect` calls `#revalidate_branch`, which schedules all of the branch's effects `MAYBE_DIRTY`. (The folded batch's writes are part of this batch's view, but it didn't run the effects inside the branch that they affect, or reset them. Before, the batch showed them with stale values: `async-each-item-skipped-stale`, `async-if-skipped-branch-stale`.) Versions then tell which effects need to re-run in the batch's view. Nested branches that are themselves offscreen for other batches aren't adopted. (A skipped branch's effects are reset to `CLEAN` when the batch is deferred, `reset_branch`. On `main`, the effects that were dirty were tracked so that they could be rescheduled. Versions make that unnecessary.)
- `#revalidate` skips effects inside branches the batch skips; they don't exist in its view.
- A branch or each item that a commit removes, but that a pending batch still selects, is kept offscreen (`BranchManager#commit`, `destroy_effects` in `each.js`, as on `main`). A kept each item is moved after the onscreen items, which is where `reconcile` expects offscreen items. Before, it was inserted at the wrong position when it was shown again (`async-each-keyed-order-overlapping`). Kept branches and items stay paused, though, which is a bug ([§11.1](#111-kept-offscreen-but-paused)).
- `BranchManager` keeps the selection of every batch that is still linked, until that batch commits or is discarded. Batches can commit in any order. On `main`, a commit destroyed the offscreen branches that older batches had selected, assuming they would never commit, and `#commit` told earlier batches to unskip what the committed batch had selected. Both relied on the earlier batch's block effects being re-run. With exact versions, an earlier batch's block only re-runs if what it read changed in its view, and then it selects its branch again (`async-if-block-unskip`). Otherwise its selection stands (`async-earlier-batch-branch`).

This overlaps with block records ([§8](#8-effect-records-and-the-edges-of-the-graph)): both are needed. The record says which branch the block selected in this batch. The offscreen flag keeps other batches out of that branch.

### 11.1 Kept offscreen, but paused

**What happens.** When a commit removes a branch (`BranchManager#commit`) or an each item (`reconcile` → `pause_effects` → `destroy_effects`) that a pending batch still selects, it's paused first, like anything that's removed. `pause_effect` makes the subtree inert and plays the outro transitions. Once they're done, the branch or item is moved into a fragment and kept there for the pending batch. (Kept each items are flagged `EFFECT_OFFSCREEN`, kept branches aren't.) It stays paused until it's shown again: when the pending batch commits, `reconcile` / `BranchManager#commit` resume it (`resume_effect`).

**The bug.** While it's paused, the pending batch doesn't process it in its view. `#traverse`, `#revalidate` and `#revalidate_branch` skip inert effects, and a derived whose parent effect is inert returns its old value (`derived_inert`). So if the batch's view changes in a way that affects it (e.g. another batch commits a write that it reads, and the pending batch is rebased), it isn't updated, and its async work isn't restarted. The pending batch isn't held back by it, and commits it with stale content. `resume_effect` then schedules the effects whose flags say they're dirty in a new batch, which updates it after the commit. For async work, that's only once that resolves, so the stale content shows until then.

For example, in `{#if show}<i>{await delay(c)}</i>{/if}`, with `<p>{await delay(other)}</p>` next to it:

1. A hides the branch (`show = false; other = 3`), and B, which intersects A, shows it again (`show = true; other = 5`).
2. A commits, and the branch is kept offscreen for B.
3. C writes `c = 2` and commits right away (the branch isn't shown in its view), so B is rebased.
4. The branch is paused, so B doesn't run `delay(2)`. When `delay(5)` resolves, B commits `<p>5</p><i>1</i>`, and only then a new batch starts `delay(2)`.

`async-if-branch-kept-offscreen-live` and `async-each-item-kept-offscreen-live` (for an each item) reproduce this, and are skipped. _Pre-existing_: `main` fails both, too.

The rebase after a commit happens in the same flush as the commit, i.e. when the outro has just started. So both windows matter: during the outro, while the branch or item is still in the DOM (fading out), and after it, while it's offscreen.

**Why the pause can't simply be undone.** Resuming undoes what the outro did: `transition.in()` plays the intro, which also resets the outro's end state (fill-forwards styles, `element.inert = true`). But `resume_children` only walks effects that are still inert. Undoing the pause of something that outroed would show it again without its intro, and still styled as outroed.

**How it could be fixed.**

1. **If it didn't outro** (no transitions, or only `in:` ones, whose `out()` finishes right away), undo the pause right away, without resuming its transitions or scheduling its effects: clear the inert flags of the subtree (like `resume_children`, but without the rest). Also flag kept branches `EFFECT_OFFSCREEN`, so that batches that don't select them keep out. The pending batch then processes it like any offscreen branch it selected. This fixes both tests. The only difference to `main` is that an `in:` intro doesn't play when it's shown again. (Not flagging kept branches `EFFECT_OFFSCREEN` matters today, too, for branches that are kept without being paused: `<svelte:element>` doesn't use transitions, so `on_destroy` runs right away. Nothing keeps batches that don't select such a branch out of it. That's untested.)
2. **If it outroed**, there are two options:
   - **(a)** When the outro is done, undo the pause as in 1, but remember that it outroed. Its intros are played when it's shown again, by a helper that walks the subtree like `resume_children` but only calls `transition.in()`, used by `reconcile` and `BranchManager#commit`. At the same time, re-validate it for the batches that select it, because they skipped it during the outro (a public variant of `#revalidate_branch`; the marks go into `#unprocessed`). This leaves a gap: a pending batch that commits while the outro is still running.
   - **(b)** Let batches process the paused branches and items they select. In async mode, template effects only run at commit, so the DOM of something that is outroing wouldn't change before the pending batch commits. This closes the gap of (a), but every check for inert effects needs an exception for "paused, but selected by the batch being processed", including the `derived_inert` fallback. And inert is also used for real pauses, so this touches more code.

## 12. Reads after `await`: `record_late_read`

Values read after an `await` inside an async expression are still dependencies: as on `main`, `get()` adds the edge outside the update cycle. With exact versions, an edge alone isn't enough. `is_dirty` only checks the first `dv.length` dependencies, so an unrecorded late read would never make the reaction dirty.

`record_late_read(reaction, signal, version)` appends the dependency and the version the view saw to the run that applies (`run_of`: the run's record, or the global state), unless already recorded. (`deps` is replaced by an extended copy, `dv` is extended in place, [§8.5](#85-sharing-arrays).) Graph edges are added separately, before evaluating the value, so even a read that throws can notify the reaction later. The view is the right one because `save`/`restore` (`async.js`) re-applies the reaction's batch after the `await`. If `dv` is `null` (no global run exists and no record), nothing is recorded. The reaction is going to run anyway.

## 13. Teardowns, invalidated runs, and destroyed reactions

- In teardowns (`is_destroying_effect`), `get()` returns values from before the update (`old_values`). Deriveds evaluated there aren't recorded: `update_dependencies` returns early for deriveds, so their value isn't stored either.
- **A derived's global state can become invalid without any version changing.** This happens when it's aborted on disconnect: `remove_reaction` calls `getAbortSignal`'s `abort`, and the derived must re-run when reconnected. Versions can't express this, and flags only work in the real world, so `dv` is set to `null` ("no valid run"). That's checked everywhere: `is_dirty` treats it as dirty, and `get_view` skips the global state.
- Errors are values ([§7.4](#74-errors)), so a run that throws doesn't need special treatment. Before that, a derived that was only `MAYBE_DIRTY` when it threw (it reads another derived) was treated as up to date by the next check, and returned its old value. `error-boundary-30` covers this case in the real world, `async-derived-error-view` in a view.
- A derived that references itself is detected (`derived_references_self`, DEV only) when it's re-evaluated during its own evaluation. `execute_derived` pushes onto its recursion stack in any case, so that its `finally` doesn't remove the outer evaluation from the stack. Before that fix (the bug is also on `main`), the next evaluation of the derived wasn't detected as recursive anymore, which recursed until the stack overflowed.
- `update_dependencies` also returns early if the reaction was **destroyed during its own run**, e.g. by an error boundary (`error-boundary-28`). `destroy_effect` clears `deps`, `dv` and `edges`, and re-adding edges would leak.

## 14. How it fits together — walkthroughs

### 14.1 One synchronous batch (the hot path)

`$.set(a, 1)` → `internal_set` → `capture`. The batch is alone, so `later === null`, and the write is latest: `a.wv = ++write_version`. Then `mark_reactions`: deriveds are flagged as on `main`. Effects go to `schedule`, which is either "being processed" (`#add` with the requested status) or "alone" (`#add` with `MAYBE_DIRTY`).

`flush` → `#process` → `activate()`: alone → `batch_values = null`. Traversal → `is_dirty` uses the inline loop (`dep.wv !== dv[i]`), with derived dependencies updated by `update_derived` (`adopt` finds no derived records). Re-runs take the `update_dependencies` fast path.

Block effects that re-run go through `update_record`. They're recorded in the batch, which costs a small allocation, and promoted on commit (`promote_record`, no allocation when the order is unchanged). Template/render/user effects run at commit in the real world.

Compared to `main`, the extra work is one `dv` write per dependency per run, plus the record and promotion for re-running block effects.

### 14.2 Two batches, B processed while A waits for async work

1. A writes `x` and selects branch X in block `{#if}`. Its async work is pending. The block run is recorded in `A.records`, and branch X is offscreen. A's async effect run is recorded in A.
2. B writes `y`. The write is latest, so `y` is updated in the real world, like `x` was by A. `mark_reactions` reaches the effects that read `y`. B isn't alone and isn't being processed, so they go into `B.#unprocessed` and their statuses are left alone.
3. B is processed. Its unprocessed effects become `MAYBE_DIRTY`. `activate()` builds B's view: `y` from `B.current`, `x` undone using `A.previous` (if A and B don't intersect). The block has no record in B, so it's checked against its global state, which still describes the world before A (A's run is a record in A). In B's view `x` has its old version again, so the block only re-runs if it reads `y`. If it does, the run is recorded in B. Deriveds read in B's view come from cache, record, still-valid global state, or re-evaluation (global if all inputs are latest, else a B record). Branch X is offscreen, so B doesn't process it.
4. B commits: its effect records are promoted, so if the block re-ran its global state is now B's selection. `#commit` → `A.#revalidate([y])`, and A is added to `rebases`.
5. A is processed again (rebase, or when its async work resolves). `#revalidate(A.current)` re-flags whatever B's processing cleaned. `is_dirty(block)` checks **A's record** in A's view. Only `y` changed for it, so the block re-runs only if it reads `y`. Otherwise A's selection of branch X stands, also if B selected another branch and committed it ([§11](#11-offscreen-branches)). A's async effect record is checked the same way, and isn't restarted unless something it read changed in A's view.
6. A's async result arrives → `internal_set(..., own_result)` in A's view → `capture` (latest unless a later batch wrote it) → A is processed and commits. Its records are promoted, and the edges of the block that only B's run needed are pruned (B committed already, so no batch holds a record of it anymore).

### 14.3 Fork

A fork's writes all get new versions, which only exist in the fork (the sources aren't touched), and its view always has a `batch_values` map. Deriveds evaluated with fork values are fork records, and block/async runs are fork records. On `commit`, values are written to the real world with those versions ([§9.3](#93-fork-commit)). Processing re-validates their dependents. Effects compare equal versions and don't re-run. Deriveds `adopt` their fork records. Block/async records are promoted on commit. Nothing computed in the fork is redone.

## 15. Overlaps

These are the places where two mechanisms cover the same ground, or one concept is implemented in several places.

1. **Flags vs versions.** `DIRTY` could in principle be derived from versions, but flags are the cheap push filter, and versions can't express "written during my own run" ([§4.1](#41-recording-versions-at-the-end-of-a-run)). Correctness depends on every reaction whose view changed being reachable by _some_ mark: `mark_reactions`, `#unprocessed`, `#revalidate` (re-processing, rebases, fork commit) or `#revalidate_branch`. Conversely, wherever a flag carries information that versions don't, the view path (which ignores derived flags) must get it some other way: `dv = null` for invalidated runs ([§13](#13-teardowns-invalidated-runs-and-destroyed-reactions)), `e` for errors ([§7.4](#74-errors)).
2. **`#unprocessed` vs `#revalidate`.** For a batch that's processed again, `#revalidate(this.current)` re-flags everything reachable from its writes, which is most of what `#unprocessed` collected. But `#unprocessed` also covers what isn't caused by this batch's writes ([§10.1](#101-batchscheduleeffect-status-batchjs1077)): new effects (`schedule(effect, DIRTY)` from `create_effect`, and deferred ones that never ran), resumed effects, effects re-validated because another batch committed, async errors, and the first processing (where `#revalidate` doesn't run).
3. **Record or global state.** A reaction is its own global run: records and reactions have the same `deps`/`dv` shape, and a derived also has `v`/`wv`. "The run that applies" is `run_of` for effects (used by `is_dirty` and `record_late_read`), and `get_view` for deriveds, where the global state is the derived itself. `promote_record` turns a record into the global state for both.
4. **"Is this the real-world value?"** has two forms: `latest` in `capture` (for writes), and "the real-world version, and for a derived an up-to-date one" for what a derived's run read ([§7.2](#72-latest-values)).
5. **Version reuse for equal values** is implemented in five places ([§3.2](#32-the-same-value-has-the-same-version)).
6. **Fast paths duplicate general logic:**

   - the `update_dependencies` fast path vs `update_record`;
   - the inline `is_dirty` loop vs `is_current`;
   - the alone shortcut in `activate` vs the full view;
   - the alone shortcut in `schedule` vs `#unprocessed`.

   Each could be removed with no change in behaviour, at a measurable perf cost (routing `schedule` through `#unprocessed` when alone, for example, costs about 10% on `kairo_mux`). This has been checked by running the test suites with all four removed, so that every read during processing goes through a view: everything passes. The run also found the bugs that [§7.4](#74-errors) and [§13](#13-teardowns-invalidated-runs-and-destroyed-reactions) describe.

7. **Edge maintenance** has four paths in `update_record`: none (fast path), keep-and-append (records exist), prune the changed suffix (as on `main`, when the edges are the global run's reads) and reconcile (when they include edges retained for runs no batch holds anymore). And `prune_edges` removes the edges of an effect when the last batch's record of it is promoted or dropped. See [§8.3](#83-edges-are-a-superset).
8. **The derived cache vs derived records.** The cache (`view_cache`) lives for one view (one `activate`); records live until commit. A cache entry is what is current in the view: a record, the derived, or an assignment.
9. **`folded`** is used twice: by `activate` (don't undo intersecting earlier batches) and by `record()` (fall back to their records).
10. **Reads versus edges** now have separate storage. The global run remains flat (`deps`/`dv`) for cheap reads; graph connectivity lives in `edges`. Promotion and late reads no longer reorder a dependency prefix. Assignments are checked against the reads of the run that applies, not the edges ([§7.1](#71-get_viewderived-derivedsjs435)).

## 16. What could be simplified, and at what cost

| Part                                                                       | Could be removed or simplified if…                                                                                                                                                                                                                                                                                                                  | Cost / behaviour change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact versions (`dv`)                                                      | …views never went backwards, i.e. no time travel: process batches strictly in order, or always include earlier batches' writes.                                                                                                                                                                                                                     | Loses the core feature: a later batch can't render while an earlier one is pending without showing the earlier one's state.                                                                                                                                                                                                                                                                                                                                                                                                          |
| Versions themselves (compare values instead)                               | …no signal used `safe_equals`, which treats an object as changed even when the same one is written again. Once non-runes mode is dropped (Svelte 6), stores are the only users. A store could instead drive a plain `===` value source plus a counter source that is incremented when it emits the same object again, and `$store` would read both. | Removes the version reuse rules ([§3.2](#32-the-same-value-has-the-same-version)) and the `-1` in `seen_version`, and gets 1 → 2 → 1 right (clean, where versions say dirty). But `dv` and records would keep the values they saw alive until the reaction re-runs (disconnected deriveds, paused branches and pending batches might not re-run for a long time). Errors would need an explicit "is an error" bit. Speed impact unknown (V8 stores small-integer arrays more compactly, and storing object references adds GC work). |
| Recording versions at end of run (relies on flags for writes during a run) | Could go back to recording at read time, in `get()`.                                                                                                                                                                                                                                                                                                | That would _remove_ the dependency on `schedule`'s `active_reaction` rule, but it costs on every read. Recording at the end is cheaper.                                                                                                                                                                                                                                                                                                                                                                                              |
| `#unprocessed` / status scoping                                            | …statuses were stored per batch (e.g. a `Map<Effect, status>` per batch), or every batch ran a full `#revalidate` on every process.                                                                                                                                                                                                                 | Per-batch statuses cost on the hot path. A full revalidation walks the graph for every process.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Alone → `MAYBE_DIRTY` in `schedule`                                        | …async effects tolerated spurious restarts.                                                                                                                                                                                                                                                                                                         | `async-stale-derived-2` fails; more restarted async work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Block records when alone                                                   | …we knew before traversal that the batch will commit synchronously (no pending async work in it), or branch selection survived without records.                                                                                                                                                                                                     | Today this is a small allocation per block re-run on the hot path. `async-state-new-branch-unrelated-update` shows why we can't just skip it.                                                                                                                                                                                                                                                                                                                                                                                        |
| `record_late_read`                                                         | …reads after `await` stopped being dependencies (dev already warns with `await_reactivity_loss`).                                                                                                                                                                                                                                                   | Breaking change for code that relies on it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Latest rule ([§7.2](#72-latest-values))                                    | …deriveds' global state were updated eagerly, or every derived evaluation in a view were batch-local.                                                                                                                                                                                                                                               | Eager updates cost on the hot path. Always-local means recomputing in the real world after each commit, and effects that saw the batch's versions re-run.                                                                                                                                                                                                                                                                                                                                                                            |
| Derived records                                                            | …deriveds were simply re-evaluated in every view (cache per `activate` only).                                                                                                                                                                                                                                                                       | Apps with pending async batches recompute deriveds on every process. With `adopt` gone too, forks redo work on commit.                                                                                                                                                                                                                                                                                                                                                                                                               |
| Kept global runs (`keep_global_run`)                                       | …a run that read the same versions as an earlier one could reuse its version. But that needs the earlier runs, too.                                                                                                                                                                                                                                 | Without them, batches whose views undo the writes of later batches re-run what saw a derived's replaced global run, restarting async work (`async-derived-replaced-run-kept`).                                                                                                                                                                                                                                                                                                                                                       |
| `adopt` / fork commit keeping versions                                     | …committing a fork were allowed to re-run its block/async effects.                                                                                                                                                                                                                                                                                  | Restarts async work that was preloaded in the fork, which defeats the point of forks.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Superset edges / `keep`                                                    | …we never pruned while any batch exists (simpler code).                                                                                                                                                                                                                                                                                             | More spurious `MAYBE_DIRTY` checks. Fewer branches in `update_record`, but it's off the hot path either way.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `own_result` capture when equal                                            | —                                                                                                                                                                                                                                                                                                                                                   | Needed for the batch to own its async results. Otherwise other batches' undo, intersection, merge and commit logic would ignore them.                                                                                                                                                                                                                                                                                                                                                                                                |
| Derived records dropped on commit                                          | Not a simplification but a possible optimisation: promote derived records that are still `is_current` in the real world on commit.                                                                                                                                                                                                                  | Would avoid re-evaluating those deriveds (and re-running effects that saw their versions) after a commit.                                                                                                                                                                                                                                                                                                                                                                                                                            |

## 17. Cost

The measurements in this section predate the separation of ordered reads and graph edges. The split adds one field per reaction; ordinary runs can share the read and edge arrays, while dependency changes can require additional copying. An explicit `reaction.run` object was also prototyped and passed the runtime suites, but regressed the sampled benchmarks by roughly 6–23%, so the global run remains flat.

The final flat layout was compared with `f7a5597ab` using the existing owned benchmarks: three alternating process pairs pinned to one CPU, taking the median of each revision's three fastest-of-ten elapsed times. The ratios were 1.016 for `clean_effects`, 0.994 for `repeated_deps`, and 1.002 for `kairo_unstable`. Individual runs varied substantially, so these are evidence against a large regression in those cases, not proof of performance neutrality. Heap usage and heavy overlapping-batch workloads still need measurement.

Vite production build, minified. "App" mounts one component (async mode) that uses `$state`, `$derived`, `$effect`, `{#if}`, a keyed `{#each}`, `bind:value`, `class:` and an `await` inside a `<svelte:boundary>`. "Full runtime" is everything `svelte/internal/client` exports. The `async-another-try-pt-1` row is a separate branch, included for comparison:

|                          | App (min / gzip / brotli)                                    | Full runtime (min / gzip)            |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------ |
| `main`                   | 36,015 / 13,927 / 12,774                                     | 87,564 / 32,592                      |
| `batch-views` (now)      | 38,448 / 14,873 / 13,586 (**+2.4 KB / +0.95 KB / +0.81 KB**) | 89,881 / 33,510 (+2.3 KB / +0.92 KB) |
| `async-another-try-pt-1` | 41,016 / 15,430 / 14,175 (+5.0 KB / +1.50 KB / +1.40 KB)     | 92,616 / 34,252 (+5.1 KB / +1.66 KB) |

Nearly all of `batch-views`' growth is in `runtime.js` (+2.11 KB: `update_record`, `derived_record`, `record_late_read`, `set_global_run`/`promote_record`, `is_current`, `version_of`, `seen_version`, `run_of`), then `deriveds.js` (+0.24 KB: `get_view`, `adopt`) and `sources.js` (+0.23 KB). `batch.js` is slightly smaller than on `main` (−0.11 KB): the code that is gone ([§10.4](#104-why-maybe_dirty-everywhere), [§11](#11-offscreen-branches)) outweighs records, views and rebases.

Speed, as CPU time relative to `main` (pinned to one core, alternating runs):

| Benchmark              | Ratio                      |
| ---------------------- | -------------------------- |
| most `kairo_*`         | 1.01 – 1.09                |
| `kairo_broad_block`    | ~1.0                       |
| `repeated_deps`        | ~1.05 – 1.10               |
| `clean_effects`, `mol` | ~1.0                       |
| `kairo_deep_block`     | ~0.63 (faster than `main`) |

Roughly 5% of this is the inherent cost of exact versions ([§4.3](#43-why-exact-versions-cant-be-simplified-away)).

## 18. Known bugs and gaps

Bugs noticed while working on this branch but not fixed, with a guess whether they're pre-existing (also on `main`) or new here:

- **Assigning to an errored writable derived** makes reading it throw the assigned value: the assignment replaces the value but leaves the error flag set. Inside a fork it crashes. _Pre-existing_: `main` behaves the same.
- **Kept offscreen, but paused** ([§11.1](#111-kept-offscreen-but-paused)). A branch or each item that is kept offscreen for a pending batch after a commit removed it stays paused. The pending batch doesn't update it in its view, and commits it with stale content, which a new batch then updates. _Pre-existing_.
- **The first value inside a pending boundary waits for a fork's run** ([§10.6](#106-first-values-inside-a-pending-boundary)). The code that awaits the first value waits for the latest run, which can be a fork's, even though the fork's result isn't part of the real world and the content shows the real batch's result. So the boundary keeps showing its pending snippet until the fork's run is done (`async-fork-pending-boundary-run`). Before, the fork's run even superseded the real batch's, and the real world rendered the content without a value: as text, `UNINITIALIZED` threw (`Cannot convert a Symbol value to a string`). _Pre-existing._
- **`#merge` chains.** Merging bumps versions that don't need to change, so reactions that saw the old versions re-run without need. Writes made to a batch after it was merged (it's unlinked by then) go nowhere. _Pre-existing._

Tests copied from `async-another-try-pt-1` that still fail here are marked `skip: true`, with a `// batch-views:` comment guessing why. They all fail on `main` too, so they are gaps rather than regressions:

- `{#await}` blocks aren't fork- or batch-aware (`await.js` is unchanged from `main`): a fork's pending state or result shows in the real world (`async-fork-await-block*`, `async-fork-flush-stolen-effects-render`, `async-fork-obsolete-equal-values`).
- A real batch taking over branches or each items a fork created, when the fork is discarded or re-processed: tearing (`async-fork-branch-async-adopted-variants`, `async-fork-branch-component-adopted`), a crash on an internal symbol (`async-fork-each-item-adopted*`), or nested branches recreated, which starts their async work again (`async-fork-nested-adopted`, `async-fork-nested-branch`).
- Forks: a write-back inside a fork (`x = 1; x = 0`) is lost (`async-fork-write-back`). `commit()` throws `fork_discarded` for a fork that a real batch discarded as obsolete (`async-fork-obsolete-multiple-sources`).
- In async mode, a render effect created in a new branch runs before the existing ones (`new-render-effect-order`).

## 19. Potentially superfluous tests

Superfluous (8)
Test pt-1 mechanism it guards
async-state-new-branch-4 A new branch reading a pending value makes the two batches commit together
async-merge-transitive-dependency A batch that merges in another one takes over its wait on a third batch
async-merge-no-unnecessary-rerun Two merged batches don't re-run anything
async-merge-discard-after-error A merged batch's discard callbacks still run when the batch it merged into is discarded
async-stale-read-multiple-no-double-run pt-1 re-runs an effect in a later batch once per stale value it read
async-state-block-overlap pt-1's rule that batches are applied in the order they started
async-eager-batch-no-merge Don't merge the eager batch into the page batch
async-derived-read-keeps-maybe-dirty-direct The DIRTY-vs-MAYBE_DIRTY path in pt-1's is_dirty
The two merge-discard and merge-no-rerun tests could instead be rewritten so both batches write the same value (e.g. Y also writes a). Then this branch's merge would run and the tests would cover something relevant, including the merge chains listed in §18 of batch-views.md.
