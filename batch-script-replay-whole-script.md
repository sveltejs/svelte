# Whole-script initialization replay: contract and diagnostics

## Verified checkpoint

The frozen whole-script implementation passed **`pnpm test`, exit `0`: 44 test files, 8,424 passed, 39 skipped** in the independent worktree. The skip count is unchanged from `8e634c0f0b`. Exact final commands and remaining limits are recorded at the end of this document. This remains a migration with explicit unsupported-shape fallback, not complete language coverage or solved opaque asynchronous write ownership.

## Worktree relocation

At the user's request, ongoing work moved on 2026-11-17 to `/Users/rich/Development/SVELTE/worktrees/whole-script-replay`, branch `batch-views-whole-script-replay`, based on `8e634c0f0b`.

- Verified SHA-256 contents and modes for all **57** task files (20 modified tracked files and 37 new files), plus an exact tracked-diff comparison, before removing those changes from the original checkout.
- The original `/Users/rich/Development/SVELTE/svelte` checkout was clean after the move and is reserved for the user's unrelated work. All subsequent task commands use the new worktree explicitly.
- A backup of the patch, files, and ignored generated output remains at `/var/folders/7v/vmhzfrs95513z1qrq66r2zy40000gn/T/svelte-whole-script-move-e180yo79`.
- `pnpm install --offline --frozen-lockfile` in the new worktree passed, exit `0`, with zero downloads. Its own workspace links resolve `svelte` and `svelte/compiler` into the new worktree, not the original checkout.
- `pnpm test packages/svelte/src/compiler/script-replay.test.ts` in the new worktree passed, exit `0`: **68 passed**.
- The async sweep started in the original checkout was stopped for relocation without a summary. It is **not** credited as a passing run; its diagnostic output remains at `/tmp/svelte-whole-script-async-sweep.log`.

## Current contract

This document records the user's new requirement from 2026-11-17, after checkpoint `8e634c0f0b` (`Integrate per-batch replay for supported async scripts`). It supersedes the earlier **suffix-only** implementation decision in the spike/progress documents; it does not retroactively change their recorded test results.

The handed-off requirement is:

> whole instance `<script>` rerun per batch; initializer writes stay in the current batch and do not restart initialization; external writes create a new batch and fresh attempt; external rebasing resets the unfinished prefix.

The required distinctions are:

1. **Whole initializer, not a shared prefix.** Every admitted initialization attempt executes its instance-script prefix as well as its async continuation groups. Ordinary snapshots, local state declarations, helper closures, and prefix side effects belong to that attempt's view. Two unfinished attempts must not inherit the first creator's prefix values.
2. **SELFWRITE is not external invalidation.** A write performed by an initializer, including through imported functions or prop callbacks, belongs to its current batch. It may update reactive producers, but must not rerun the initializer or repeat an increment. Earlier ordinary snapshots remain snapshots. Do not fix mutation errors by dropping all dependency tracking: external changes must still be observed.
3. **External updates while unfinished create a fresh attempt.** An external batch/rebase cannot splice a new async result onto an obsolete prefix. Local state initialized for that new attempt starts from the declaration's current-view initializer. Late old results cannot overwrite or continue the fresh attempt.
4. **Publication establishes the long-lived instance.** Once a completed real attempt is published, normal reactive updates do not rerun initialization. An older successful fork may update reactive values, but cannot replace the established ordinary snapshots, edited local state, event behavior, DOM nodes, or component lifetime.
5. **Prefix execution is not template installation.** Prefix side-effect counts can increase with independent attempts; the old blanket “prefix `created` runs once” rule is obsolete. Template/control factories, actions, event installation, and applicable lifecycle execution still retain their exactly-once lifetime guarantees. A function _declared_ before an await is not necessarily executed there; inspect its actual callers.
6. **Other guarantees remain strict.** Preserve cached failed-fork errors and no retry on failed commit, genuine-success-only supersession, original error identity, prompt cancellation where requested, pending-boundary visibility/accounting, and no cross-view or mixed-generation values. Do not introduce implicit abort semantics for loaders that did not request them.

The runtime/compiler owners are implementing a pinned-environment/accessor ABI. The representation is work in progress, not proof that these contracts are met. Generated accessors must select the correct attempt for initialization and the established instance after publication; closures and writes must not retain another attempt's local state accidentally.

## Five deterministic acceptance fixtures

