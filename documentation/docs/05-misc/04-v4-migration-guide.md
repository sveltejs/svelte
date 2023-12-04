---
title: Svelte 4 migration guide
---

This migration guide provides an overview of how to migrate from Svelte version 3 to 4. See the linked PRs for more details about each change. Use the migration script to migrate some of these automatically: `npx svelte-migrate@latest svelte-4`

If you're a library author, consider whether to only support Svelte 4 or if it's possible to support Svelte 3 too. Since most of the breaking changes don't affect many people, this may be easily possible. Also remember to update the version range in your `peerDependencies`.

## Minimum version requirements

- Upgrade to Node 16 or higher. Earlier versions are no longer supported. ([#8566](https://github.com/sveltejs/svelte/issues/8566))
- If you are using SvelteKit, upgrade to 1.20.4 or newer ([sveltejs/kit#10172](https://github.com/sveltejs/kit/pull/10172))
- If you are using Vite without SvelteKit, upgrade to `vite-plugin-svelte` 2.4.1 or newer ([#8516](https://github.com/sveltejs/svelte/issues/8516))
- If you are using webpack, upgrade to webpack 5 or higher and `svelte-loader` 3.1.8 or higher. Earlier versions are no longer supported. ([#8515](https://github.com/sveltejs/svelte/issues/8515), [198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- If you are using Rollup, upgrade to `rollup-plugin-svelte` 7.1.5 or higher ([198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- If you are using TypeScript, upgrade to TypeScript 5 or higher. Lower versions might still work, but no guarantees are made about that. ([#8488](https://github.com/sveltejs/svelte/issues/8488))

## Browser conditions for bundlers

Bundlers must now specify the `browser` condition when building a frontend bundle for the browser. SvelteKit and Vite will handle this automatically for you. If you're using any others, you may observe lifecycle callbacks such as `onMount` not get called and you'll need to update the module resolution configuration.

- For Rollup this is done within the `@rollup/plugin-node-resolve` plugin by setting `browser: true` in its options. See the [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte/#usage) documentation for more details
- For wepback this is done by adding `"browser"` to the `conditionNames` array. You may also have to update your `alias` config, if you have set it. See the [`svelte-loader`](https://github.com/sveltejs/svelte-loader#usage) documentation for more details

([#8516](https://github.com/sveltejs/svelte/issues/8516))

## Removal of CJS related output

Svelte no longer supports the CommonJS (CJS) format for compiler output and has also removed the `svelte/register` hook and the CJS runtime version. If you need to stay on the CJS output format, consider using a bundler to convert Svelte's ESM output to CJS in a post-build step. ([#8613](https://github.com/sveltejs/svelte/issues/8613))

## Stricter types for Svelte functions

There are now stricter types for `createEventDispatcher`, `Action`, `ActionReturn`, and `onMount`:

- `createEventDispatcher` now supports specifying that a payload is optional, required, or non-existent, and the call sites are checked accordingly ([#7224](https://github.com/sveltejs/svelte/issues/7224))

```ts
// @errors: 2554 2345
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
	optional: number | null;
	required: string;
	noArgument: null;
}>();

// Svelte version 3:
dispatch('optional');
dispatch('required'); // I can still omit the detail argument
dispatch('noArgument', 'surprise'); // I can still add a detail argument

// Svelte version 4 using TypeScript strict mode:
dispatch('optional');
dispatch('required'); // error, missing argument
dispatch('noArgument', 'surprise'); // error, cannot pass an argument
```

- `Action` and `ActionReturn` have a default parameter type of `undefined` now, which means you need to type the generic if you want to specify that this action receives a parameter. The migration script will migrate this automatically ([#7442](https://github.com/sveltejs/svelte/pull/7442))

```diff
-const action: Action = (node, params) => { .. } // this is now an error if you use params in any way
+const action: Action<HTMLElement, string> = (node, params) => { .. } // params is of type string
```

- `onMount` now shows a type error if you return a function asynchronously from it, because this is likely a bug in your code where you expect the callback to be called on destroy, which it will only do for synchronously returned functions ([#8136](https://github.com/sveltejs/svelte/issues/8136))

```diff
// Example where this change reveals an actual bug
onMount(
- // someCleanup() not called because function handed to onMount is async
- async () => {
-   const something = await foo();
+ // someCleanup() is called because function handed to onMount is sync
+ () => {
+  foo().then(something =>  ..
   // ..
   return () => someCleanup();
}
);
```

## Custom Elements with Svelte

The creation of custom elements with Svelte has been overhauled and significantly improved. The `tag` option is deprecated in favor of the new `customElement` option:

```diff
-<svelte:options tag="my-component" />
+<svelte:options customElement="my-component" />
```

This change was made to allow [more configurability](custom-elements-api#component-options) for advanced use cases. The migration script will adjust your code automatically. The update timing of properties has changed slightly as well. ([#8457](https://github.com/sveltejs/svelte/issues/8457))

## SvelteComponentTyped is deprecated

`SvelteComponentTyped` is deprecated, as `SvelteComponent` now has all its typing capabilities. Replace all instances of `SvelteComponentTyped` with `SvelteComponent`.

```diff
- import { SvelteComponentTyped } from 'svelte';
+ import { SvelteComponent } from 'svelte';

- export class Foo extends SvelteComponentTyped<{ aProp: string }> {}
+ export class Foo extends SvelteComponent<{ aProp: string }> {}
```

If you have used `SvelteComponent` as the component instance type previously, you may see a somewhat opaque type error now, which is solved by changing `: typeof SvelteComponent` to `: typeof SvelteComponent<any>`.

```diff
<script>
  import ComponentA from './ComponentA.svelte';
  import ComponentB from './ComponentB.svelte';
  import { SvelteComponent } from 'svelte';

-  let component: typeof SvelteComponent;
+  let component: typeof SvelteComponent<any>;

  function choseRandomly() {
    component = Math.random() > 0.5 ? ComponentA : ComponentB;
  }
</script>

<button on:click={choseRandomly}>random</button>
<svelte:element this={component} />
```

The migration script will do both automatically for you. ([#8512](https://github.com/sveltejs/svelte/issues/8512))

## Transitions are local by default

Transitions are now local by default to prevent confusion around page navigations. "local" means that a transition will not play if it's within a nested control flow block (`each/if/await/key`) and not the direct parent block but a block above it is created/destroyed. In the following example, the `slide` intro animation will only play when `success` goes from `false` to `true`, but it will _not_ play when `show` goes from `false` to `true`:

```svelte
{#if show}
	...
	{#if success}
		<p in:slide>Success</p>
	{/each}
{/if}
```

To make transitions global, add the `|global` modifier - then they will play when _any_ control flow block above is created/destroyed. The migration script will do this automatically for you. ([#6686](https://github.com/sveltejs/svelte/issues/6686))

## Default slot bindings

Default slot bindings are no longer exposed to named slots and vice versa:

```svelte
<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<p>
		count in default slot - is available: {count}
	</p>
	<p slot="bar">
		count in bar slot - is not available: {count}
	</p>
</Nested>
```

This makes slot bindings more consistent as the behavior is undefined when for example the default slot is from a list and the named slot is not. ([#6049](https://github.com/sveltejs/svelte/issues/6049))

## Preprocessors

The order in which preprocessors are applied has changed. Now, preprocessors are executed in order, and within one group, the order is markup, script, style.

```js
// @errors: 2304
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(
	source,
	[
		{
			markup: () => {
				console.log('markup-1');
			},
			script: () => {
				console.log('script-1');
			},
			style: () => {
				console.log('style-1');
			}
		},
		{
			markup: () => {
				console.log('markup-2');
			},
			script: () => {
				console.log('script-2');
			},
			style: () => {
				console.log('style-2');
			}
		}
	],
	{
		filename: 'App.svelte'
	}
);

// Svelte 3 logs:
// markup-1
// markup-2
// script-1
// script-2
// style-1
// style-2

// Svelte 4 logs:
// markup-1
// script-1
// style-1
// markup-2
// script-2
// style-2
```

This could affect you for example if you are using `MDsveX` - in which case you should make sure it comes before any script or style preprocessor.

```diff
preprocess: [
-	vitePreprocess(),
-	mdsvex(mdsvexConfig)
+	mdsvex(mdsvexConfig),
+	vitePreprocess()
]
```

Each preprocessor must also have a name. ([#8618](https://github.com/sveltejs/svelte/issues/8618))

## New eslint package

`eslint-plugin-svelte3` is deprecated. It may still work with Svelte 4 but we make no guarantees about that. We recommend switching to our new package [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte). See [this Github post](https://github.com/sveltejs/kit/issues/10242#issuecomment-1610798405) for an instruction how to migrate. Alternatively, you can create a new project using `npm create svelte@latest`, select the eslint (and possibly TypeScript) option and then copy over the related files into your existing project.

## Other breaking changes

- the `inert` attribute is now applied to outroing elements to make them invisible to assistive technology and prevent interaction. ([#8628](https://github.com/sveltejs/svelte/pull/8628))
- the runtime now uses `classList.toggle(name, boolean)` which may not work in very old browsers. Consider using a [polyfill](https://github.com/eligrey/classList.js) if you need to support these browsers. ([#8629](https://github.com/sveltejs/svelte/issues/8629))
- the runtime now uses the `CustomEvent` constructor which may not work in very old browsers. Consider using a [polyfill](https://github.com/theftprevention/event-constructor-polyfill/tree/master) if you need to support these browsers. ([#8775](https://github.com/sveltejs/svelte/pull/8775))
- people implementing their own stores from scratch using the `StartStopNotifier` interface (which is passed to the create function of `writable` etc) from `svelte/store` now need to pass an update function in addition to the set function. This has no effect on people using stores or creating stores using the existing Svelte stores. ([#6750](https://github.com/sveltejs/svelte/issues/6750))
- `derived` will now throw an error on falsy values instead of stores passed to it. ([#7947](https://github.com/sveltejs/svelte/issues/7947))
- type definitions for `svelte/internal` were removed to further discourage usage of those internal methods which are not public API. Most of these will likely change for Svelte 5
- Removal of DOM nodes is now batched which slightly changes its order, which might affect the order of events fired if you're using a `MutationObserver` on these elements ([#8763](https://github.com/sveltejs/svelte/pull/8763))
- if you enhanced the global typings through the `svelte.JSX` namespace before, you need to migrate this to use the `svelteHTML` namespace. Similarly if you used the `svelte.JSX` namespace to use type definitions from it, you need to migrate those to use the types from `svelte/elements` instead. You can find more information about what to do [here](https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-getting-deprecation-warnings-for-sveltejsx--i-want-to-migrate-to-the-new-typings)
