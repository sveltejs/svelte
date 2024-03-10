---
title: Runes
---

Svelte 5 introduces _runes_, a powerful set of primitives for controlling reactivity inside your Svelte components and — for the first time — inside `.svelte.js` and `.svelte.ts` modules.

Runes are function-like symbols that provide instructions to the Svelte compiler. You don't need to import them from anywhere — when you use Svelte, they're part of the language.

When you [opt in to runes mode](#how-to-opt-in), the non-runes features listed in the 'What this replaces' sections are no longer available.

> Check out the [Introducing runes](https://svelte.dev/blog/runes) blog post before diving into the docs!

## `$state`

Reactive state is declared with the `$state` rune:

```svelte
<script>
	let count = $state(0);
</script>

<button on:click={() => count++}>
	clicks: {count}
</button>
```

You can also use `$state` in class fields (whether public or private):

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);
	text = $state();

	constructor(text) {
		this.text = text;
	}
}
```

> In this example, the compiler transforms `done` and `text` into `get`/`set` methods on the class prototype referencing private fields

Objects and arrays [are made deeply reactive](/#H4sIAAAAAAAAE42QwWrDMBBEf2URhUhUNEl7c21DviPOwZY3jVpZEtIqUBz9e-UUt9BTj7M784bdmZ21wciq48xsPyGr2MF7Jhl9-kXEKxrCoqNLQS2TOqqgPbWd7cgggU3TgCFCAw-RekJ-3Et4lvByEq-drbe_dlsPichZcFYZrT6amQto2pXw5FO88FUYtG90gUfYi3zvWrYL75vxL57zfA07_zfr23k1vjtt-aZ0bQTcbrDL5ZifZcAxKeS8lzDc8X0xDhJ2ItdbX1jlOZMb9VnjyCoKCfMpfwG975NFVwEAAA==):

```svelte
<script>
	let numbers = $state([1, 2, 3]);
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	push
</button>

<button onclick={() => numbers.pop()}> pop </button>

<p>
	{numbers.join(' + ') || 0}
	=
	{numbers.reduce((a, b) => a + b, 0)}
</p>
```

### What this replaces

In non-runes mode, a `let` declaration is treated as reactive state if it is updated at some point. Unlike `$state(...)`, which works anywhere in your app, `let` only behaves this way at the top level of a component.

## `$state.frozen`

State declared with `$state.frozen` cannot be mutated; it can only be _reassigned_. In other words, rather than assigning to a property of an object, or using an array method like `push`, replace the object or array altogether if you'd like to update it:

```diff
<script>
-	let numbers = $state([1, 2, 3]);
+	let numbers = $state.frozen([1, 2, 3]);
</script>

-<button onclick={() => numbers.push(numbers.length + 1)}>
+<button onclick={() => numbers = [...numbers, numbers.length + 1]}>
	push
</button>

-<button onclick={() => numbers.pop()}> pop </button>
+<button onclick={() => numbers = numbers.slice(0, -1)}> pop </button>

<p>
	{numbers.join(' + ') || 0}
	=
	{numbers.reduce((a, b) => a + b, 0)}
</p>
```

This can improve performance with large arrays and objects that you weren't planning to mutate anyway, since it avoids the cost of making them reactive. Note that frozen state can _contain_ reactive state (for example, a frozen array of reactive objects).

> Objects and arrays passed to `$state.frozen` will be shallowly frozen using `Object.freeze()`. If you don't want this, pass in a clone of the object or array instead.

## `$derived`

Derived state is declared with the `$derived` rune:

```diff
<script>
	let count = $state(0);
+	let doubled = $derived(count * 2);
</script>

<button on:click={() => count++}>
	{doubled}
</button>

