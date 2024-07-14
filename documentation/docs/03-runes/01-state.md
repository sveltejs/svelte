---
title: State
---

- `$state` (.frozen)
- `$derived` (.by)
- using classes
- getters/setters (what to do to keep reactivity "alive")
- universal reactivity

Svelte 5 uses _runes_, a powerful set of primitives for controlling reactivity inside your Svelte components and inside `.svelte.js` and `.svelte.ts` modules.

Runes are function-like symbols that provide instructions to the Svelte compiler. You don't need to import them from anywhere — when you use Svelte, they're part of the language. This page describes the runes that are concerned with managing state in your application.

## `$state`

The `$state` rune is the at the heart of the runes API. It is used to declare reactive state:

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

Variables declared with `$state` are the variable _itself_, in other words there's no wrapper around the value that it contains. This is possible thanks to the compiler-nature of Svelte. As such, updating state is done through simple reassignment.

You can also use `$state` in class fields (whether public or private):

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);
	text = $state();

	constructor(text) {
		this.text = text;
	}

	reset() {
		this.text = '';
		this.done = false;
	}
}
```

> In this example, the compiler transforms `done` and `text` into `get`/`set` methods on the class prototype referencing private fields

Objects and arrays are made deeply reactive by wrapping them with [`Proxies`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). What that means is that in the following example, we can mutate the `entries` object and the UI will still update - but only the list item that is actually changed will rerender:

```svelte
<script>
	let entries = $state([
		{ id: 1, text: 'foo' },
		{ id: 2, text: 'bar' }
	]);
</script>

{#each entries as entry (entry.id)}
	{entry.text}
{/each}

<button onclick={() => (entries[1].text = 'baz')}>change second entry text</button>
```

> Only POJOs (plain of JavaScript objects) are made deeply reactive. Reactivity will stop at class boundaries and leave those alone

## `$state.frozen`

State declared with `$state.frozen` cannot be mutated; it can only be _reassigned_. In other words, rather than assigning to a property of an object, or using an array method like `push`, replace the object or array altogether if you'd like to update it:

```svelte
<script>
	let entries = $state([
		{ id: 1, text: 'foo' },
		{ id: 2, text: 'bar' }
	]);
</script>

{#each entries as entry (entry.id)}
	{entry.text}
{/each}

<button onclick={() => (entries = [entries[0], { id: entries[1].id, text: 'baz' }])}
	>change second entry text</button
>
```

This can improve performance with large arrays and objects that you weren't planning to mutate anyway, since it avoids the cost of making them reactive. Note that frozen state can _contain_ reactive state (for example, a frozen array of reactive objects).

> Objects and arrays passed to `$state.frozen` will be shallowly frozen using `Object.freeze()`. If you don't want this, pass in a clone of the object or array instead. The argument cannot be an existing state proxy created with `$state(...)`.

## `$state.snapshot`

To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:

```svelte
<script>
	let counter = $state({ count: 0 });

	function onclick() {
		// Will log `{ count: ... }` rather than `Proxy { ... }`
		console.log($state.snapshot(counter));
	}
</script>
```

This is handy when you want to pass some state to an external library or API that doesn't expect a proxy, such as `structuredClone`.

> Note that `$state.snapshot` will clone the data when removing reactivity. If the value passed isn't a `$state` proxy, it will be returned as-is.

## `$state.is`

Sometimes you might need to compare two values, one of which is a reactive `$state(...)` proxy but the other is not. For this you can use `$state.is(a, b)`:

```svelte
<script>
	let foo = $state({});
	let bar = {};

	foo.bar = bar;

	console.log(foo.bar === bar); // false — `foo.bar` is a reactive proxy
	console.log($state.is(foo.bar, bar)); // true
</script>
```

This is handy when you might want to check if the object exists within a deeply reactive object/array.

Under the hood, `$state.is` uses [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) for comparing the values.

> Use this as an escape hatch - most of the time you don't need this. Svelte will warn you at dev time if you happen to run into this problem

## `$derived`

Derived state is declared with the `$derived` rune:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

The expression inside `$derived(...)` should be free of side-effects. Svelte will disallow state changes (e.g. `count++`) inside derived expressions.

As with `$state`, you can mark class fields as `$derived`.

## `$derived.by`

Sometimes you need to create complex derivations that don't fit inside a short expression. In these cases, you can use `$derived.by` which accepts a function as its argument.

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

In essence, `$derived(expression)` is equivalent to `$derived.by(() => expression)`.

## Universal reactivity

In the examples above, `$state` and `$derived` only appear at the top level of components. You can also use them within functions or even outside Svelte components inside `.svelte.js` or `.svelte.ts` modules.

```ts
/// file: counter.svelte.ts
export function createCounter(initial: number) {
	let count = $state(initial);
	let double = $derived(count * 2);
	return {
		get count() {
			return count;
		},
		get double() {
			return double;
		},
		increment: () => count++
	};
}
```

```svelte
<!--- file: App.svelte --->
<script>
	import { createCounter } from './counter.svelte';

	const counter = createCounter();
</script>

<button onclick={counter.increment}>{counter.count} / {counter.double}</button>
```

There are a few things to note in the above example:

- We're using getters to transport reactivity across the function boundary. This way we keep reactivity "alive". If we were to return the value itself, it would be fixed to the value at that point in time. This is no different to how regular JavaScript variables behave.
- We're not destructuring the counter at the usage site. Because we're using getters, destructuring would fix `count` and `double` to the value at that point in time. To keep the getters "alive", we're not using destructuring. Again, this is how regular JavaScript works.

If you have shared state you want to manipulate from various places, you don't need to resort to getters. Instead, you can take advantage of `$state` being deeply reactive and only update its properties, not the value itself:

```ts
/// file: app-state.svelte.ts
export const appState = $state({
	loggedIn: true
});
```

```svelte
<!--- file: App.svelte --->
<script>
	import { appState } from './app-state.svelte';
</script>

<button onclick={() => (appState.loggedIn = false)}>Log out</button>
```
