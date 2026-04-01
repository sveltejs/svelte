---
name: performance-investigation
description: Investigate performance regressions and find opportunities for optimization
---

## Quick start

1. Start from a branch you want to measure (for example `foo`).
2. Run:

```sh
pnpm bench:compare main foo
```

If you pass one branch, `bench:compare` automatically compares it to `main`.

## Where outputs go

- Summary report: `benchmarking/compare/.results/report.txt`
- Raw benchmark numbers:
  - `benchmarking/compare/.results/main.json`
  - `benchmarking/compare/.results/<your-branch>.json`
- CPU profiles (per benchmark, per branch):
  - `benchmarking/compare/.profiles/main/*.cpuprofile`
  - `benchmarking/compare/.profiles/main/*.md`
  - `benchmarking/compare/.profiles/<your-branch>/*.cpuprofile`
  - `benchmarking/compare/.profiles/<your-branch>/*.md`

The `.md` files are generated summaries of the CPU profile and are usually the fastest way to inspect hotspots.

## Suggested investigation flow

1. Open `benchmarking/compare/.results/report.txt` and identify largest regressions first.
2. For each high-delta benchmark, compare:
   - `benchmarking/compare/.profiles/main/<benchmark>.md`
   - `benchmarking/compare/.profiles/<branch>/<benchmark>.md`
3. Look for changes in self/inclusive hotspot share in runtime internals (`runtime.js`, `reactivity/batch.js`, `reactivity/deriveds.js`, `reactivity/sources.js`).
4. Make one optimization change at a time, then re-run targeted benches before re-running full compare.

## Fast benchmark loops

Run only selected reactivity benchmarks by substring:

```sh
pnpm bench kairo_mux kairo_deep kairo_broad kairo_triangle
pnpm bench repeated_deps sbench_create_signals mol_owned
```

## Tests to run after perf changes

Runtime reactivity regressions are most likely in runes runtime tests:

```sh
pnpm test runtime-runes
```

## Helpful script

For quick cpuprofile hotspot deltas between two branches:

```sh
node benchmarking/compare/profile-diff.mjs kairo_mux_owned main foo
```

This prints top function sample-share deltas for the selected benchmark.

## Practical gotchas

- `bench:compare` checks out branches while running. Avoid uncommitted changes (or stash them) so branch switching is safe.
- Each `bench:compare` run rewrites `benchmarking/compare/.results` and `benchmarking/compare/.profiles`.
