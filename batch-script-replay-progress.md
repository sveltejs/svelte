# Script replay integration progress

## Current verified status

On 2026-11-16, the final **`pnpm test` passed, exit `0`: 44 test files passed, 8,347 tests passed, 39 skipped** (8,386 total). Vitest started at local time `23:29:59` and reported `30.03s`. Full output is temporarily available at `/tmp/svelte-script-replay-full-final.log`. The 39 skips match the full-suite checkpoint baseline; no skip or expected-error exemptions were added for replay.

This integrates replay into default compilation of supported script initializers, rather than opting the recovered tests into the prototype. All fourteen recovered async children use replay by default. Unsupported components still use the old lowering, and the strict/disabled `experimental.scriptReplay` controls remain temporary migration tools. **A passing suite is not a claim of complete language support or a final single-runner design.** See [compiler coverage and concrete remaining counterexamples](batch-script-replay-compiler-limits.md) before broadening it further.

### Changes beyond the checkpoint

- Added raw root-await and continuation-statement stages, plus atomic synchronous groups. Group members execute in one JavaScript segment; readiness is published coherently afterward.
- Routed tagged script readiness through the ordinary template, block, directive and async-expression consumers. Removed the prototype's separate UI helper APIs.
- Kept async producer results in separate stable, batch-aware sources. An adopting view no longer pins inherited results by cloning them into an initialization frame.
- Preserved user-requested abort behavior: independent real batches are not implicitly cancelled merely because another run starts.
- Added attempt-owned resource scopes, preserving established lifecycle registrations when an older successful fork commits or a producer later updates.
- Restored immediate pending-boundary publication on fork commit. Actual-commit waiters receive failures before the first commit; later failures follow normal real-world boundary handling.
- Kept cached errors attached to current producer outcomes, including handled errors while another sibling is pending. A current handled failure does not wait forever for work in its own failed boundary; an outside sibling can still hold commit while a genuine successful replacement arrives.
- Fixed private-to-real derived-cache version preservation. Focused tests cover both unequal and equal existing global values, including a normal effect that must not rerun when its visible value is unchanged.
- Hardened discard, callback-driven traversal, late completion cleanup, and retirement of covered real initialization work without erasing private fork failures.

### Verification record

| Command                                                                  | Result / exit | Evidence                                                                    |
| ------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------- |
| `pnpm test`                                                              | PASS / `0`    | 44 files; 8,347 passed, 39 skipped                                          |
| `pnpm test runtime-browser`                                              | PASS / `0`    | 144 passed                                                                  |
| `pnpm exec tsc --project packages/svelte/tsconfig.runtime.json --noEmit` | PASS / `0`    | No diagnostics                                                              |
| `pnpm exec tsc --project packages/svelte/tsconfig.json --noEmit`         | PASS / `0`    | No diagnostics                                                              |
| `pnpm test signals`                                                      | PASS / `0`    | 128 passed, 2 skipped after the shared cache fix                            |
| `pnpm test packages/svelte/tests/signals/derived-view-promotion.test.ts` | PASS / `0`    | 2 passed, with both cached-producer and ordinary-effect equality assertions |
| `pnpm test snapshot`                                                     | PASS / `0`    | 36 passed; intended generated-code changes reviewed                         |
| `pnpm test packages/svelte/src/compiler/script-replay.test.ts`           | PASS / `0`    | 39 passed                                                                   |
| `git diff --check`                                                       | PASS / `0`    | No whitespace errors                                                        |

Source ESLint and focused Prettier checks passed. Repository ESLint excludes test files; ignored-file warnings are not counted as lint coverage. Compilation, executed assertions, focused formatting and included TypeScript checks cover the tests.

The first broad integration run had **all 8,347 assertions passing** but exited `1` because `runtime-browser`'s `afterAll(browser.close)` exceeded its existing 10-second hook timeout. Browser-only verification then passed, followed by the full passing run above without concurrent typechecking. The timeout was not increased and the browser harness was not altered. This transient teardown failure is retained in `/tmp/svelte-script-replay-full-integration.log`, not hidden as a successful run.

Checkpoint commit: `e29a81d3d0` preserves the opt-in prototype and original recovered assertions. The integration after that checkpoint preserves correctness assertions while changing explicitly documented assumptions about one shared speculative continuation. No handoff runtime was imported and no PR was opened.

## Full-suite checkpoint baseline

