# Per-batch script replay: recovered regression baseline

## Scope and provenance

Recorded on 2026-11-16, before replay implementation changes.

- Branch: `batch-views-script-replay-plan`.
- Tested HEAD: `0f5e2f8988c2bfa3eeae0a32c3b13496e61bba7e`. Its only difference from the plan's runtime base, `06910d5b2bd547e2bba7b0ffe5669dbf5f7b0a48`, is `batch-script-replay-plan.md` (commits `ab1f838a54` and `0f5e2f8988`).
- The initial worktree was clean. After the baseline commands, `git diff --exit-code -- packages/svelte/src` exited `0`; no runtime/compiler changes were present during these runs.
- Read `AGENTS.md`, `CONTRIBUTING.md`, and the complete replay plan. Inspected both historical fixture diffs before extraction.
- Recovered exactly the 12 fixture directories added by `dbdd1dfafd27f4b5a257830c2b4f75af27e050f3` and the 3 added by `2173053b0977bc3713139d9792e40544b8ff0ad5`: 43 source files, all taken from the latest `2173053b09` tree. This includes its repeated-commit assertion in `async-fork-shared-script-error-unhandled-commit/_config.js`.
- The archived `async-fork-failure-commit-pending` fixture still existed at `/tmp/svelte-pending-fork-6AJRAZ/async-fork-failure-commit-pending`. Copied only its 3 source files, unchanged. No reconstruction was necessary. It remains an ordinary, unskipped diagnostic, with no expected-error suppression.
- No historical runtime files, generated `_output` files, or other fixtures were extracted; no cherry-picks. The settled-result fixture retains its original readonly `first_batch` import for cleanup assertions; no new runtime import was introduced.

## Commands and observed results

These are baseline results, not evidence that replay works. Every successful command executed a positive number of tests. Skips include filtered-out samples and empty shards, not a skip added to any recovered fixture. All commands completed normally; no timeout, hung session, or forced termination occurred.

| ID  | Exact command                                                                                                                             | Status / exit | Executed tests      | Other output                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------- | -------------------------------- |
| A   | `FILTER=async-update-during-first-render pnpm test runtime-runes`                                                                         | PASS / `0`    | 1 passed            | 4 skipped                        |
| B   | `FILTER=async-merge-abort-chain pnpm test runtime-runes`                                                                                  | PASS / `0`    | 1 passed            | 4 skipped                        |
| C   | `FILTER=async-resume-recheck pnpm test runtime-runes`                                                                                     | PASS / `0`    | 1 passed            | 4 skipped                        |
| D   | `FILTER=async-pending-boundary-committed-run-resolves-last pnpm test runtime-runes`                                                       | PASS / `0`    | 2 passed            | 4 skipped; DOM and hydration     |
| E   | `pnpm test runtime-runes -t '^async-fork-(discard-(shared\|settled-result\|no-restart\|unrelated-owner)\|shared-script-error\|failure-)'` | FAIL / `1`    | 14 failed, 3 passed | 3135 skipped; 3152 total         |
| F   | `pnpm test runtime-runes -t '^async-(resume-\|record-initialization-\|update-during-first-render\|merge-abort\|abort-signal-)'`           | PASS / `0`    | 50 passed           | 3102 skipped; 3152 total         |
| G   | `FILTER=async-commit-discards-earlier-forks pnpm test runtime-runes`                                                                      | PASS / `0`    | 1 passed            | 4 skipped                        |
| H   | `pnpm test snapshot -t '^async-(in-derived\|const\|top-level-group-sync-run\|top-level-inspect-server\|if-\|each-)'`                      | PASS / `0`    | 9 passed            | 25 skipped; no snapshots updated |

Commands A–F and H reproduce the plan's focused selections. G covers the recovered cleanup fixture that E does not select. In Markdown tables, escaped pipes display as literal regex alternatives; the commands actually used ordinary `|` characters inside their single-quoted expressions.

E's three passing tests are the recovered `async-fork-discard-no-restart` (DOM) and the pre-existing `async-fork-failure-escapes` (DOM and hydration). The recovery therefore adds **2 passing and 14 failing DOM diagnostics** on this runtime when G is included. This does not count the pre-existing tests as recovered coverage.

The implementation-only `NO_COMPILE_CACHE=true pnpm test runtime-runes -t '^async-script-replay-'` command was not run: there were no replay fixtures/lowering changes yet. No broad suite or full suite was run for fixture recovery.

## Individual recovered results

Paths below are relative to `packages/svelte/tests/runtime-runes/samples/`. All recovered fixtures use `mode: ['client']`. “Failure” describes the first reported failure, not an exhaustive diagnosis of later assertions.

