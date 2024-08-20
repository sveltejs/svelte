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

<button onclick={() => count++}>
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

Only plain objects and arrays [are made deeply reactive](/#H4sIAAAAAAAAE42QwWrDMBBEf2URhUhUNEl7c21DviPOwZY3jVpZEtIqUBz9e-UUt9BTj7M784bdmZ21wciq48xsPyGr2MF7Jhl9-kXEKxrCoqNLQS2TOqqgPbWd7cgggU3TgCFCAw-RekJ-3Et4lvByEq-drbe_dlsPichZcFYZrT6amQto2pXw5FO88FUYtG90gUfYi3zvWrYL75vxL57zfA07_zfr23k1vjtt-aZ0bQTcbrDL5ZifZcAxKeS8lzDc8X0xDhJ2ItdbX1jlOZMb9VnjyCoKCfMpfwG975NFVwEAAA==) by wrapping them with [`Proxies`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy):

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

## `$state.raw`

State declared with `$state.raw` cannot be mutated; it can only be _reassigned_. In other words, rather than assigning to a property of an object, or using an array method like `push`, replace the object or array altogether if you'd like to update it:

```diff
<script>
-	let numbers = $state([1, 2, 3]);
+	let numbers = $state.raw([1, 2, 3]);
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

This can improve performance with large arrays and objects that you weren't planning to mutate anyway, since it avoids the cost of making them reactive. Note that raw state can _contain_ reactive state (for example, a raw array of reactive objects).

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

## `$derived`

Derived state is declared with the `$derived` rune:

```diff
<script>
	let count = $state(0);
+	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
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

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

In essence, `$derived(expression)` is equivalent to `$derived.by(() => expression)`.

## `$effect`

To run _side-effects_ when the component is mounted to the DOM, and when values change, we can use the `$effect` rune ([demo](/#H4sIAAAAAAAAE31T24rbMBD9lUG7kAQ2sbdlX7xOYNk_aB_rQhRpbAsU2UiTW0P-vbrYubSlYGzmzMzROTPymdVKo2PFjzMzfIusYB99z14YnfoQuD1qQh-7bmdFQEonrOppVZmKNBI49QthCc-OOOH0LZ-9jxnR6c7eUpOnuv6KeT5JFdcqbvbcBcgDz1jXKGg6ncFyBedYR6IzLrAZwiN5vtSxaJA-EzadfJEjKw11C6GR22-BLH8B_wxdByWpvUYtqqal2XB6RVkG1CoHB6U1WJzbnYFDiwb3aGEdDa3Bm1oH12sQLTcNPp7r56m_00mHocSG97_zd7ICUXonA5fwKbPbkE2ZtMJGGVkEdctzQi4QzSwr9prnFYNk5hpmqVuqPQjNnfOJoMF22lUsrq_UfIN6lfSVyvQ7grB3X2mjMZYO3XO9w-U5iLx42qg29md3BP_ni5P4gy9ikTBlHxjLzAtPDlyYZmRdjAbGq7HprEQ7p64v4LU_guu0kvAkhBim3nMplWl8FreQD-CW20aZR0wq12t-KqDWeBywhvexKC3memmDwlHAv9q4Vo2ZK8KtK0CgX7u9J8wXbzdKv-nRnfF_2baTqlYoWUF2h5efl9-n0O6koAMAAA==)):

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// this will re-run whenever `color` or `size` change
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100" />
```

The function passed to `$effect` will run when the component mounts, and will re-run after any changes to the values it reads that were declared with `$state` or `$derived` (including those passed in with `$props`). Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

Values that are read asynchronously — after an `await` or inside a `setTimeout`, for example — will _not_ be tracked. Here, the canvas will be repainted when `color` changes, but not when `size` changes ([demo](/#H4sIAAAAAAAAE31T24rbMBD9lUG7kCxsbG_LvrhOoPQP2r7VhSjy2BbIspHGuTT436tLnMtSCiaOzpw5M2dGPrNaKrQs_3VmmnfIcvZ1GNgro9PgD3aPitCdbT8a4ZHCCiMH2pS6JIUEVv5BWMOzJU64fM9evswR0ave3EKLp7r-jFm2iIwri-s9tx5ywDPWNQpaLl9gvYFz4JHotfVqmvBITi9mJA3St4gtF5-qWZUuvEQo5Oa7F8tewT2XrIOsqL2eWpRNS7eGSkpToFZaOEilwODKjBoOLWrco4FtsLQF0XLdoE2S5LGmm6X6QSflBxKod8IW6afssB8_uAslndJuJNA9hWKw9VO91pmJ92XunHlu_J1nMDk8_p_8q0hvO9NFtA47qavcW12fIzJBmM26ZG9ZVjKIs7ke05hdyT0Ixa11Ad-P6ZUtWbgNheI7VJvYQiH14Bz5a-SYxvtwIqHonqsR12ff8ORkQ-chP70T-L9eGO4HvYAFwRh9UCxS13h0YP2CgmoyG5h3setNhWZF_ZDD23AE2ytZwZMQ4jLYgVeV1I2LYgfZBey4aaR-xCppB8VPOdQKjxes4UMgxcVcvwHf4dzAv9K4ko1eScLO5iDQXQFzL5gl7zdJt-nZnXYfbddXspZYsZzMiNPv6S8Bl41G7wMAAA==)):

```ts
// @filename: index.ts
declare let canvas: {
	width: number;
	height: number;
	getContext(
		type: '2d',
		options?: CanvasRenderingContext2DSettings
	): CanvasRenderingContext2D;
};
declare let color: string;
declare let size: number;

// ---cut---
$effect(() => {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	// this will re-run whenever `color` changes...
	context.fillStyle = color;

	setTimeout(() => {
		// ...but not when `size` changes
		context.fillRect(0, 0, size, size);
	}, 0);
});
```

An effect only reruns when the object it reads changes, not when a property inside it changes. (If you want to observe changes _inside_ an object at dev time, you can use [`$inspect`](#$inspect).)

```svelte
<script>
	let state = $state({ value: 0 });
	let derived = $derived({ value: state.value * 2 });

	// this will run once, because `state` is never reassigned (only mutated)
	$effect(() => {
		state;
	});

	// this will run whenever `state.value` changes...
	$effect(() => {
		state.value;
	});

	// ...and so will this, because `derived` is a new object each time
	$effect(() => {
		derived;
	});
</script>

<button onclick={() => (state.value += 1)}>
	{state.value}
</button>

<p>{state.value} doubled is {derived.value}</p>
```

You can return a function from `$effect`, which will run immediately before the effect re-runs, and before it is destroyed ([demo](/#H4sIAAAAAAAAE42SzW6DMBCEX2Vl5RDaVCQ9JoDUY--9lUox9lKsGBvZC1GEePcaKPnpqSe86_m0M2t6ViqNnu0_e2Z4jWzP3pqGbRhdmrHwHWrCUHvbOjF2Ei-caijLTU4aCYRtDUEKK0-ccL2NDstNrbRWHoU10t8Eu-121gTVCssSBa3XEaQZ9GMrpziGj0p5OAccCgSHwmEgJZwrNNihg6MyhK7j-gii4uYb_YyGUZ5guQwzPdL7b_U4ZNSOvp9T2B3m1rB5cLx4zMkhtc7AHz7YVCVwEFzrgosTBMuNs52SKDegaPbvWnMH8AhUXaNUIY6-hHCldQhUIcyLCFlfAuHvkCKaYk8iYevGGgy2wyyJnpy9oLwG0sjdNe2yhGhJN32HsUzi2xOapNpl_bSLIYnDeeoVLZE1YI3QSpzSfo7-8J5PKbwOmdf2jC6JZyD7HxpPaMk93aHhF6utVKVCyfbkWhy-hh9Z3o_2nQIAAA==)).

```svelte
<script>
	let count = $state(0);
	let milliseconds = $state(1000);

	$effect(() => {
		// This will be recreated whenever `milliseconds` changes
		const interval = setInterval(() => {
			count += 1;
		}, milliseconds);

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			clearInterval(interval);
		};
	});
</script>

<h1>{count}</h1>

<button onclick={() => (milliseconds *= 2)}>slower</button>
<button onclick={() => (milliseconds /= 2)}>faster</button>
```

### When not to use `$effect`

In general, `$effect` is best considered something of an escape hatch — useful for things like analytics and direct DOM manipulation — rather than a tool you should use frequently. In particular, avoid using it to synchronise state. Instead of this...

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// don't do this!
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

...do this:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

> For things that are more complicated than a simple expression like `count * 2`, you can also use [`$derived.by`](#$derived-by).

You might be tempted to do something convoluted with effects to link one value to another. The following example shows two inputs for "money spent" and "money left" that are connected to each other. If you update one, the other should update accordingly. Don't use effects for this ([demo](/#H4sIAAAAAAAACpVRQWrDMBD8ihA5ONDG7qEXxQ70HXUPir0KgrUsrHWIMf57pXWdlFIKPe6MZmZnNUtjEYJU77N0ugOp5Jv38knS5NMQroAEcQ79ODQJKUMzWE-n2tWEQIJ60igq8VIUxw0LHhxFbBdIE2TF_s4gmG8Ea5mM9A6MgYaybC-qk5gTlDT8fg15Xo3ZbPlTti2w6ZLNQ1bmjw6uRH0G5DqldX6MjWL1qpaDdheopThb16qrxhGqmX0X0elbNbP3InKWfjH5hvKYku7u_wtKC_-aw8Q9Jk0_UgJNCOvvJHC7SGuDRz0pYRBuxxW7aK9EcXiFbr0NX4bl8cO7vrXGQisVDSMsH8sniirsuSsCAAA=)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);
	let left = $state(total);

	$effect(() => {
		left = total - spent;
	});

	$effect(() => {
		spent = total - left;
	});
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left} max={total} />
	{left}/{total} left
</label>
```

Instead, use callbacks where possible ([demo](/#H4sIAAAAAAAACo1SMW6EMBD8imWluFNyQIo0HERKf13KkMKB5WTJGAsvp0OIv8deMEEJRcqdmZ1ZjzzyWiqwPP0YuRYN8JS_GcOfOA7GD_YGCsHNtu270iOZLTtp8LXQBSpAhi0KxXL2nCTngFkDGh32YFEgHJLjyiioNwTtEunoutclylaz3lSOfPceBziy0ZMFBs9HiFB0V8DoJlQP55ldfOdjTvMBRE275hcn33gv2_vWITh4e3GwzuKfNnSmxBcoKiaT2vSuG1diXvBO6CsUnJFrPpLhxFpNonzcvHdijbjnI0VNLCavRR8HlEYfvcb9O9mf_if4QuBOLqnXWD_9SrU4KJg_ggdDm5W0RokhZbWC-1LiVZiUJdELNJvqaN39raatZC2h4il2PUyf0zcIbC-7lgIAAA==)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);
	let left = $state(total);

	function updateSpent(e) {
		spent = +e.target.value;
		left = total - spent;
	}

	function updateLeft(e) {
		left = +e.target.value;
		spent = total - left;
	}
</script>

<label>
	<input
		type="range"
		value={spent}
		oninput={updateSpent}
		max={total}
	/>
	{spent}/{total} spent
</label>

<label>
	<input
		type="range"
		value={left}
		oninput={updateLeft}
		max={total}
	/>
	{left}/{total} left
</label>
```

If you need to use bindings, for whatever reason (for example when you want some kind of "writable `$derived`"), consider using getters and setters to synchronise state ([demo](/#H4sIAAAAAAAACpVRQW7DIBD8CkI9JFIau4deiB2p7yg9kHhtIWGMYG3Fsvh7ARs3qnrpCWZGM8MuC22lAkfZ50K16IEy-mEMPVGcTQRuAoUQsBtGe49M5e5WGrxyzVEBEhxQKFKTt7K8ZM4Z0Bi4F4cC4VAeo7JpCtooLRFz7AIzCTXC4ZgpjhZwtHpLfl3TLqvoT-vpdt_0ZMy92TllVzx8AFXx83pdKXEDlQappDZjmCUMXXNqhe6AU3KTumGppV5StCe9eNRLivekSNZNKTKbYGza0_9XFPdzTvc_257kvTJyvxodzgrWP4pkXlEjnVFiZqRV8NiW0wnDSHl-hz4RPm0p2cO390MjWwkNZWhD5Zf_BkCCa6AxAgAA)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);

	let left = {
		get value() {
			return total - spent;
		},
		set value(v) {
			spent = total - v;
		}
	};
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left.value} max={total} />
	{left.value}/{total} left
</label>
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

	let div = $state();
	let messages = $state([]);

	// ...

	$effect.pre(() => {
		if (!div) return; // not yet mounted

		// reference `messages` array length so that this code re-runs whenever it changes
		messages.length;

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

Apart from the timing, `$effect.pre` works exactly like [`$effect`](#$effect) — refer to its documentation for more info.

### What this replaces

Previously, you would have used `beforeUpdate`, which — like `afterUpdate` — is deprecated in Svelte 5.

## `$effect.tracking`

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template ([demo](/#H4sIAAAAAAAACn3PQWrDMBAF0KtMRSA2xPFeUQU5R92FUUZBVB4N1rgQjO9eKSlkEcjyfz6PmVX5EDEr_bUqGidUWp2Z1UHJjWvIvxgFS85pmV1tTHZzYLEDDeIS5RTxGNO12QcClyZOhCSQURbW-wPs0Ht0cpR5dD-Brk3bnqDvwY8xYzGK8j9pmhY-Lay1eqUfm3eizEsFZWtPA5n-eSYZtkUQnDiOghrWV2IzPVswH113d6DrbHl6SpfgA16UruX2vf0BWo7W2y8BAAA=)):

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
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

You can also use an identifier:

```js
let props = $props();
```

If you're using TypeScript, you can declare the prop types:

<!-- prettier-ignore -->
```ts
interface MyProps {
	required: string;
	optional?: number;
	partOfEverythingElse?: boolean;
};

let { required, optional, ...everythingElse }: MyProps = $props();
```

> In an earlier preview, `$props()` took a type argument. This caused bugs, since in a case like this...
>
> ```ts
> // @errors: 2558
> let { x = 42 } = $props<{ x?: string }>();
> ```
>
> ...TypeScript [widens the type](https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwBIAHGHIgZwB4AVeAXnilQE8A+ACgEoAueagbgBQgiCAzwA3vAAe9eABYATPAC+c4qQqUp03uQwwsqAOaqOnIfCsB6a-AB6AfiA) of `x` to be `string | number`, instead of erroring.

If you're using JavaScript, you can declare the prop types using JSDoc:

```js
/** @type {{ x: string }} */
let { x } = $props();

// or use @typedef if you want to document the properties:

/**
 * @typedef {Object} MyProps
 * @property {string} y Some documentation
 */

/** @type {MyProps} */
let { y } = $props();
```

By default props are treated as readonly, meaning reassignments will not propagate upwards and mutations will result in a warning at runtime in development mode. You will also get a runtime error when trying to `bind:` to a readonly prop in a parent component. To declare props as bindable, use [`$bindable()`](#$bindable).

### What this replaces

`$props` replaces the `export let` and `export { x as y }` syntax for declaring props. It also replaces `$$props` and `$$restProps`, and the little-known `interface $$Props {...}` construct.

Note that you can still use `export const` and `export function` to expose things to users of your component (if they're using `bind:this`, for example).

## `$bindable`

To declare props as bindable, use `$bindable()`. Besides using them as regular props, the parent can (_can_, not _must_) then also `bind:` to them.

```svelte
<script>
	let { bindableProp = $bindable() } = $props();
</script>
```

You can pass an argument to `$bindable()`. This argument is used as a fallback value when the property is `undefined`.

```svelte
<script>
	let { bindableProp = $bindable('fallback') } = $props();
</script>
```

Note that the parent is not allowed to pass `undefined` to a property with a fallback if it `bind:`s to that property.

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

## `$host`

Retrieves the `this` reference of the custom element that contains this component. Example:

```svelte
<svelte:options customElement="my-element" />

<script>
	function greet(greeting) {
		$host().dispatchEvent(
			new CustomEvent('greeting', { detail: greeting })
		);
	}
</script>

<button onclick={() => greet('hello')}>say hello</button>
```

> Only available inside custom element components, and only on the client-side

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