- Date: 2026-11-16.
- Checkpoint: `e29a81d3d0` (`Prototype per-batch script replay with stable effects`).
- Command: `pnpm test`.
- Result: **FAIL**, exit `1`; **8,310 passed, 14 failed, 39 skipped** (8,363 tests); 41 passed / 1 failed test files.
- Vitest started at `22:48:21`; reported duration `34.08s`.
- Full output: `/tmp/svelte-script-replay-full-baseline.log` (local, non-durable).
- All 14 failures are the recovered diagnostics listed in [the untouched-runtime baseline](batch-script-replay-baseline.md). No additional suite blockers appeared. This checkpoint still uses the old default lowering for those fixtures; passing opt-in replay tests does not establish their default behavior.
- The full suite was run by the main agent. The recovery agent independently inspected its completed log and checkpoint. No fixture expectations were changed for this baseline.

## Recovered-fixture integration inventory

There are 16 recovered fixture directories, with 46 source files. The two template-only fixtures already pass. The other fourteen contain child script awaits; twelve of those also contain a trailing `console.log(...)` statement. None requires writable suffix state, derived overrides, or suffix destructuring.

| Fixture suffix (under the async fixture families) | Required surface                                                                    | Adaptation boundary                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `async-commit-discards-earlier-forks`             | Conditional template await                                                          | Keep current assertions; rebasing after cleanup must complete.                                                                                             |
| `async-fork-discard-no-restart`                   | Template await                                                                      | Keep strict no-work-after-discard assertions.                                                                                                              |
| `async-fork-discard-settled-result`               | Two dependent derived awaits; trailing statement                                    | Label requests if needed; preserve settlement/discard races, cleared ownership, no revival.                                                                |
| `async-fork-discard-shared-before-init`           | Standalone raw await; derived await; trailing statement                             | Independent `begin()` calls are valid; a discarded continuation must never call `load(1)`.                                                                 |
| `async-fork-discard-shared-chain`                 | Two dependent derived awaits                                                        | Replace positional queue controls with site/request labels; leave losing request unresolved until after real completion, then prove late-result isolation. |
| `async-fork-discard-shared-continuation`          | Three independent derived awaits                                                    | Resolve explicit sites rather than five arbitrary queue shifts; require real completion without the discarded request.                                     |
| `async-fork-discard-unrelated-owner`              | Derived chain, immutable intervening snapshot, trailing statement, pending boundary | Real second stage need not wait for creator discard; snapshot must remain `0`, never unrelated fork's `99`.                                                |
| `async-fork-failure-commit-cached`                | Derived await, trailing statement, handled boundary                                 | Original cached error and healthy unrelated real output; no retry on commit.                                                                               |
| `async-fork-failure-superseded`                   | Same, with genuine dependency replacement                                           | Distinguish real and fork-replacement `load(2)` requests; allow valid replacement continuation, never retry `load(1)` or replay its obsolete error.        |
| `async-fork-failure-commit-pending`               | Derived await, trailing statement, implicit boundary                                | Pending commit receives original error; no unhandled rejection, retry, or successful publication.                                                          |
| `async-fork-shared-script-error-real-owner`       | Derived await, trailing statement, pending/failed boundary                          | Fork failure must not alter real pending/success output or invoke its handler.                                                                             |
| `async-fork-shared-script-error-fork-owner`       | Derived await, trailing statement, conditional child/failed boundary                | Failed creator cannot poison independent real success.                                                                                                     |
| `async-fork-shared-script-error-real-failure`     | Derived await, trailing statement, failed boundary                                  | Real failure routes immediately; discarded late success cannot continue.                                                                                   |
| `async-fork-shared-script-error-other-fork`       | Prefix statement, two dependent awaits, trailing statement                          | G can progress before F fails; neither renders before G commits. Prefix `created` remains exactly once in the suffix-only design.                          |
| `async-fork-shared-script-error-unhandled`        | Derived await, trailing statement, implicit boundary                                | No speculative unhandled rejection; discarded commit rejects; real continuation remains healthy.                                                           |
| `async-fork-shared-script-error-unhandled-commit` | Derived await, trailing statement, implicit boundary                                | Both commits reject with the original cached error, without retry or publication.                                                                          |

The wrapper components contain ordinary event handlers, functions, components, conditionals and pending/failed boundaries. They do not themselves have replay suffixes and must remain supported normally.

## Adaptation rules and current status

