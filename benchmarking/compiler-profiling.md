# Compiler CPU profiling

Run the full test suite with V8 CPU profiling enabled in every Vitest worker:

```sh
pnpm profile:compiler
```

Arguments are passed to `pnpm test`, so a smaller smoke run can target a suite:

```sh
pnpm profile:compiler snapshot
```

Each run is stored under `benchmarking/.profiles/compiler-tests/<timestamp>`. Set
`SVELTE_PROFILE_NAME` to give a run a stable name; existing runs are never overwritten.
`benchmarking/.profiles/compiler-tests/latest.txt` contains the latest successful run name.

Each run contains:

- `raw/*.cpuprofile`: the original V8 profile from every Vitest worker
- `flamegraph.speedscope.json`: compiler-active stacks merged for use in
  [Speedscope](https://www.speedscope.app/)
- `summary.md`: ranked self/inclusive hotspots and files
- `summary.json`: the same measurements for further analysis
- `manifest.json`: the command, revision, timestamps, and test result

The merged profile includes downstream callees while a compiler source frame is on the stack.
This captures parser, walker, and printer dependencies without including unrelated test runtime.
V8 reports garbage collection outside the originating stack, so the summary reports process-wide
GC separately rather than attributing it to the compiler.

The default sampling interval is 5 ms. It can be changed for shorter, focused runs:

```sh
SVELTE_CPU_PROF_INTERVAL=1000 pnpm profile:compiler snapshot
```

Existing raw profiles can be analyzed again without rerunning tests:

```sh
node benchmarking/analyze-compiler-profile.js benchmarking/.profiles/compiler-tests/<run>
```