All paths below are under `packages/svelte/tests/runtime-runes/samples/`. They are ordinary, unskipped client tests; none permits an expected runtime error.

| Fixture                                         | Required proof                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | -------------------------------------------------------------------------------------------------------------------------- | --- | --- | ------------------------------------------------------------ | --- | --- | ---------------------------------------- |
| `async-script-replay-whole-prefix`              | F initializes with input 1, R independently with input 2. R first displays `2                                                                                                                                                                                                                                                                                                                                        | 2   | 2   | 2`(input/origin/local/result), not a prefix inherited from F. Editing R changes local state to 3. F commit then displays`1 | 2   | 3   | 1`using the same DOM node. A later input-3 update displays`3 | 2   | 3   | 3`with only`load 3`, not another `init`. |
| `async-script-replay-whole-prefix-rebase`       | An unfinished input-1 attempt replaced by external input 2 must display `2                                                                                                                                                                                                                                                                                                                                           | 2   | 2   | 2`; both origin and local state are fresh 2. Resolving the old input-1 request afterward does nothing.                     |
| `async-script-replay-init-writes-imported`      | After controlled `a(0)`, an imported `invoke(increment)` writes count 1 exactly once and starts `b(1)`. Waiting with b pending causes no additional write/load. Final `before/written/a/b/count` is `0 / 1 / 0 / 1 / 1`, with no `state_unsafe_mutation`.                                                                                                                                                            |
| `async-script-replay-init-writes-props`         | The same contract through a prop callback, so static inspection of a locally declared helper cannot be mistaken for a complete solution.                                                                                                                                                                                                                                                                             |
| `async-script-replay-init-writes-self-feedback` | Child-local `n = $state(0)` and `before = n`; `a = await load(input + n)`, one initializer `n++`, then `b = await load(a + n)`. The self-write must update a to 1 and b to 2 without a second increment, while b stays pending. External input 10 must restart the whole unfinished prefix with n=0, increment once to 1, update a to 11 and b to 12, and publish `0 / 1 / 11 / 12`. Old b results must be harmless. |

The two whole-prefix fixtures are owned by main. The three initializer-write fixtures are owned by the regression agent.

### Bounded diagnostic design

The initializer-write fixtures use no automatically resolving loader chain. Buttons settle explicitly identified requests; output remains inside an explicit pending boundary so controls are usable before initialization completes. Small wrapper/child pairs are necessary here: the first one-file draft put the controls behind the implicit root's pending initialization and therefore failed setup rather than the desired semantics.

Nonreactive controls live at module scope, outside the replayed instance. A cap of four write callbacks stops further reactive writes; a cap of eight loader calls parks further work on an unresolved promise. An overflow log fails the strict assertions. This prevents a bad self-write implementation from resetting its own guard or creating an unbounded `Promise.resolve()` feedback chain.

The self-feedback fixture permits only the documented optional intermediate producer requests `b(1)` and `b(11)`, each at most once. Those may start from an earlier a result before its reactive replacement arrives. It still requires every expected prefix, increment, and a/current-b request exactly once, forbids arbitrary extra work, and resolves the exact current requests. Optional producer work is **not** permission to repeat an initializer increment or retry indefinitely.

## Accepted baseline on `8e634c0f0b`

The worktree began clean. Before running the three initializer-write diagnostics, `git diff --quiet -- packages/svelte/src` confirmed runtime/compiler sources were unchanged from HEAD. Main's two whole-prefix diagnostics and this agent's three initializer-write diagnostics establish **five failing tests** for the new contract.

```sh
pnpm test runtime-runes -t '^async-script-replay-whole-prefix'
pnpm test runtime-runes -t '^async-script-replay-init-writes-'
```

| Command selection                   | Baseline status                        | Meaningful result                                                                                                                                                                                                                  | Evidence                                                                                                                     |
| ----------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --- | -------------- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `^async-script-replay-whole-prefix` | FAIL; 2 failed, 3172 skipped           | Both fixtures receive `2                                                                                                                                                                                                           | 1                                                                                                                            | 1   | 2`instead of`2 | 2   | 2   | 2`: reactive input/result update, but origin/local state remain the creator's 1. Later edit/commit/update assertions are not reached. | Main-run log `/tmp/svelte-whole-script-prefix-baseline.log`; started 09:59:42, duration 4.80s. This agent read the completed output; its process exit code is not independently captured here. |
| `^async-script-replay-init-writes-` | FAIL, exit `1`; 3 failed, 3171 skipped | Imported and prop callbacks throw `state_unsafe_mutation` through `run_site`. Self-feedback emits unexpected `write 0 0 2` after resolving a(1), repeating the increment instead of starting only the updated downstream producer. | `/tmp/svelte-script-replay-init-writes-baseline-valid.log`; started 09:59:44, duration 4.67s. No hang or forced termination. |