+<p>{count} doubled is {doubled}</p>
```

The expression inside `$derived(...)` should be free of side-effects. Svelte will disallow state changes (e.g. `count++`) inside derived expressions.

As with `$state`, you can mark class fields as `$derived`.

### What this replaces

If the value of a reactive variable is being computed it should be replaced with `$derived` whether it previously took the form of `$: double = count * 2` or `$: { double = count * 2; }` There are some important differences to be aware of:

- With the `$derived` rune, the value of `double` is always current (for example if you update `count` then immediately `console.log(double)`). With `$:` declarations, values are not updated until right before Svelte updates the DOM
- In non-runes mode, Svelte determines the dependencies of `double` by statically analysing the `count * 2` expression. If you refactor it...
  ```js
  // @errors: 2304
  const doubleCount = () => count * 2;
  $: double = doubleCount();
  ```
  ...that dependency information is lost, and `double` will no longer update when `count` changes. With runes, dependencies are instead tracked at runtime.
- In non-runes mode, reactive statements are ordered _topologically_, meaning that in a case like this...
  ```js
  // @errors: 2304
  $: triple = double + count;
  $: double = count * 2;
  ```
  ...`double` will be calculated first despite the source order. In runes mode, `triple` cannot reference `double` before it has been declared.

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

<button on:click={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

In essence, `$derived(expression)` is equivalent to `$derived.by(() => expression)`.

## `$effect`

To run side-effects like logging or analytics whenever some specific values change, or when a component is mounted to the DOM, we can use the `$effect` rune:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log({ count, doubled });
	});
</script>

<button on:click={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

`$effect` will automatically subscribe to any `$state` or `$derived` values it reads _synchronously_ and reruns whenever their values change — that means, values after an `await` or inside a `setTimeout` will _not_ be tracked. `$effect` will run after the DOM has been updated.

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		// runs after the DOM has been updated
		// when the component is mounted
		// and whenever `count` changes,
		// but not when `doubled` changes,
		console.log(count);

		setTimeout(() => console.log(doubled));
	});
</script>

<button on:click={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

An effect only reruns when the object it reads changes, not when a property inside it changes. If you want to react to _any_ change inside an object for inspection purposes at dev time, you may want to use [`inspect`](#inspect).

```svelte
<script>
	let object = $state({ count: 0 });
	let derived_object = $derived({
		doubled: object.count * 2
	});

	$effect(() => {
		// never reruns, because object does not change,
		// only its property changes
		object;
		console.log('object');
	});

	$effect(() => {
		// reruns, because object.count changes
		object.count;
		console.log('object.count');
	});

	$effect(() => {
		// reruns, because $derived produces a new object on each rerun
		derived_object;
		console.log('derived_object');
	});
</script>

<button on:click={() => object.count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

You can return a function from `$effect`, which will run immediately before the effect re-runs, and before it is destroyed.

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log({ count, doubled });

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			console.log('cleanup');
		};
	});
</script>

