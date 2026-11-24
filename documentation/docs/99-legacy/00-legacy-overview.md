---
title: Overview
---

Svelte 5 introduced some significant changes to Svelte's API, including [runes](what-are-runes), [snippets](snippet) and event attributes. As a result, some Svelte 3/4 features are deprecated (though supported for now, unless otherwise specified) and will eventually be removed. We recommend that you incrementally [migrate your existing code](v5-migration-guide).

The following pages document these features for

- people still using Svelte 3/4
- people using Svelte 5, but with components that haven't yet been migrated

Since Svelte 3/4 syntax still works in Svelte 5, we will distinguish between _legacy mode_ and _runes mode_. Once a component is in runes mode (which you can opt into by using runes, or by explicitly setting the `runes: true` compiler option), legacy mode features are no longer available.

Components that are explicitly in legacy mode, because of `<svelte:options runes={false} />`, the `runes: false` compiler option, `export let`, `$:`, `$$props` or `$$restProps`, re-run a template expression when a variable it references changes, as in Svelte 3/4. `$state` that the expression reads through a class field or inside a function call is not tracked, so `{counter.value}` is not re-run by `counter.increment()` if `value` is a `$state` field of a class instance from a [`.svelte.js` module](svelte-js-files). To use such state in a legacy mode component, convert it to a store with [`toStore`](svelte-store#toStore):

```svelte
<svelte:options runes={false} />

<script>
	import { toStore } from 'svelte/store';
	import { counter } from './counter.svelte.js';

	const count = toStore(() => counter.value);
</script>

<button on:click={() => counter.increment()}>{$count}</button>
```

If you're exclusively interested in the Svelte 3/4 syntax, you can browse its documentation at [v4.svelte.dev](https://v4.svelte.dev).