The self-feedback baseline fails before its external-update phase, so fresh n=0/a=11/b=12 and late-result assertions remain **unreached**, not proven. The opaque-callback baselines also fail before successful final publication. The first invalid draft's missing-output errors are fixture-setup failures and are not counted as semantic evidence.

Static checks for the three initializer-write fixture configs and imported helper passed: Prettier check and `node --check`, all exit `0`. Test `.svelte` files are excluded from Prettier by repository policy and were compiled/executed by the focused baseline command.

## Readonly review of existing assertions

This audit was written before changing existing assertions. Adaptations must follow observed whole-script behavior and preserve semantic requirements. The first observed prefix-log adaptation and its verification are recorded below.

| Existing fixture                                             | Actual execution site found                                                                                                                                                     | Review conclusion                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `async-fork-shared-script-error-other-fork`                  | `Child.svelte:7` executes top-level `console.log('created')` before either await. `_config.js` currently expects it only for F, not G, and describes a stable once-only prefix. | This is a confirmed obsolete **prefix-count assumption**. G's independent attempt must execute the prefix too; a genuine replacement attempt may also do so. Keep F/G isolation, no rendering before commit, failed-input no retry, and discarded late-replacement assertions. Determine exact new counts from the implementation; do not simply ignore `created` logs. |
| `async-script-replay-established-fork`                       | `created()` is declared before the await, but its actual caller is `<i>{created()}</i>` inside the template if block.                                                           | Its single `created` log is a **template factory/identity assertion**, not a prefix execution count. Keep it, the retained p/i node references, edited local state, and no reinstallation on old-fork commit.                                                                                                                                                           |
| `async-script-replay-compiler-chain`                         | `installed()` is called by a template attribute; `snapshot_of(a)` is a script continuation. The test updates only after initial `settled()`.                                    | Single template installation stays strict. The snapshot must also remain unchanged after publication; whole-prefix replay does not justify rerunning the sealed initializer.                                                                                                                                                                                            |
| `async-script-replay-compiler-statements`                    | Top-level `console.log('prefix')` is genuine prefix work, but the current test's update occurs only after initialization has settled and published.                             | The existing single prefix log should still hold in this scenario. New pre-publication attempts would change counts, not the existing post-publication update.                                                                                                                                                                                                          |
| `async-script-replay-lifetime`                               | `register()` installs `onMount`; mounted/destroyed logs come from lifecycle callbacks, not merely running the prefix.                                                           | Preserve no speculative mount, one real mount, unchanged lifetime on old-fork commit/reactive update, and one destruction on removal.                                                                                                                                                                                                                                   |
| `async-effect-after-await`                                   | Logs named `before` and `after` execute inside `$effect` callbacks on opposite sides of a raw await.                                                                            | They are effect-execution assertions, not ordinary prefix side effects. Do not multiply them just because the registration statements are replayed.                                                                                                                                                                                                                     |
| `async-fork-if`                                              | Child logs x at top level before and after a raw await, but the test admits only one fork-created initializer and then commits it.                                              | Prefix work is replayable in principle, but this specific scenario does not itself require an extra prefix execution. Do not change counts without an observed additional admitted attempt.                                                                                                                                                                             |
| `async-update-during-first-render` and record/resume anchors | Loader calls occur through helpers; the important assertions concern latest values, pending visibility, isolation, and cancellation.                                            | A helper being defined in the prefix does not turn all its later calls into prefix work. Keep the established semantic outputs and inspect actual producers/callers before attributing a failure to replay counts.                                                                                                                                                      |

The `created` name alone is not a classification rule. Direct top-level execution, a producer invocation, a template call, a lifecycle callback, and a function declaration have different contracts. This inventory is a source-backed review, not a claim that the new runtime passes the existing suite.

## Next verification gate

