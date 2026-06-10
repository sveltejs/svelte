# Browser benchmarks

Performance benchmarks that exercise the Svelte runtime inside **real headless
Chromium** via [Playwright](https://playwright.dev), driven by
[Vitest's `bench()` API](https://vitest.dev/api/#bench).

These complement the JSDOM benchmarks in [`../benchmarks/`](../benchmarks).
JSDOM is a pure-JS DOM implementation that doesn't model layout, paint, or the
optimisations real engines apply to operations like `Range.deleteContents()`
or `document.createElement()` — so JSDOM benchmarks can disagree with real
browsers, sometimes by an order of magnitude or more.

When a perf change touches code paths where the actual browser
implementation matters (DOM operations, attribute writes, layout-triggering
properties, transitions, etc.) — **measure here**, not in JSDOM.

## Running

```sh
pnpm bench:browser                 # all benches
pnpm bench:browser swap            # filter by name fragment
```

First run downloads Chromium (~250 MB, cached in `~/Library/Caches/ms-playwright/`).
If Playwright complains the executable is missing:

```sh
cd packages/svelte && pnpm exec playwright install chromium
```

## Multiple browsers

Browser mode is configured via Vitest 4's `browser.instances` array in
[`vitest.config.js`](./vitest.config.js). It runs in Chromium by default; add
more engines to compare the same benches across them:

```js
instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }];
```

Each instance needs its Playwright browser installed
(`pnpm exec playwright install firefox webkit`). Vitest prefixes every result
line with the instance name (e.g. `|chromium|`), so cross-engine numbers stay
distinguishable in one run.

## Writing a benchmark

Each `.bench.js` file uses Vitest's `bench()` API. The function body is the
hot loop; `setup` / `teardown` run before/after each measurement window.
Statistical sampling (warmup, iteration count, sample collection) is
handled by tinybench under the hood — you describe _what_ to measure, not
_how_.

```js
// my_thing.bench.js
import { bench, describe } from 'vitest';
import { mount, unmount } from 'svelte';
import * as $ from 'svelte/internal/client';

describe('my-thing', () => {
  let target, instance, state;

  bench(
    'short description of what we measure',
    () => {
      // The hot loop. Keep this minimal — anything done here is part of
      // the measurement. `setup` runs once before the bench, `teardown`
      // once after.
      $.flush(() => $.set(state /* … */));
    },
    {
      setup() {
        target = document.createElement('div');
        document.body.appendChild(target);
        state = $.state(/* initial */);
        instance = mount(MyComponent, { target, props: { state } });
      },
      teardown() {
        unmount(instance);
        target.remove();
      }
    }
  );
});
```

Output:

```
name                       hz       min     max     mean    p99    rme       samples
short description ...   17,770.00   0.000   2.6     0.056   0.2    ±2.8%     8,885
```

- **hz** — operations per second (higher = faster)
- **mean / min / max / p99** — per-iteration time in ms
- **rme** — relative margin of error; <5 % is generally trustworthy
- **samples** — how many iterations were measured (tinybench chooses
  adaptively)

## Comparing before/after

There's no built-in compare command yet. The workflow is:

1. Note current branch.
2. Run `pnpm bench:browser` on the baseline branch (e.g. `main`) — copy the
   `hz` numbers.
3. Switch to your branch with the change. Run `pnpm bench:browser` again.
4. Compare `hz` values; higher is faster. Watch the `rme` to make sure the
   numbers are statistically meaningful (under ~5 %).

A `bench:browser:compare` script that automates this is a reasonable follow-up.

## When to add a browser benchmark

- The code path touches real DOM operations whose perf differs between JSDOM
  and real engines (creation, removal, attribute writes, style/class
  mutations, layout reads, transitions).
- The change is meant to reduce browser-side cost (paint, composite, layout
  thrash) that JSDOM can't model.
- You want to validate a Chromium-specific optimisation claim (e.g. fast
  paths in Blink) that JSDOM benchmarks will not surface.

For reactivity-graph perf (signal propagation, derived recomputation, batch
scheduling) the existing JSDOM benchmarks in [`../benchmarks/`](../benchmarks)
are still the right place — they exercise pure JS code where JSDOM is fine.
