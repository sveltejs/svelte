---
title: Context
---

Context allows components to access values owned by parent components without passing them down as props (potentially through many layers of intermediate components, known as 'prop-drilling').

> [!NOTE] If you're using a version of Svelte prior to 5.40.0, see [Using `setContext` and `getContext` directly](#Using-setContext-and-getContext-directly).

The recommended way to use context is with [`createContext`](svelte#createContext) (added in [5.40.0](https://github.com/sveltejs/svelte/releases/tag/svelte%405.40.0)), which provides type safety and eliminates the need to manage keys manually:

```ts
/// file: context.ts
// @filename: ambient.d.ts
interface User {
	name: string;
	email: string;
}

// @filename: index.ts
// ---cut---
import { createContext } from 'svelte';

export const [getUserContext, setUserContext] = createContext<User>();
```

The parent component sets context with the setter...

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setUserContext } from './context';

	setUserContext({ name: 'Alice', email: 'alice@example.com' });
</script>
```

...and the child retrieves it with the getter:

```svelte
<!--- file: Child.svelte --->
<script>
	import { getUserContext } from './context';

	const user = getUserContext();
</script>

<h1>Hello {user.name} ({user.email}), inside Child.svelte</h1>
```

<!-- TODO The playground example should be updated -->

This is particularly useful when `Parent.svelte` is not directly aware of `Child.svelte`, but instead renders it as part of a `children` [snippet](snippet) ([demo](/playground/untitled#H4sIAAAAAAAAE42Q3W6DMAyFX8WyJgESK-oto6hTX2D3YxcM3IIUQpR40yqUd58CrCXsp7tL7HNsf2dAWXaEKR56yfTBGOOxFWQwfR6Qz8q1XAHjL-GjUhvzToJd7bU09FO9ctMkG0wxM5VuFeeFLLjtVK8ZnkpNkuGo-w6CTTJ9Z3PwsBAemlbUF934W8iy5DpaZtOUcU02-ZLcaS51jHEkTFm_kY1_wfOO8QnXrb8hBzDEc6pgZ4gFoyz4KgiD7nxfTe8ghqAhIfrJ46cTzVZBbkPlODVJsLCDO6V7ZcJoncyw1yRr0hd1GNn_ZbEM3I9i1bmVxOlWElUvDUNHxpQngt3C4CXzjS1rtvkw22wMrTRtTbC8Lkuabe7jvthPPe3DofYCAAA=)):

```svelte
<Parent>
	<Child />
</Parent>
```

## Using context with state

You can store reactive state in context ([demo](/playground/untitled#H4sIAAAAAAAAE41R0W6DMAz8FSuaBNUQdK8MkKZ-wh7HHihzu6hgosRMm1D-fUpSVNq12x4iEvvOx_kmQU2PIhfP3DCCJGgHYvxkkYid7NCI_GUS_KUcxhVEMjOelErNB3bsatvG4LW6n0ZsRC4K02qpuKqpZtmrQTNMYJA3QRAs7PTQQxS40eMCt3mX3duxnWb-lS5h7nTI0A4jMWoo4c44P_Hku-zrOazdy64chWo-ScfRkRgl8wgHKrLTH1OxHZkHgoHaTraHcopXUFYzPPVfuC_hwQaD1GrskdiNCdQwJljJqlvXfyqVsA5CGg0uRUQifHw56xFtciO75QrP07vo_JXf_tf8yK2ezDKY_ZWt_1y2qqYzv7bI1IW1V_sN19m-07wCAAA=))...

```svelte
<script>
	import { createContext } from 'svelte';
	import Child from './Child.svelte';

	const [getCounter, setCounter] = createContext();

	let counter = $state({
		count: 0
	});

	setCounter(counter);
</script>

<button onclick={() => (counter.count += 1)}>increment</button>

<Child />
<Child />
<Child />
```

...though note that if you _reassign_ `counter` instead of updating it, you will 'break the link' — in other words instead of this...

```svelte
<button onclick={() => (counter = { count: 0 })}>reset</button>
```

...you must do this:

```svelte
<button onclick={() => +++counter.count = 0+++}>reset</button>
```

Svelte will warn you if you get it wrong.

## Testing with context

When writing [component tests](testing#Unit-and-component-tests-with-Vitest-Component-testing), it can be useful to create a wrapper component that sets the context in order to check the behaviour of a component that uses it. As of version [5.50](https://github.com/sveltejs/svelte/releases/tag/svelte%405.50.0), you can do this sort of thing:

```js
import { mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import { setUserContext } from './context';
import MyComponent from './MyComponent.svelte';

test('MyComponent', () => {
	function Wrapper(...args) {
		setUserContext({
			// ...
		});
		return MyComponent(...args);
	}

	const component = mount(Wrapper, {
		target: document.body
	});

	expect(document.body.innerHTML).toBe('<h1>Hello Bob!</h1>');

	unmount(component);
});
```

This approach also works with [`hydrate`](imperative-component-api#hydrate) and [`render`](imperative-component-api#render).

## Using `setContext` and `getContext` directly

> [!NOTE] Prior to `createContext`, this was the standard way to work with context. While still supported, [`createContext`](svelte#createContext) is now the recommended approach as it provides type safety and eliminates key management.

`createContext` uses [`setContext`](svelte#setContext) and [`getContext`](svelte#getContext) internally. Svelte also provides these as lower-level functions for working with context directly. Unlike `createContext`, these require you to manage your own context keys — the parent calls `setContext(key, value)` and the child calls `getContext(key)` with the same key to retrieve it:

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	setContext('my-context', 'hello from Parent.svelte');
</script>
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const message = getContext('my-context');
</script>

<h1>{message}, inside Child.svelte</h1>
```

The key (`'my-context'`, in the example above) and the context itself can be any JavaScript value.

In addition to `setContext` and `getContext`, Svelte exposes [`hasContext`](svelte#hasContext) and [`getAllContexts`](svelte#getAllContexts) functions.

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