1. Run all five new diagnostics without skips or opt-in routing exceptions.
2. Investigate any initializer repeated-write or mixed-prefix failures in runtime/compiler code; do not relax the three write fixtures' exact per-attempt increments.
3. Observe existing prefix-sensitive fixtures under the new implementation before changing only justified execution counts.
4. Retain the existing template/lifecycle identity, pending-boundary, cached-error, and cancellation anchors; then broaden to the full suite.

No successful whole-script implementation or post-change full-suite result is claimed at this baseline checkpoint.

## Prefix-captured failure versus genuine rebase

Added `async-script-replay-init-writes-prefix-error` after the whole-script implementation began. Its child captures `const key = input` **before** `value = $derived(await load(key))`; the producer itself does not read reactive props directly. This isolates the prefix-dependency path from the already-covered direct-prop failed-producer cases.

The no-await wrapper runs two cases and destroys the boundary itself between them:

1. F's input-1 request fails. R independently initializes with input 0 without writing that input source. R must show `0/0`, then committing F must report the original cached error with no retry of input 1.
2. In a fresh component, F again fails with input 1, but R actually writes input 2 and succeeds. F's genuine prefix rebase must permit a successful input-2 replacement or adoption of R's valid established environment. Committing F must leave `2/2`, not replay its obsolete key-1 failure.

Requests retain input and occurrence. Input 1 and input 0 permit only one request; input 2 permits one real request plus at most one F replacement. The test settles the specific second input-2 request if it exists; it also allows a valid environment/result adoption needing no extra request. It does not permit retries of input 1, arbitrary resolution loops, unexpected error handlers, or speculative prefix leakage into real output.

Observed command:

```sh
FILTER=async-script-replay-init-writes-prefix-error pnpm test runtime-runes
```

**FAIL, exit `1`: 1 failed, 4 skipped**, started 10:27:36, duration 3.24s. Evidence: `/tmp/svelte-script-replay-prefix-error.log`.

The unrelated-success case passed, including original-error identity and no retry. The genuine input-2 case displayed healthy `2/2` after R completed, but **F commit then changed it to `<p>failed: original</p>` instead of retaining `<p>2/2</p>`**. This is a runtime counterexample, not a speculative-count difference. No assertion was weakened to bypass it.

Readonly source inspection found that prefix invalidation restarts an existing factory only while `script.sealed === null`, while `ensure_attempt` excludes failed attempts from post-seal adoption. Together these are a plausible explanation for an immutable key-1 capture remaining sticky after R seals. A fix must still preserve case 1: unrelated publication cannot clear every private failed fork indiscriminately.

## First observed existing-prefix adaptation

```sh
FILTER=async-fork-shared-script-error-other-fork pnpm test runtime-runes
pnpm test runtime-runes -t '^async-script-replay-(established-fork|lifetime) '
```

- The unchanged `other-fork` fixture initially failed, exit `1`, because G actually logged `['created', 'load 2']`, whereas the old suffix-only expectation was `['load 2']` (`/tmp/svelte-script-replay-whole-other-fork.log`, started 10:27:39).
- Updated only that exact top-level prefix-log expectation and its explanatory comment. Its failed-input no-retry, precommit invisibility, final output, and discarded late-replacement assertions remain unchanged.
- The adapted fixture passed: **1 passed, 4 skipped, exit `0`**, started 10:28:24 (`/tmp/svelte-script-replay-whole-other-fork-adapted.log`). No extra `created` at G's later commit was observed or allowed.
- The protected template/lifecycle selector passed **unchanged**: **2 passed, 3176 skipped, exit `0`**, started 10:28:49 (`/tmp/svelte-script-replay-whole-identity.log`). Template `created()` remains exactly once, retained node identity holds, and mount/destruction counts were not relaxed.

These are focused working-tree results while runtime/compiler implementation is concurrent. They do not establish a passing full suite, and the prefix-captured failure counterexample above remains unresolved at this observation point.

## Foreign-writer logical state carryover

Added `async-script-replay-init-writes-foreign-state` without modifying the original `async-script-replay-whole-prefix-state-write` fixture. The cross-component shape is intentional: a no-await parent keeps `show=false` in the real world, while F forks `show=true` and creates the child. The child initializes scalar `n=$state(0)`, captures `origin=n`, and registers a closure that increments n before waiting on `load(n)`.

A parent button invokes that registered closure **outside the fork**, while real `show` remains false. This real writer batch does not select/adopt the child. Its actual commit must nevertheless carry logical state-slot override 1 back to F's new initializer: expected logs are first `init 0`, `load 0`, then `init 1`, `load 1`. Resolving input 1 must remain invisible until F commits; F commit must reveal `<p>1|1|1</p>`. The original input-0 request is resolved afterward and must not change output or DOM identity.