- Await default compiler/runtime integration and inspect its actual results before modifying expectations. Do not add opt-in flags simply to obtain passing recovered tests.
- Label requests by producer site, input and occurrence where duplicates are legitimate. Resolve one explicitly identified request; do not silently resolve every duplicate or discard request-count evidence.
- Preserve strict assertions around cancellation, late writes, error identity/delivery, failed-commit no retry, genuine error replacement, state/DOM identity, and pending-count cleanup.
- Post-await continuation counts/order can change for independent unfinished attempts. Stable-prefix installation counts and ordinary post-publication initialization must not change.
- At the full-suite checkpoint, recovered source fixtures were unchanged. No post-integration test result is claimed yet.

## Request-control hardening after the checkpoint

The initial harness-only adaptation touched `async-fork-discard-shared-chain` and `async-fork-discard-shared-continuation` (three files each), before default integration was ready:

- Child loaders identify the producer site explicitly as `first`, `second`, or `third`; numeric loader inputs and console logs remain unchanged.
- Requests retain site, input, settlement status and occurrence. Settled entries remain in the request list so an occurrence always identifies the same execution. Resolving an absent/already-settled request throws instead of silently doing nothing.
- Buttons now resolve the exact fork-first, real-first, real-second/third and late discarded-second requests. This replaces ambiguous positional queue shifts and the continuation fixture's arbitrary five-shift loop.
- The losing fork's second request remains unresolved until the real output has completed. Existing exact log expectations and final/late-result output assertions are preserved. No opt-in flags, skips or expected-error allowances were added.
- Runtime verification is deliberately deferred until the compiler/runtime owners report default integration ready. Harness edits alone are not a passing runtime result.
- Static checks: `node --check packages/svelte/tests/runtime-runes/samples/async-fork-discard-shared-chain/_config.js`, `node --check packages/svelte/tests/runtime-runes/samples/async-fork-discard-shared-continuation/_config.js`, and `git diff --check` all passed, exit `0`.
- Prettier formatted this document and the two configs without changes. `.prettierignore` deliberately excludes test `.svelte` files; their formatting was not claimed as checked.

## Independent cleanup changes

The main agent implemented cleanup changes separately from fixture adaptation:

- Snapshot batch traversal with `get_batches()` in commit rebasing, `abort_replaced` and `abort_all`, so callback-driven unlinking does not truncate traversal.
- Terminal/idempotent discard, reusing `scripts_discarded`, clears queued merges, private captures and list links before later callbacks can revive retired work.
- Default `async_expression` ignores late captures for retired canonical targets; a late decrement after discard does not decrement an already-cleared count.

The new `packages/svelte/tests/signals/batch-cleanup.test.ts` contains two focused tests: reentrant discard releases private captures exactly once, and removing an intervening batch does not truncate cleanup traversal. The main agent reports **2 passed**; the recovery agent inspected the source but did not rerun the command. The broader signals suite was still running when this update was received.

That cleanup-only result did **not** establish a pass for `async-fork-discard-settled-result`; its full settlement/discard race and surviving-script completion needed a focused default-replay run. No recovered expected counts were changed in response to the cleanup result. The subsequent default run below does establish its unchanged assertions.

## Default replay: observed adaptations and final recovered result

After the compiler/runtime owners reported default integration ready, ran:

```sh
pnpm test runtime-runes -t '^async-fork-(discard-(shared|settled-result|no-restart|unrelated-owner)|shared-script-error|failure-)'
FILTER=async-commit-discards-earlier-forks pnpm test runtime-runes
```

| Run                                                            | Result         | Meaningful output                                             | Local log                                         |
| -------------------------------------------------------------- | -------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| Initial default recovered selector, before expectation changes | FAIL, exit `1` | 6 failed, 11 passed, 3149 skipped; started 22:59:09           | `/tmp/svelte-script-replay-recovered-default.log` |
| Standalone cleanup fixture                                     | PASS, exit `0` | 1 passed, 4 skipped; started 22:59:12                         | Captured CLI output                               |
| First adapted recovered selector                               | FAIL, exit `1` | 1 failed, 16 passed, 3151 skipped; started 23:01:03           | `/tmp/svelte-script-replay-recovered-adapted.log` |
| Final adapted recovered selector                               | PASS, exit `0` | **17 passed**, 3151 skipped; started 23:01:57; duration 4.10s | `/tmp/svelte-script-replay-recovered-final.log`   |

The two extra selector passes are pre-existing `async-fork-failure-escapes` DOM/hydration variants. Together with the standalone cleanup pass, **all 16 recovered fixtures pass under default lowering**. No fixture was enabled through an opt-in compile flag, skipped, or given an expected-error/unhandled-rejection exemption. The changing skipped totals reflect concurrent addition of other replay tests, not changes to this selector's 17 executed tests.

