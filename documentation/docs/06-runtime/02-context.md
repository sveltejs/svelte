---
title: Context
---

Context allows components to access values owned by parent components without passing them down as props (potentially through many layers of intermediate components, known as 'prop-drilling').

By creating a `[get, set]` pair of functions with `createContext`, you can set the context in a parent component and get it in a child component:

<!-- codeblock:start {"title":"Context","selected":"context.ts"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Parent from './Parent.svelte';
	import Child from './Child.svelte';
</script>

<Parent>
	<Child />
</Parent>
```

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setUserContext } from './context';

	let { children } = $props();

	setUserContext({ name: 'world' });
</script>

{@render children()}
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getUserContext } from './context';

	const user = getUserContext();
</script>

<h1>hello {user.name}, inside Child.svelte</h1>
```

```ts
/// file: context.ts
import { createContext } from 'svelte';

interface User {
	name: string;
}

export const [getUserContext, setUserContext] = createContext<User>();
```
<!-- codeblock:end -->

> [!NOTE] `createContext` was added in version 5.40. If you are using an earlier version of Svelte, you must use `setContext` and `getContext` instead.

This is particularly useful when `Parent.svelte` is not directly aware of `Child.svelte`, but instead renders it as part of a `children` [snippet](snippet) as shown above.

## `setContext` and `getContext`

As an alternative to `createContext`, you can use `setContext` and `getContext` directly. The parent component sets context with `setContext(key, value)`...

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

The key (`'my-context'`, in the example above) and the context itself can be any JavaScript value.

> [!NOTE] `createContext` is preferred since it provides better type safety and makes it unnecessary to use keys.

In addition to [`setContext`](svelte#setContext) and [`getContext`](svelte#getContext), Svelte exposes [`hasContext`](svelte#hasContext) and [`getAllContexts`](svelte#getAllContexts) functions.

## Using context with state

You can store reactive state in context...

<!-- codeblock:start {"title":"Context with state"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import { setCounter } from './context.ts';
	import Child from './Child.svelte';

	let counter = $state({
		count: 0
	});

	setCounter(counter);
</script>

<button onclick={() => counter.count += 1}>
	increment
</button>

<Child />
<Child />
<Child />

<button onclick={() => counter.count = 0}>
	reset
</button>
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getCounter } from './context.ts';

	const counter = getCounter();
</script>

<p>{counter.count}</p>
```

```ts
/// file: context.ts
import { createContext } from 'svelte';

interface Counter {
	count: number;
}

export const [getCounter, setCounter] = createContext<Counter>();
```
<!-- codeblock:end -->

...though note that if you _reassign_ `counter` instead of updating it, you will 'break the link' — in other words instead of this...

```svelte
<button onclick={() => counter = { count: 0 } }>
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

## Component testing

When writing [component tests](testing#Unit-and-component-tests-with-Vitest-Component-testing), it can be useful to create a wrapper component that sets the context in order to check the behaviour of a component that uses it. As of version 5.49, you can do this sort of thing:

```js
import { mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import { setUserContext } from './context';
import MyComponent from './MyComponent.svelte';

test('MyComponent', () => {
	function Wrapper(...args) {
		setUserContext({ name: 'Bob' });
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