The parent keeps one labelled request for input 0 and one for input 1. Duplicate or unexpected inputs log a diagnostic and park rather than replacing the old resolver or creating an automatic retry loop.

```sh
FILTER=async-script-replay-init-writes-foreign-state pnpm test runtime-runes
```

Observed **FAIL, exit `1`: 1 failed, 4 skipped**, started 10:34:26, duration 3.27s; no hang. Evidence: `/tmp/svelte-script-replay-foreign-state-baseline.log`.

After the foreign write, the real output correctly stayed empty, but the fork's replacement prefix logged **`['init 0', 'unexpected load 0']` instead of `['init 1', 'load 1']`**. The logical edit was lost when the fresh state source was constructed. The later private-resolution, fork-commit and late-result checks are consequently unreached.

Readonly wiring confirms `sources.internal_set` calls `record_script_state_write` for external writes. The inspected implementation records overrides on the writer batch and schedules the script effect, but that batch need not own/select the initializer whose state was edited. The runtime owner is responsible for carrying the committed edit to the actual owner without leaking uncommitted values or forcing the real branch to select the child.

## Failure before the first async thunk exists

Added the final diagnostic `async-script-replay-init-writes-prefix-throw` (one scenario, three files). No further diagnostics are planned before core/full-suite verification.

The child logs `init input` and throws the parent's original Error for input 1 **before** its first awaited declaration. F selects input 1. R independently reveals input 0 without writing the input source. There is no explicit failed/onerror boundary. Required behavior:

- Fork creation caches the prefix error without invoking `load(1)` or leaking an unhandled rejection.
- R independently logs `init 0`, `load 0` and publishes `<p>0</p>` when the parent resolves its controlled request.
- R's unrelated success must not rerun F's failed prefix or clear its cached error.
- Both F commit calls reject with the same original Error; the parent catch handler records `caught original 1` and `caught original 2`. Neither commit reruns initialization/loads or modifies the real DOM/node identity.

```sh
FILTER=async-script-replay-init-writes-prefix-throw pnpm test runtime-runes
```

Observed **FAIL, exit `1`: 1 failed, 4 skipped**, started 10:37:47, duration 3.43s; no hang. Evidence: `/tmp/svelte-script-replay-prefix-throw.log`.

The first two stages behaved correctly: F logged only `init 1`, then R logged `init 0`, `load 0` and displayed `<p>0</p>`. However, resolving R's request also produced an unexpected **second `init 1`**. The failed prefix was re-executed despite no genuine input replacement. This is not the legitimate extra prefix execution of a separately admitted healthy attempt, and the assertion was not relaxed. The repeated-commit rejection/identity assertions are **unreached** in this run.

The inspected runtime already guards a missing environment before invoking async-site thunks, so this run did not fail with an undefined-thunk error. Its remaining counterexample is unsolicited retry of the failed prologue after unrelated publication.

## Post-relocation adoption assertion review

All work in this section used `/Users/rich/Development/SVELTE/worktrees/whole-script-replay`, branch `batch-views-whole-script-replay`. File tools used absolute paths and shell commands set that cwd explicitly. The original checkout was not inspected or modified.

The broader new-worktree async sweep was stopped without completion; `/tmp/svelte-whole-script-worktree-async.log` is incomplete and **not a passing result**. A pending-merge case was initially suspected from the last globally printed line. That hypothesis was subsequently disproved: the log interleaved shards, and the final line belonged to the completed first shard. The actual stall was `async-resolve-stale` in the second shard, described below. This review covered only three reported log failures and did not add diagnostics or change runtime/compiler code.

Classification preceded edits. Source inspection of `ensure_attempt`, `adopt_attempt`, and their callers confirmed that after a real initializer publishes, a healthy older attempt adopts the established environment and does not finish its abandoned imperative initialization suffix. Its reactive producers remain active in the appropriate view. A failed attempt is not allowed to discard its cached failure merely because another view succeeds.

