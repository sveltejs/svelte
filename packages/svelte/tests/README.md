# Test repo

This repo tries to migrate as many tests from the currente Svelte project over to test against the new compiler/runtime.

## Differences to the old test suite

- `compiler` options are different currently, a wrapper function in `helpers.js` was added and call sites rerouted to that
- regex in the loader was adjusted, a `$` was added to the `import * as ..` regex (because the new runtime does `import * as $ from ..` for the runtime)
- `vitest.config.js` was altered: `resolve-svelte` plugin also aliases `svelte` (the current runtime import) and `test.dir` was adjusted because the monorepo structure is different (compiler/runtime are separate packages here currently)
- new runtime does not expose things like raf etc, which were used in some tests (runtime for example; for transition/animation tests). These are commented out for now
- when changing an attribute, the JSDOM does not reflect the value immediately anymore because the runtime does update the DOM in after a tick, not synchronously - this results in many tests needing additional `await Promise.resolve()` lines

## Breaking changes

- Order of list insertions has changed: It's now back to front because that's faster
- Slight timing differences mean that things may fire less in some cases (behavior should be unaffected though) - see `component-binding-each-remount-unkeyed` for an example
- It's currently possible to create infinite loops with `$:` invoking each other
- Fallback value is now set on all `undefined` values, not just on the first one
- CSS is no longer minified. Unused styles are instead commented out
- `:global(...)` compound selectors (e.g. `.foo:global(.bar)` or `:global(.foo).bar`) are no longer permitted. These are nonsensical and don't do anything useful in Svelte 4 — better to just get rid of them
- transitions: when one element fades out and a new one (which is on the same element but another instance of it) fades in at the same time, the new one is now below the old one (was above before)
- transitions: now wait one tick before they start playing to align with web animations API

## TODOs

- the new runtime does not expose named exports such as `svelte/store` yet, so can't test those
- event `this` context is not preserved due to event delegation etc. Problem? Or necessary/ok breaking change?
- order of operations should be preserved: first all attribute setters (spread props, static props) in order, then mutation directives (actions, bindings) in order, then style/class directives in order

## Tests that succeeded but need a closer look

- `$$slot` was modified to succeed, see TODOs inside for more info
- `await-component-oncreate` needs to `await Promise.resolve()` because `onMount` runs async, too. Is this ok?
- `component-slot-fallback-2` has one check commented out, because store subscriptions are deduplicated at the runtime level now. Should this be seen as a breaking change? If yes, ok?

## Tests that are not copied over yet

- everything except runtime is missing so far
- animation tests within runtime folder were not copied over
- `beforeUpdate`/`afterUpdate` tests