The six initial failures were exact execution-order/count assertions, not relaxed semantic failures. Each adaptation followed observed output and retained strict request counts:

| Fixture                          | Observed change                                                                                            | Retained or strengthened correctness assertion                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `discard-shared-before-init`     | Real admission independently calls `begin()` instead of sharing one initializer.                           | Exactly one begin per admitted view; after fork discard, only `load 2` and `continued 2`, never discarded `load 1`.                                                                                            |
| `discard-shared-continuation`    | Real second await waits for that attempt's first result; initial logs are `[2, 3, 3]`, not `[2, 3, 3, 4]`. | Explicit per-site settlement; exact intermediate logs `[2, 3, 3, 4]` then `[2, 3, 3, 4, 5]`; empty DOM until completion; late discarded result starts no third await and cannot change output.                 |
| `discard-unrelated-owner`        | Real `load 10` starts before creator discard; unrelated fork independently starts another `load 0`.        | Site/input/occurrence requests distinguish both zero-input attempts. Real output must be `0 10 0`, never marker `99`; both discarded attempts' late first results must start no further work or change output. |
| `failure-superseded`             | The fork's valid input-2 replacement initializer logs its own `continued 2`.                               | Exactly one continuation for that replacement; no retry of failed `load 1`; no stale error or request on commit.                                                                                               |
| `shared-script-error-fork-owner` | Real commit writes input 2, legitimately starting F's input-2 replacement.                                 | Original real output stays healthy; exact `continued 2`, `load 2` sequence; occurrence-labelled late replacement is resolved after discard and must neither continue nor affect real output.                   |
| `shared-script-error-other-fork` | G starts `load 12` before F fails. Once G commits input 2, F can start a genuine input-2 replacement.      | Stable prefix logs `created` exactly once; neither fork renders before commit; no failed-input-1 retry; no work when the discarded replacement is resolved late.                                               |

The later single failure exposed only the final row's genuine replacement `load 2` after G commits. Its expected log was changed only after observing that result, and a labelled late-settlement assertion was added alongside it.

The dependent `discard-shared-chain` needed only the earlier request-control hardening; its original exact numeric log and DOM assertions pass. In total, 15 fixture source files in 7 directories changed. The other 9 recovered fixtures remain unchanged, notably cached-error/no-retry, pending-commit rejection, repeated unhandled-fork commit, settled-result cleanup, and real-failure delivery.

No runtime counterexample remains in this recovered selection. This is focused verification, not a claim that the subsequent full suite passes. Main owns the full-suite rerun and runtime/compiler changes. At this stage the recovery agent had changed only recovered fixtures and verification notes; the assigned existing-fixture work below was authorized separately.

## Existing async-family adaptations after the broader sweep

Main's completed default async-only sweep failed with **22 failed, 841 passed, 2305 skipped**, exit `1`, plus 3 reported errors (`/tmp/svelte-script-replay-default-async.log`, started 23:02:17). This agent was assigned only `async-resume-*`, `async-record-initialization-*`, and `async-fork-script-await-adopted` / `-each-item`; other failures remained with main/compiler/kernel owners.

Classification preceded edits. Real runtime failures were reported immediately rather than changing their output expectations:

- `async-resume-script-superseded-late` initially revealed `<span></span>` while the unrelated `y` request was still pending. After the first runtime correction it retained pending correctly but failed to reveal `<p>1</p><span>1</span>` when `y` completed. Both original DOM requirements remain intact.
- `async-record-initialization-committed-view` and the **unchanged** `async-record-initialization-concurrent` stayed pending after their required loaders completed. Original final values and visibility requirements remain intact; the runtime owner fixed these paths.
- `async-resume-script-buffered-merge` initially looked stranded. An added request-count check revealed `[1, 2, 2]`: hide/reveal admitted another unfinished attempt with input 2. Explicitly settling that separate request—not changing final output—resolved the apparent stall.

The final changes preserve the following contracts:

| Fixture/family                                                                            | Replay-specific adaptation                                                                                                                                                                              | Strict semantic coverage retained or strengthened                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fork-script-await-adopted` and `-each-item`                                              | Name raw-await executions by stable request index; settle F and R separately instead of resolving one shared initializer.                                                                               | F cannot reveal before commit; R displays original value 0; unrelated count update starts no new request; commit preserves DOM identity; discarded raw await resolved late cannot continue or publish.                                                                                                                                                                         |
| `record-initialization-committed-view`                                                    | Shared first user promise wakes both view-local attempts, yielding exact load log `[0, 1]` before B commits rather than after.                                                                          | Uncommitted count 1 remains invisible; final `<b>1</b><p>one 1</p><i>1</i>` unchanged.                                                                                                                                                                                                                                                                                         |
| `record-initialization-fork`                                                              | Resolve each view's separate `begin()`; verify private F continuation `1 1` and real continuation `0 0`.                                                                                                | Explicit approved policy: R's first publication establishes ordinary snapshot 0, so real output is `0 0` and F commit changes reactive value to 1 while preserving snapshot 0 (`1 0`). The old `0 1` real output depended on F-owned shared initialization, contrary to view-local replay. Exact `abort 1` / `abort 0` timing remains asserted; DOM identity now also checked. |
| `record-initialization-private`                                                           | B starts `second 1` only after its own first checkpoint; its independent completion logs `continued with 1 1`.                                                                                          | A can still finish private `0 0 0` before B, without an illegitimate abort; B's final `1 1 1` unchanged.                                                                                                                                                                                                                                                                       |
| `resume-script`                                                                           | A ready real attempt can publish before the fork; both continuations log their own input.                                                                                                               | Real remains `0 0`, fork remains invisible until commit, final reactive output `1 10` unchanged; both completion orders still tested.                                                                                                                                                                                                                                          |
| `resume-script-later-batch`                                                               | Resolve B's first checkpoint before requesting its second result. In the A-first case, keep B's first result pending until A finishes so the test does not accidentally supersede A before checking it. | A-first output `1 1`, eventual `2 2`, B-first output `2 2`, and no late overwrite remain unchanged. Each completed attempt logs coherent values.                                                                                                                                                                                                                               |
| `resume-script-aborted-later-batch`, `resume-script-later-batch-aborted`, `-aborted-late` | B advances through its own first checkpoint before second work; continuation is coherent `2 2`, not the old shared-environment `1 2`.                                                                   | Prompt abort log remains required where recorded; final `2 2` unchanged; obsolete result/late rejection cannot damage output; B completes without waiting for the user's delayed aborted rejection.                                                                                                                                                                            |
| `resume-script-buffered-merge`                                                            | Input/occurrence labels distinguish the original input-2 result from the fresh reveal attempt; exactly one extra `load(2)` is explicitly resolved.                                                      | Final `<p>5</p><p>1</p><span>2</span>` unchanged. `settled()` completes while original `load(1)` is unresolved; resolving it afterward cannot overwrite output or start more work. Exact total loads `[1, 2, 2]`, never a retry of input 1.                                                                                                                                    |
| `resume-script-superseded-late`                                                           | The later initializer's `continued with 1` occurs when its own result arrives, before its batch commits.                                                                                                | Original pending visibility, eventual `<p>1</p><span>1</span>`, and late-old-result isolation all retained.                                                                                                                                                                                                                                                                    |

No skip, opt-in exception, broad assertion removal, or expected-unhandled-error exemption was added. Request and continuation counts remain exact for each defined scenario.

Verification command:

```sh
pnpm test runtime-runes -t '^async-(resume-|record-initialization-|fork-script-await-adopted)'
```

| Run                                 | Result                                            | Evidence                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial adapted family run          | FAIL, exit `1`: 5 failed, 24 passed, 3139 skipped | `/tmp/svelte-script-replay-owned-adapted.log`, started 23:07:31; exposed the pending-reveal failures rather than weakening them                                                                                                                                                |
| Three remaining diagnostic probes   | FAIL, exit `1`: 3 failed                          | `pnpm test runtime-runes -t '^async-(resume-script-(buffered-merge\|superseded-late)\|record-initialization-private) '`; `/tmp/svelte-script-replay-owned-probes.log`, started 23:08:36; established fresh load(2), independent private continuation, and pending reveal stall |
| Final family run with runtime fixes | **PASS, exit `0`: 29 passed**, 3139 skipped       | `/tmp/svelte-script-replay-owned-final.log`, started 23:09:37; duration 4.17s                                                                                                                                                                                                  |

The 29 passing tests include unchanged existing anchors as well as adapted fixtures. Full-suite success still belongs to main's subsequent verification, not this focused result.

Final static verification for this agent's work: Prettier check passed for this document and all 19 modified fixture configs; `node --check` passed for all 19 configs; scoped `git diff --check` passed for the 19 fixture directories. All exited `0`. Test `.svelte` files remain excluded from Prettier by repository policy and were exercised by the focused runtime runs instead.