| Fixture                               | Observed behavior and narrow adaptation                                                                                                                                                                                                                          | Assertions kept unchanged                                                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `async-record-initialization-fork`    | After R publishes snapshot 0, resolving F's pending value does not emit `continued 1 1`. Changed the expectation to exact absence, with an adoption explanation.                                                                                                 | F remains invisible before commit; published snapshot 0 and p-node identity survive; discard emits `abort 1`, hiding emits `abort 0`, and committing F shows `<b>1</b><p>1 0</p>` with the original abort-source behavior.                             |
| `async-record-initialization-private` | A's publication now logs `continued with 0 0` followed by the one `second 1` producer call as B adopts the established initializer. Moved that exact request assertion earlier. B's later reactive completion emits no abandoned `continued with 1 1` statement. | A can finish private `<p>0 0 0</p>` without being aborted by B, that output remains while B is pending, and B eventually publishes `<p>1 1 1</p>`. The second-input-1 loader is still required exactly once; no new request count allowance was added. |
| `async-fork-failure-superseded`       | F's genuinely successful input-2 replacement adopts the published initializer rather than executing an extra `continued 2` suffix. Changed only that late log to exact absence.                                                                                  | Initial failed `load(1)` is never retried; R's `continued 2` and the one F replacement `load(2)` remain exact; no error is replayed on F commit and healthy `<p>2</p>` remains visible.                                                                |

Commands, executed in the new worktree:

```sh
pnpm test runtime-runes -t '^async-(record-initialization-(fork|private)|fork-failure-superseded) '
pnpm test runtime-runes -t '^async-(fork-failure-commit-cached|script-replay-init-writes-prefix-error) '
```

| Run                             | Result                                           | Evidence                                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assigned three before edits     | FAIL, exit `1`: 3 failed, 3177 skipped           | `/tmp/svelte-whole-script-owned-adoption-before.log`, started 11:07:30, duration 4.85s                                                                                                                                                                   |
| Intermediate assertions reached | FAIL, exit `1`: 2 passed, 1 failed, 3177 skipped | `/tmp/svelte-whole-script-owned-adoption-intermediate.log`, started 11:08:56. Fork discard/commit and superseded failure scenarios passed fully. Private-view final DOM was already correct; only its final abandoned continuation expectation remained. |
| Final assigned three            | **PASS, exit `0`: 3 passed**, 3177 skipped       | `/tmp/svelte-whole-script-owned-adoption-final.log`, started 11:09:58, duration 4.90s                                                                                                                                                                    |
| Unchanged private-error guards  | **PASS, exit `0`: 2 passed**, 3178 skipped       | `/tmp/svelte-whole-script-owned-adoption-error-guards.log`, started 11:10:00, duration 4.82s. Covers unrelated-success cached-error retention and genuine prefix-rebase failure replacement.                                                             |

The final two runs contained the runtime owner's temporary `PROCESS` stderr traces from the concurrent pending-merge investigation. No diagnostic error or hang occurred in these focused selections. They establish the listed assertions on that instrumented working tree, not a clean final runtime/full-suite verification. No skips, expected errors, or broad log filtering were introduced.

## Already-ready prefix rendering

Whole-prefix readiness exposed a real `template_effect` construction bug in `async-ownership-validation`, in both DOM and hydration modes. The render effect initially observed an already-true environment checkpoint while its input array was still null. Later input installation could schedule a `MAYBE_DIRTY` effect whose dependency versions had not changed, so the first rendering body never executed.

The fix allocates the effect once with no body, installs the body when its inputs exist, and preserves immediate initial rendering for a synchronous construction callback. Common `flatten` readiness gates notify the same effect when another view becomes ready, including inner template-async gates. This second notification is necessary when a fork constructs inputs first but the real view becomes ready later; merely leaving the effect's versions null does not subscribe it to the real view's later inputs.

After removal of temporary diagnostics, the runtime owner verified these commands in the new worktree, each with exit `0`:

```sh
NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^(async-script-replay-|async-ownership-validation|async-merge-)'
pnpm test packages/svelte/tests/script-replay/test.ts
pnpm exec tsc --project packages/svelte/tsconfig.runtime.json --noEmit
```

The first selection passed **46 tests**: 28 replay cases, 2 ownership cases, and 16 merge cases. The second passed **12 kernel tests**. The merge cases needed no merge-specific runtime change. These focused results do not establish a full-suite pass for the whole-script work.

## Deferred state writers: a confirmed eligibility gap

The next broad async run still stalled with no preceding assertion failures. Per-shard inspection, followed by isolated execution, identified `async-resolve-stale`, not a merge test or a test-order interaction.