| Fixture                                           | Origin                              | Baseline | Meaningful failure / observation                                                                                          |
| ------------------------------------------------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `async-commit-discards-earlier-forks`             | `dbdd1dfafd`                        | PASS     | Later pending real batch rebases and completes despite earlier fork discards.                                             |
| `async-fork-discard-no-restart`                   | `dbdd1dfafd`                        | PASS     | No new work after discard; an unresolved old request does not block the real result.                                      |
| `async-fork-discard-settled-result`               | `dbdd1dfafd`                        | FAIL     | `_config.js:31`: discarded `batch.next` is another `Batch`, expected `null`. Later cleanup/result checks are not reached. |
| `async-fork-discard-shared-before-init`           | `dbdd1dfafd`                        | FAIL     | `_config.js:33`: raw-await continuation starts `load 1`, expected `load 2`; work uses the discarded fork's input.         |
| `async-fork-discard-shared-chain`                 | `dbdd1dfafd`                        | FAIL     | `TypeError: Cannot convert a Symbol value to a number`; dependent async work receives an uninitialized value.             |
| `async-fork-discard-shared-continuation`          | `dbdd1dfafd`                        | FAIL     | `_config.js:23`: empty output, expected `<p>3 4 5</p>`.                                                                   |
| `async-fork-shared-script-error-real-owner`       | `dbdd1dfafd`                        | FAIL     | `_config.js:22`: `<p>failed</p>`, expected `<p>pending</p>` after speculative failure.                                    |
| `async-fork-shared-script-error-fork-owner`       | `dbdd1dfafd`                        | FAIL     | `_config.js:31`: `<p></p>`, expected healthy real result `<p>2</p>`.                                                      |
| `async-fork-shared-script-error-real-failure`     | `dbdd1dfafd`                        | FAIL     | `_config.js:25`: `<p></p>`, expected real boundary `<p>failed</p>`.                                                       |
| `async-fork-shared-script-error-unhandled`        | `dbdd1dfafd`                        | FAIL     | Unexpected unhandled `Error: fork 1 failed` after rejecting the speculative request.                                      |
| `async-fork-shared-script-error-unhandled-commit` | `dbdd1dfafd`, extended `2173053b09` | FAIL     | Unexpected unhandled `Error: fork failed`; repeated-commit assertion is retained but not established by this failing run. |
| `async-fork-shared-script-error-other-fork`       | `dbdd1dfafd`                        | FAIL     | `_config.js:35`: no `load 12` after F fails, expected G's dependent continuation to progress.                             |
| `async-fork-failure-commit-cached`                | `2173053b09`                        | FAIL     | `_config.js:31`: `<p></p>`, expected real success `<p>0</p>`; cached-error commit/no-retry assertions are not reached.    |
| `async-fork-failure-superseded`                   | `2173053b09`                        | FAIL     | `_config.js:33`: `<p></p>`, expected real success `<p>2</p>`; successful-replacement commit assertions are not reached.   |
| `async-fork-discard-unrelated-owner`              | `2173053b09`                        | FAIL     | `_config.js:36`: `<i>0</i><b>0</b><p>pending</p>`, expected `<i>0</i><b>0</b><p>0 10 0</p>`.                              |
| `async-fork-failure-commit-pending`               | Local archive                       | FAIL     | Unexpected unhandled `Error: pending fork failed`. Commit was requested while the loader was pending.                     |

The shared runtime harness rejects unexpected unhandled rejections (`runtime-legacy/shared.ts`, `run_test_variant`, final cleanup). The pending-commit fixture also checks original error identity through its catch log, empty output, and absence of loader retries/success logs. Its intended contract is: rejection after commit has begun must reject that commit waiter with the original error, without publishing successful child output or leaking an unhandled rejection. The replay plan records that **both historical handoff implementations already failed this diagnostic**. It is not a regression introduced by replay, and historical suite totals did not prove this missing contract.

## Optimization assumptions versus correctness obligations

All recovered assertions are deliberately preserved for the baseline. Do not label a future failure “expected under replay” without identifying which assertion changed and retaining a semantic check.

| Historical assumption                                                          | Fixtures most directly affected                                                                        | Replay treatment                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One shared script starts once; a second view does not start its own raw await. | `discard-shared-before-init`, `shared-script-error-other-fork`                                         | Duplicate speculative `begin`/creation logs may become valid for independent attempts. Installation and lifetime of the stable template still must be exactly once.                                                    |
| One continuation is transferred, and only the chosen owner continues.          | `discard-shared-chain`, `discard-shared-continuation`, `discard-unrelated-owner`, owner/error fixtures | Extra speculative request/continuation logs or different progress order may be valid. Correct view-local locals, final output, pending-boundary behavior, and eventual progress remain mandatory.                      |
| G's ready result must wait for F's failure before starting the next stage.     | `shared-script-error-other-fork`                                                                       | Independent G progress may happen earlier. Neither fork may render before commit; F's failure cannot corrupt G.                                                                                                        |
| Request identity is determined by a numeric value or queue position.           | Map-backed fixtures and `discard-shared-*` positional queues                                           | Duplicate same-input requests can overwrite map entries or make `shift second` resolve the wrong attempt. Introduce labelled attempt/site request queues when updating tests, rather than weakening output assertions. |
| Exactly one `continued ...` log or a fixed `load 2` replacement count.         | `failure-commit-cached`, `failure-superseded`, shared-script error fixtures                            | Initialization-side-effect counts may change before publication; script initialization must not restart on ordinary later updates after publication.                                                                   |
| The concrete discarded-batch data structure is fully cleared.                  | `discard-settled-result`                                                                               | Exact internal fields are representation-specific; prompt release of references, terminal discard, and no revival by an already-settled callback are not optional optimizations.                                       |