<button on:click={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

> `$effect` was designed for managing side effects such as logging or connecting to external systems like third party libraries that have an imperative API. If you're managing state or dataflow, you should use it with caution – most of the time, you're better off using a different pattern. Below are some use cases and what to use instead.

If you update `$state` inside an `$effect`, you most likely want to use `$derived` instead.

```svelte
<!-- Don't do this -->
<script>
	let count = $state(0);
	let doubled = $state();
	$effect(() => {
		doubled = count * 2;
	});
</script>

<!-- Do this instead: -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

This also applies to more complex calculations that require more than a simple expression and write to more than one variable. In these cases, you can use `$derived.by`.

```svelte
<!-- Don't do this -->
<script>
	let result_1 = $state();
	let result_2 = $state();
	$effect(() => {
		// ... some lengthy code resulting in
		result_1 = someValue;
		result_2 = someOtherValue;
	});
</script>

<!-- Do this instead: -->
<script>
	let { result_1, result_2 } = $derived.by(() => {
		// ... some lengthy code resulting in
		return {
			result_1: someValue,
			result_2: someOtherValue
		};
	});
</script>
```

When reacting to a state change and writing to a different state as a result, think about if it's possible to use callback props instead.

```svelte
<!-- Don't do this -->
<script>
	let value = $state();
	let value_uppercase = $state();
	$effect(() => {
		value_uppercase = value.toUpperCase();
	});
</script>

<Text bind:value />

<!-- Do this instead: -->
<script>
	let value = $state();
	let value_uppercase = $state();
	function onValueChange(new_text) {
		value = new_text;
		value_uppercase = new_text.toUpperCase();
	}
</script>

<Text {value} {onValueChange}>
```

If you want to have something update from above but also modify it from below (i.e. you want some kind of "writable `$derived`"), and events aren't an option, you can also use an object with getters and setters.

```svelte
<script>
	let { value } = $props();
	let facade = {
		get value() {
			return value.toUpperCase();
		},
		set value(val) {
			value = val.toLowerCase();
		}
	};
</script>

<input bind:value={facade.value} />
```

If you absolutely have to update `$state` within an effect and run into an infinite loop because you read and write to the same `$state`, use [untrack](functions#untrack).

### What this replaces

The portions of `$: {}` that are triggering side-effects can be replaced with `$effect` while being careful to migrate updates of reactive variables to use `$derived`. There are some important differences:

- Effects only run in the browser, not during server-side rendering
- They run after the DOM has been updated, whereas `$:` statements run immediately _before_
- You can return a cleanup function that will be called whenever the effect refires

Additionally, you may prefer to use effects in some places where you previously used `onMount` and `afterUpdate` (the latter of which will be deprecated in Svelte 5). There are some differences between these APIs as `$effect` should not be used to compute reactive values and will be triggered each time a referenced reactive variable changes (unless using `untrack`).

## `$effect.pre`

In rare cases, you may need to run code _before_ the DOM updates. For this we can use the `$effect.pre` rune:

```svelte
<script>
	import { tick } from 'svelte';

	let div;
	let messages = [];

	// ...

	$effect.pre(() => {
		if (!div) return; // not yet mounted

		// reference `messages` so that this code re-runs whenever it changes
		messages;

		// autoscroll when new messages are added
		if (
			div.offsetHeight + div.scrollTop >
			div.scrollHeight - 20
		) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>

<div bind:this={div}>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>
```

Apart from the timing, `$effect.pre` works exactly like [`$effect`](#effect) — refer to its documentation for more info.

### What this replaces

Previously, you would have used `beforeUpdate`, which — like `afterUpdate` — is deprecated in Svelte 5.

## `$effect.active`

The `$effect.active` rune is an advanced feature that tells you whether or not the code is running inside an effect or inside your template ([demo](/#H4sIAAAAAAAAE3XP0QrCMAwF0F-JRXAD595rLfgdzodRUyl0bVgzQcb-3VYFQfExl5tDMgvrPCYhT7MI_YBCiiOR2Aq-UxnSDT1jnlOcRlMSlczoiHUXOjYxpOhx5-O12rgAJg4UAwaGhDyR3Gxhjdai4V1v2N2wqus9tC3Y3ifMQjbehaqq4aBhLtEv_Or893icCsdLve-Caj8nBkU67zMO5HtGCfM3sKiWNKhV0zwVaBqd3x3ixVmHFyFLuJyXB-moOe8pAQAA)):

```svelte
<script>
	console.log('in component setup:', $effect.active()); // false

	$effect(() => {
		console.log('in effect:', $effect.active()); // true
	});
</script>

<p>in template: {$effect.active()}</p> <!-- true -->
```

This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects.

## `$effect.root`

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
nested effects that you want to manually control. This rune also allows for creation of effects outside of the component initialisation phase.

```svelte
<script>
	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});
</script>
```

## `$props`

To declare component props, use the `$props` rune:

```js
let { optionalProp = 42, requiredProp } = $props();
```

You can use familiar destructuring syntax to rename props, in cases where you need to (for example) use a reserved word like `catch` in `<MyComponent catch={22} />`:

```js
let { catch: theCatch } = $props();
```

To get all properties, use rest syntax:

```js
let { a, b, c, ...everythingElse } = $props();
```

If you're using TypeScript, you can use type arguments:

```ts
type MyProps = any;
// ---cut---
let { a, b, c, ...everythingElse } = $props<MyProps>();
```

Props cannot be mutated, unless the parent component uses `bind:`. During development, attempts to mutate props will result in an error.

### What this replaces

`$props` replaces the `export let` and `export { x as y }` syntax for declaring props. It also replaces `$$props` and `$$restProps`, and the little-known `interface $$Props {...}` construct.

Note that you can still use `export const` and `export function` to expose things to users of your component (if they're using `bind:this`, for example).

## `$inspect`

The `$inspect` rune is roughly equivalent to `console.log`, with the exception that it will re-run whenever its
argument changes. `$inspect` tracks reactive state deeply, meaning that updating something inside an object
or array using [fine-grained reactivity](/docs/fine-grained-reactivity) will cause it to re-fire. ([Demo:](/#H4sIAAAAAAAACkWQ0YqDQAxFfyUMhSotdZ-tCvu431AXtGOqQ2NmmMm0LOK_r7Utfby5JzeXTOpiCIPKT5PidkSVq2_n1F7Jn3uIcEMSXHSw0evHpAjaGydVzbUQCmgbWaCETZBWMPlKj29nxBDaHj_edkAiu12JhdkYDg61JGvE_s2nR8gyuBuiJZuDJTyQ7eE-IEOzog1YD80Lb0APLfdYc5F9qnFxjiKWwbImo6_llKRQVs-2u91c_bD2OCJLkT3JZasw7KLA2XCX31qKWE6vIzNk1fKE0XbmYrBTufiI8-_8D2cUWBA_AQAA))

```svelte
<script>
	let count = $state(0);
	let message = $state('hello');

	$inspect(count, message); // will console.log when `count` or `message` change
</script>

<button onclick={() => count++}>Increment</button>
<input bind:value={message} />
```

`$inspect` returns a property `with`, which you can invoke with a callback, which will then be invoked instead of `console.log`. The first argument to the callback is either `"init"` or `"update"`, all following arguments are the values passed to `$inspect`. [Demo:](/#H4sIAAAAAAAACkVQ24qDMBD9lSEUqlTqPlsj7ON-w7pQG8c2VCchmVSK-O-bKMs-DefKYRYx6BG9qL4XQd2EohKf1opC8Nsm4F84MkbsTXAqMbVXTltuWmp5RAZlAjFIOHjuGLOP_BKVqB00eYuKs82Qn2fNjyxLtcWeyUE2sCRry3qATQIpJRyD7WPVMf9TW-7xFu53dBcoSzAOrsqQNyOe2XUKr0Xi5kcMvdDB2wSYO-I9vKazplV1-T-d6ltgNgSG1KjVUy7ZtmdbdjqtzRcphxMS1-XubOITJtPrQWMvKnYB15_1F7KKadA_AQAA)

```svelte
<script>
	let count = $state(0);

	$inspect(count).with((type, count) => {
		if (type === 'update') {
			debugger; // or `console.trace`, or whatever you want
		}
	});
</script>

<button onclick={() => count++}>Increment</button>
```

A convenient way to find the origin of some change is to pass `console.trace` to `with`:

```js
// @errors: 2304
$inspect(stuff).with(console.trace);
```

> `$inspect` only works during development.

## How to opt in

Current Svelte code will continue to work without any adjustments. Components using the Svelte 4 syntax can use components using runes and vice versa.

The easiest way to opt in to runes mode is to just start using them in your code. Alternatively, you can force the compiler into runes or non-runes mode either on a per-component basis...

<!-- prettier-ignore -->
```svelte
<!--- file: YourComponent.svelte --->
<!-- this can be `true` or `false` -->
<svelte:options runes={true} />
```

...or for your entire app:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		runes: true
	}
};
```