Its script-local helper schedules `Promise.resolve().then(update_and_resolve)`. That callback increments component state before resolving the promise awaited by the initializer. It runs outside the controlled initializer context, so the write is classified as external. A fresh factory then resets the helper's ordinary environment and starts another request. Pending-boundary publication can retire the old attempt before its value is delivered. Repetition starves timers; the original fixture hangs even in isolation.

This is a concrete instance of the previously recorded **unimplemented asynchronous helper write-attribution obligation**. It is not fixed by leaving an initializer context globally active across a suspension, which would misattribute unrelated user activity.

A new deterministic fixture, `async-script-replay-deferred-writer-fallback`, caps writing completions at three; its fourth request resolves without writing. Before an eligibility fix:

```sh
NO_COMPILE_CACHE=true FILTER=async-script-replay-deferred-writer-fallback pnpm test runtime-runes
```

Result: **FAIL, exit `1`, one failed test**. Expected `1 / 42 / 1`; received `3 / 42 / 4`. Evidence: `/tmp/svelte-whole-script-deferred-writer-baseline.log`. This demonstrates repeated initialization without an unbounded loop or timing-dependent assertion.

The chosen containment is a general compiler eligibility guard for detectable, reachable deferred/async state-writing helpers: default compilation retains the old whole-component lowering, and strict replay rejects unsupported cases. No fixture-level opt-out or weakened expected count is acceptable. This is containment during migration, **not implementation of asynchronous callback ownership**. Opaque imported asynchronous helpers remain a separate unresolved attribution problem. The guard is implemented in `find_deferred_state_write`, called by `analyze_script_replay` before replay metadata is applied. Compiler tests cover the actual formerly hanging source, strict rejection, byte-identical disabled/default fallback, and positive synchronous/external-registration cases. The final checks below include both unchanged original runtime variants and the bounded probe. See `batch-script-replay-compiler-limits.md` for the guard's conservative coverage and remaining blind spots.

## Two remaining resume assertion reviews

The diagnostic broad async selection excluding `async-resolve-stale` completed with **871 passed, 3 failed, 2307 skipped**, exit `1` (now archived at `/tmp/svelte-whole-script-kernel-20261117-A9p0hU/.fx-kernel-async-except-resolve-stale.log`, started 11:39:56). One failure was the deferred-writer guard case above, owned by the compiler/main agents. This review changed only the configs of `async-resume-script` and `async-resume-script-later-batch`, after inspecting their source, generated child code, and focused failures.

- **`async-resume-script`:** When R finishes first and publishes, F's later result must not execute the abandoned `continued with 1` statement. The expectation is now exact absence in that order only. The F-first order still requires `continued with 1`, and the subsequent real continuation still requires `continued with 0`. Both orders retain real output `0 0` followed by committed fork output `1 10`.
- **`async-resume-script-later-batch`:** The observed `second 2` at A's publication is B's **first invocation at that site**, not an additional duplicate. Before that point B had requested only `first 2`; A's completed second-site input was 1, whereas B's actual x is 2. Adoption lets the established independent producer evaluate B's real input difference before B's first result arrives. The one `second 2` assertion moved earlier, and the later point now requires **no work at all**, explicitly guarding against a duplicate request.
- The child contains no recreated prefix helper function. Its generated producer calls the two accessor slots for `$$props.push` and `$$props.x`. The parent has no async initializer, supplies the same `push` function throughout, and does not recreate itself between these phases. Therefore this adaptation is **not** permission for environment-only invalidation or changing stable prop/import function identity: it is one first request for genuinely different data, with the total request count unchanged.
- In the A-first case, B's eventual second result still publishes `2 2` but does not execute its abandoned `continued with 2 2` statement. The B-first case continues to require that statement before publication. Both completion orders, the older A result's no-overwrite assertion, final DOM, and reset behavior remain strict.

All commands below ran with cwd `/Users/rich/Development/SVELTE/worktrees/whole-script-replay`:

```sh
pnpm test runtime-runes -t '^async-resume-script(-later-batch)? '
```