Do **not** relax cached failure identity/no retry on commit (including repeated commit), valid-success-only error replacement, no new work in a discarded attempt, no sentinel passed to user code, no late overwrite or cross-view binding mixtures, prompt abort and pending-count cleanup, stable DOM/state/effect identity, real/fork isolation, or correct error visibility. In particular, `discard-shared-before-init` loading the discarded input is not merely an increased speculative request count.

## Readonly study of small historical fixes

These are candidate invariants to reimplement independently where the kernel needs them, not recommendations to import the old handoff runtime. The historical changes were inspected readonly; no runtime code was changed during recovery.

1. **Mutation-safe batch traversal** (`dbdd1dfafd`, `batch.js` and `runtime.js`). `get_batches()` snapshots the active list before callbacks can discard/unlink batches. The commit-rebase loop and `abort_replaced` use it with linked checks; `abort_all` also snapshots before invoking abort listeners. Current `update_reaction` really calls `abort_replaced`, so this is a live cancellation path, not a dead helper. Study this together with terminal cleanup: clearing `prev`/`next` in `discard` can truncate existing linked-list traversals. The cleanup fixture passes on the baseline, which does not yet clear those links; that pass does not justify adding cleanup without a traversal fix.
2. **Dependency-preserving suspension** (`dbdd1dfafd`, `runtime.js`, `error-handling.js`, `reactivity/deriveds.js`). Track an async read before throwing `UNINITIALIZED`; keep it out of application error boundaries; mark suspended reactions `REACTION_RAN`; suppress it in both synchronous and promise-rejection producer paths; let first-value readers wait rather than fulfill with `undefined`. This is a coordinated small protocol, not a safe one-line catch. The shared-chain Symbol-to-number failure is a direct motivating case. Preserve the passing `async-resume-recheck` anchor while studying it; a suspension that drops dependency/run records can fail to wake later.
3. **Terminal discard and settled-callback cleanup** (`dbdd1dfafd`, `batch.js`, `reactivity/deriveds.js`, `reactivity/async.js`). Set terminal/idempotent discard state before callbacks, remove queued merge requests, clear captures/scheduling structures, and ignore already-settled callbacks or context restores for discarded work. The baseline settled-result failure identifies retained links before it can prove the later race behavior. Do not equate “unlinked” with “discarded”: merge also unlinks batches, whose work can remain live under a canonical target.
4. **Keep result identity, not sticky error callbacks** (`2173053b09`, `batch.js` and `reactivity/deriveds.js`). The reduced version replaces captured-error commit callbacks with source-to-effect error records, rechecking the current batch-local result on commit. Its comment explicitly avoids permanently skipping the speculative boundary, because that prevents valid successful revalidation. Preserve this principle in attempt/run-aware storage; do not transplant its first-owner arbitration.
5. **Failed commit must remain failed** (`dbdd1dfafd` / `2173053b09`, public `fork().commit`). Check a cached fatal error before treating an unlinked batch as a successful obsolete commit, and do not set the successful committed state before error delivery. This explains why the repeated-commit assertion matters. It is not a complete fix for errors that arrive after commit starts: the pending-commit diagnostic remains an explicit uncovered path.

Historical first-value owner selection, `AsyncContext.pending` handoff, and shared promise arbitration are not independent fixes to preserve. Also retain the plan's passing committed-pending ordering anchor; the baseline offers no evidence for removing batch reordering.

## Recovery verification

- Automated provenance comparison: PASS, exit `0`. All 43 recovered Git source files in 15 directories are byte-identical to `2173053b09`; all 3 archived source files are byte-identical to the archive. The pending diagnostic has no skip configuration.
- No assertions were relaxed and no expected-error configuration was added. Historical fixture formatting was preserved, not normalized.
- `pnpm exec prettier --write batch-script-replay-baseline.md`: exit `0`; formats only this new document.
- `pnpm exec prettier --check batch-script-replay-baseline.md`: PASS, exit `0`, `All matched files use Prettier code style!`.
- `git diff --check`: PASS, exit `0`. The fixture files are new/untracked, so their provenance comparison and executed tests, not this diff command, establish recovery correctness.
- An explicit `pnpm exec eslint` invocation listing all 16 recovered `_config.js` paths exited `0` with **16 ignored-file warnings**. This is not a lint pass: `eslint.config.js` intentionally excludes `**/tests`. The ignore policy was not overridden or changed.
- Runtime execution evidence is A–H above. No full-suite result or successful replay implementation is claimed.
