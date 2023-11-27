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

### What this replaces

In non-runes mode, a `let` declaration is treated as reactive state if it is updated at some point. Unlike `$state(...)`, which works anywhere in your app, `let` only behaves this way at the top level of a component.

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

The non-runes equivalent would be `$: double = count * 2`. There are some important differences to be aware of:

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

## `$effect`

To run code whenever specific values change, or when a component is mounted to the DOM, we can use the `$effect` rune:

```diff
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

+	$effect(() => {
+		// runs when the component is mounted, and again
+		// whenever `count` or `doubled` change,
+		// after the DOM has been updated
+		console.log({ count, doubled });
+
+		return () => {
+			// if a callback is provided, it will run
+			// a) immediately before the effect re-runs
+			// b) when the component is destroyed
+			console.log('cleanup');
+		};
+	});
</script>

<button on:click={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

### What this replaces

The `$effect` rune is roughly equivalent to `$:` when it's being used for side-effects (as opposed to declarations). There are some important differences:

- Effects only run in the browser, not during server-side rendering
- They run after the DOM has been updated, whereas `$:` statements run immediately _before_
- You can return a cleanup function that will be called whenever the effect refires

Additionally, you will most likely find you can use effects in all the places where you previously used `onMount` and `afterUpdate` (the latter of which will be deprecated in Svelte 5).

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

### What this replaces

`$props` replaces the `export let` and `export { x as y }` syntax for declaring props. It also replaces `$$props` and `$$restProps`, and the little-known `interface $$Props {...}` construct.

Note that you can still use `export const` and `export function` to expose things to users of your component (if they're using `bind:this`, for example).

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