| Run                        | Result                                           | Evidence                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused baseline           | FAIL, exit `1`: 2 failed, 3179 skipped           | `/tmp/svelte-whole-script-resume-two-before.log`, started 11:42:57, duration 4.50s                                                                                                                                                                                           |
| First observed adaptations | FAIL, exit `1`: 1 passed, 1 failed, 3179 skipped | `/tmp/svelte-whole-script-resume-two-intermediate.log`, started 11:44:08. Both `async-resume-script` orders passed. Later-batch reached correct final `2 2`, and the exact no-duplicate assertion after B's first result passed; only B's abandoned imperative log remained. |
| Final two fixtures         | **PASS, exit `0`: 2 passed**, 3179 skipped       | `/tmp/svelte-whole-script-resume-two-final.log`, started 11:45:13, duration 4.32s                                                                                                                                                                                            |

No runtime/compiler code, fixture components, request controls, other configs, or expected error/abort behavior was changed by this review. No new fixtures, skips, broad log filters, or additional request-count allowances were introduced. This is focused proof for the two reviewed assertions, not full-suite verification or a resolution of the deferred-writer ownership limitation.

## Final frozen-source verification

All commands ran in `/Users/rich/Development/SVELTE/worktrees/whole-script-replay`, except the compiler bundle build, which ran in its `packages/svelte` directory. No source edits occurred during these final checks. The later changes record documentation only.

| Command                                                                         | Result                                                                                                |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                                     | PASS, exit `0`: **44 files passed; 8,424 passed, 39 skipped**                                         |
| `pnpm test script-replay signals`                                               | PASS, exit `0`: **244 passed, 2 skipped**                                                             |
| `NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-' --reporter=verbose` | PASS, exit `0`: **876 passed**, 2,305 excluded by selection                                           |
| `pnpm test snapshot`                                                            | PASS, exit `0`: **36 passed**                                                                         |
| `pnpm exec tsc --project packages/svelte/tsconfig.runtime.json --noEmit`        | PASS, exit `0`                                                                                        |
| `pnpm exec tsc --project packages/svelte/tsconfig.json --noEmit`                | PASS, exit `0`                                                                                        |
| `pnpm exec rollup -c`                                                           | PASS, exit `0`; rebuilt this worktree's CommonJS compiler, with existing circular-dependency warnings |

The full run started at local time `11:59:56` and reported `52.33s`. Its complete output is `/tmp/svelte-whole-script-full-final.log`; the async log is `/tmp/svelte-whole-script-async-verified.log`. The full-suite skip count remains **39**, unchanged from the earlier integration checkpoint. No timeout adjustment, fixture opt-out, or new skip was used to obtain this pass.

Source lint and formatting also passed, exit `0`, using these focused commands:

```sh
{ git diff --name-only -z -- packages/svelte/src ':!**/*.d.ts'; git ls-files --others --exclude-standard -z -- packages/svelte/src ':!**/*.d.ts'; } | xargs -0 pnpm exec eslint
{ git diff --name-only -z -- packages/svelte/src; git ls-files --others --exclude-standard -z -- packages/svelte/src; } | xargs -0 pnpm exec prettier --check
pnpm exec prettier --check batch-script-replay-whole-script-api.md batch-script-replay-whole-script.md batch-script-replay-compiler-limits.md batch-script-replay-progress.md packages/svelte/tests/runtime-runes/samples/async-script-replay-deferred-writer-fallback/_config.js
git diff --check
```

Declaration files are intentionally excluded from the lint command because ESLint ignores them; both TypeScript projects validate them. Test fixture Svelte files are not claimed as Prettier coverage. Their generated behavior is covered by runtime execution.

## What this checkpoint does not establish

- The compiler still routes unsupported components to the old whole-component lowering. This is not yet the final single-runner model, and no reduction in total implementation complexity is claimed.
- Detectable deferred state writers are contained by a compiler guard, not repaired by automatic async-context propagation. Opaque imported/prop asynchronous helpers and unsupported dynamic callback flows remain unproved. The guard is not a general effect analysis.
- Deep proxy-field and arbitrary class-state carryover, per-attempt context-map isolation, broader writable/post-await bindings, and arbitrary suspension/closure lowering remain separate obligations. Known unsupported context mutations and stateful classes retain fallback; opaque variants are not thereby proved safe.
- The whole-initializer contract is implemented for the admitted async-script shapes. The earlier stable-prefix prototype restriction is gone for those shapes, but this does not claim all components and all JavaScript forms use the new initializer.
- Cached failed-fork errors, prompt cancellation, retained component state and DOM/effect lifetimes remain mandatory regression constraints. A future coverage expansion must rerun these proofs rather than infer correctness from initial rendering or this checkpoint's passing hybrid suite.
