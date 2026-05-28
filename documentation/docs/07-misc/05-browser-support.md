---
title: Browser support
---

The table below shows the minimum browser versions Svelte's runtime and compiled output are expected to work in.

@include .generated/browser-support.md

These numbers describe what Svelte's output _requires_ in order to run — they're derived from the APIs the code uses, not from a list of browsers the team commits to testing.

## What is covered

- **Svelte's runtime.** Everything you import from `svelte` or its subpackages, in the form your bundler ships to the browser.
- **Compiler output.** The JavaScript the Svelte compiler emits from your `.svelte` files, including the DOM operations, bindings and transitions used in your components.

## What is not covered

- **Your own code** inside `<script>` blocks or `.svelte.js` files. If you use newer browser APIs the table will not reflect them — configure your own [browserslist](https://github.com/browserslist/browserslist) and polyfills accordingly.
- **SvelteKit**, adapters and build tooling. See the [SvelteKit docs](https://svelte.dev/docs/kit) for the browser support story there.
- **Internet Explorer 11.** Svelte's runtime relies on `Proxy`, which cannot be polyfilled. IE11 is not supported and there is no path to making it work.

## Per-feature browser requirements

Some Svelte features rely on browser APIs that exceed the floor above. The runtime still loads on older browsers — modern bundlers tree-shake the affected code when the feature is unused — but if you use one of these features, you need the higher minimum version listed here.

@include .generated/browser-support-features.md

## How this page stays accurate

The minimum versions can only move forward in a minor or major release, and any change is recorded in the [changelog](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md). Every Svelte feature — bindings, runes, directives, and module exports — is checked against the [web-features](https://www.npmjs.com/package/web-features) Baseline dataset on every pull request, and the build fails if a change requires newer browsers than the page reflects.
