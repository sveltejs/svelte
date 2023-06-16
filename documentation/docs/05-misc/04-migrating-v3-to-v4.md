---
title: Migrating from v3 to v4
---

This migration guide provides an overview of how to migrate from Svelte version 3 to 4. See the linked PRs for more details about each change. Use the migration script to migrate some of these automatically: `npx svelte-migrate svelte-4`

If you're a library author, consider whether to only support Svelte 4 or if it's possible to support Svelte 3 too. Since most of the breaking changes don't affect many people, this may be easily possible. Also remember to update the version range in your `peerDependencies`.

## Minimum version requirements

- Upgrade to Node 16 or higher. Earlier versions are no longer supported. ([#8566](https://github.com/sveltejs/svelte/issues/8566))
- If you are using Vite, the minimum supported vite-plugin-svelte version is now 2.4.1. If you are a SvelteKit user, upgrade to 1.15.9 or newer to ensure compatibility. ([#8516](https://github.com/sveltejs/svelte/issues/8516))
- If you are using webpack, upgrade to webpack 5 or higher. Earlier versions are no longer supported. ([#8515](https://github.com/sveltejs/svelte/issues/8515))
- If you are using TypeScript, upgrade to TypeScript 5 or higher. Lower versions might still work, but no guarantees are made about that. ([#8488](https://github.com/sveltejs/svelte/issues/8488))

## Browser conditions for bundlers

Bundlers must now specify the browser condition when building a frontend bundle for the browser. SvelteKit and Vite will handle this automatically for you. For Rollup or webpack you may need to adjust your config to ensure it matches what is shown in the [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte/#usage) and [`svelte-loader`](https://github.com/sveltejs/svelte-loader#usage) documentation. ([#8516](https://github.com/sveltejs/svelte/issues/8516))

## Removal of CJS related output

Svelte no longer supports the CommonJS (CJS) format for compiler output and has also removed the `svelte/register` hook and the CJS runtime version. If you needed those, consider using a bundler like Vite or the full-stack framework SvelteKit instead. ([#8613](https://github.com/sveltejs/svelte/issues/8613))

## Stricter types for Svelte functions

There are now stricter types for `createEventDispatcher`, `Action`, `ActionReturn`, and `onMount`:

- `createEventDispatcher` now supports specifying that a payload is optional, required, or non-existent, and the call sites are checked accordingly ([#7224](https://github.com/sveltejs/svelte/issues/7224))
- `Action` and `ActionReturn` have a default parameter type of `never` now, which means you need to type the generic if you want to specify that this action receives a parameter. The migration script will migrate this automatically ([#7442](https://github.com/sveltejs/svelte/pull/7442))
- `onMount` now shows a type error if you return a function asynchronously from it, because this is likely a bug in your code where you expect the callback to be called on destroy, which it will only do for synchronously returned functions ([#8136](https://github.com/sveltejs/svelte/issues/8136))

## Custom Elements with Svelte

The creation of custom elements with Svelte has been overhauled and significantly improved. The `tag` option is deprecated in favor of the new `customElement` option. The migration script will adjust your code automatically. The update timing of properties has changed slightly as well. ([#8457](https://github.com/sveltejs/svelte/issues/8457))

## SvelteComponentTyped is deprecated

`SvelteComponentTyped` is deprecated, as `SvelteComponent` now has all its typing capabilities. Replace all instances of `SvelteComponentTyped` with `SvelteComponent`. If you have used `SvelteComponent` as the component instance type previously, you may see a somewhat opaque type error now, which is solved by changing `: typeof SvelteComponent` to `: typeof SvelteComponent<any>` (more info in the linked PR). The migration script will do both automatically for you. ([#8512](https://github.com/sveltejs/svelte/issues/8512))

## Transitions are local by default

Transitions are now local by default to prevent confusion around page navigations. To make them global, add the `|global` modifier. The migration script will do this automatically for you. ([#6686](https://github.com/sveltejs/svelte/issues/6686))

## Default slot bindings

Default slot bindings are no longer exposed to named slots and vice versa. ([#6049](https://github.com/sveltejs/svelte/issues/6049))

## Preprocessors

The order in which preprocessors are applied has changed. Now, preprocessors are executed in order, and within one group, the order is markup, script, style. Each preprocessor must also have a name. ([#8618](https://github.com/sveltejs/svelte/issues/8618))

## Other breaking changes

- the `inert` attribute is now applied to outroing elements to make them invisible to assistive technology and prevent interaction. ([#8627](https://github.com/sveltejs/svelte/issues/8627))
- the runtime now uses `classList.toggle(name, boolean)` which may not work in very old browsers. Consider using a [polyfill](https://github.com/eligrey/classList.js) if you need to support these browsers. ([#8629](https://github.com/sveltejs/svelte/issues/8629))
- people implementing their own stores from scratch using the `StartStopNotifier` interface (which is passed to the create function of `writable` etc) from `svelte/store` now need to pass an update function in addition to the set function. This has no effect on people using stores or creating stores using the existing Svelte stores. ([#6750](https://github.com/sveltejs/svelte/issues/6750))
- `derived` will now throw an error on falsy values instead of stores passed to it. ([#7947](https://github.com/sveltejs/svelte/issues/7947))
