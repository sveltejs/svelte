---
title: Context
---

Context allows components to access values owned by parent components without passing them down as props (potentially through many layers of intermediate components, known as 'prop-drilling'). The parent component sets context with `setContext(key, value)`...

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	setContext('my-context', 'hello from Parent.svelte');
</script>
```

...and the child retrieves it with `getContext`:

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const message = getContext('my-context');
</script>

<h1>{message}, inside Child.svelte</h1>
```

This is particularly useful when `Parent.svelte` is not directly aware of `Child.svelte`, but instead renders it as part of a `children` [snippet](snippet) ([demo](/playground/untitled#H4sIAAAAAAAAE42Q3W6DMAyFX8WyJgESK-oto6hTX2D3YxcM3IIUQpR40yqUd58CrCXsp7tL7HNsf2dAWXaEKR56yfTBGOOxFWQwfR6Qz8q1XAHjL-GjUhvzToJd7bU09FO9ctMkG0wxM5VuFeeFLLjtVK8ZnkpNkuGo-w6CTTJ9Z3PwsBAemlbUF934W8iy5DpaZtOUcU02-ZLcaS51jHEkTFm_kY1_wfOO8QnXrb8hBzDEc6pgZ4gFoyz4KgiD7nxfTe8ghqAhIfrJ46cTzVZBbkPlODVJsLCDO6V7ZcJoncyw1yRr0hd1GNn_ZbEM3I9i1bmVxOlWElUvDUNHxpQngt3C4CXzjS1rtvkw22wMrTRtTbC8Lkuabe7jvthPPe3DofYCAAA=)):

```svelte
<Parent>
	<Child />
</Parent>
```

The key (`'my-context'`, in the example above) and the context itself can be any JavaScript value.

In addition to [`setContext`](svelte#setContext) and [`getContext`](svelte#getContext), Svelte exposes [`hasContext`](svelte#hasContext) and [`getAllContexts`](svelte#getAllContexts) functions.

## Using context with state

You can store reactive state in context ([demo](/playground/untitled#H4sIAAAAAAAAE41R0W6DMAz8FSuaBNUQdK8MkKZ-wh7HHihzu6hgosRMm1D-fUpSVNq12x4iEvvOx_kmQU2PIhfP3DCCJGgHYvxkkYid7NCI_GUS_KUcxhVEMjOelErNB3bsatvG4LW6n0ZsRC4K02qpuKqpZtmrQTNMYJA3QRAs7PTQQxS40eMCt3mX3duxnWb-lS5h7nTI0A4jMWoo4c44P_Hku-zrOazdy64chWo-ScfRkRgl8wgHKrLTH1OxHZkHgoHaTraHcopXUFYzPPVfuC_hwQaD1GrskdiNCdQwJljJqlvXfyqVsA5CGg0uRUQifHw56xFtciO75QrP07vo_JXf_tf8yK2ezDKY_ZWt_1y2qqYzv7bI1IW1V_sN19m-07wCAAA=))...

```svelte
<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	let counter = $state({
		count: 0
	});

	setContext('counter', counter);
</script>

<button onclick={() => counter.count += 1}>
	increment
</button>

<Child />
<Child />
<Child />
```

...though note that if you _reassign_ `counter` instead of updating it, you will 'break the link' — in other words instead of this...

```svelte
<button onclick={() => counter = { count: 0 }}>
	reset
</button>
```

...you must do this:

```svelte
<button onclick={() => +++counter.count = 0+++}>
	reset
</button>
```

Svelte will warn you if you get it wrong.

## Type-safe context

As an alternative to using `setContext` and `getContext` directly, you can use them via `createContext`. This gives you type safety and makes it unnecessary to use a key:

```ts
/// file: context.ts
// @filename: ambient.d.ts
interface User {}

// @filename: index.ts
// ---cut---
import { createContext } from 'svelte';

export const [getUserContext, setUserContext] = createContext<User>();
```

## Replacing global state

When you have state shared by many different components, you might be tempted to put it in its own module and just import it wherever it's needed:

```js
/// file: state.svelte.js
export const myGlobalState = $state({
	user: {
		// ...
	}
	// ...
});
```

In many cases this is perfectly fine, but there is a risk: if you mutate the state during server-side rendering (which is discouraged, but entirely possible!)...

```svelte
<!--- file: App.svelte ---->
<script>
	import { myGlobalState } from './state.svelte.js';

	let { data } = $props();

	if (data.user) {
		myGlobalState.user = data.user;
	}
</script>
```

...then the data may be accessible by the _next_ user. Context solves this problem because it is not shared between requests.
