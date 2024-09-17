---
title: Transitions & Animations
---

- how to use (template syntax)
- when to use
- global vs local
- easing & motion
- mention imports
- key block

Svelte provides different techniques and syntax for incorporating motion into your Svelte projects.

## transition:_fn_

```svelte
<!--- copy: false --->
transition:fn
```

```svelte
<!--- copy: false --->
transition:fn={params}
```

```svelte
<!--- copy: false --->
transition:fn|global
```

```svelte
<!--- copy: false --->
transition:fn|global={params}
```

```svelte
<!--- copy: false --->
transition:fn|local
```

```svelte
<!--- copy: false --->
transition:fn|local={params}
```

```js
/// copy: false
// @noErrors
transition = (node: HTMLElement, params: any, options: { direction: 'in' | 'out' | 'both' }) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

A transition is triggered by an element entering or leaving the DOM as a result of a state change.

When a block is transitioning out, all elements inside the block, including those that do not have their own transitions, are kept in the DOM until every transition in the block has been completed.

The `transition:` directive indicates a _bidirectional_ transition, which means it can be smoothly reversed while the transition is in progress.

```svelte
{#if visible}
	<div transition:fade>fades in and out</div>
{/if}
```

Transitions are local by default. Local transitions only play when the block they belong to is created or destroyed, _not_ when parent blocks are created or destroyed.

```svelte
{#if x}
	{#if y}
		<p transition:fade>fades in and out only when y changes</p>

		<p transition:fade|global>fades in and out when x or y change</p>
	{/if}
{/if}
```

> By default intro transitions will not play on first render. You can modify this behaviour by setting `intro: true` when you [create a component](/docs/runtime/imperative-component-api) and marking the transition as `global`.

## Transition parameters

Transitions can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```svelte
{#if visible}
	<div transition:fade={{ duration: 2000 }}>fades in and out over two seconds</div>
{/if}
```

## Custom transition functions

Transitions can use custom functions. If the returned object has a `css` function, Svelte will create a CSS animation that plays on the element.

The `t` argument passed to `css` is a value between `0` and `1` after the `easing` function has been applied. _In_ transitions run from `0` to `1`, _out_ transitions run from `1` to `0` — in other words, `1` is the element's natural state, as though no transition had been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly _before_ the transition begins, with different `t` and `u` arguments.

```svelte
<!--- file: App.svelte --->
<script>
	import { elasticOut } from 'svelte/easing';

	/** @type {boolean} */
	export let visible;

	/**
	 * @param {HTMLElement} node
	 * @param {{ delay?: number, duration?: number, easing?: (t: number) => number }} params
	 */
	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>whooshes in</div>
{/if}
```

A custom transition function can also return a `tick` function, which is called _during_ the transition with the same `t` and `u` arguments.

> If it's possible to use `css` instead of `tick`, do so — CSS animations can run off the main thread, preventing jank on slower devices.

```svelte
<!--- file: App.svelte --->
<script>
	export let visible = false;

	/**
	 * @param {HTMLElement} node
	 * @param {{ speed?: number }} params
	 */
	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter={{ speed: 1 }}>The quick brown fox jumps over the lazy dog</p>
{/if}
```

If a transition returns a function instead of a transition object, the function will be called in the next microtask. This allows multiple transitions to coordinate, making [crossfade effects](/tutorial/deferred-transitions) possible.

Transition functions also receive a third argument, `options`, which contains information about the transition.

Available values in the `options` object are:

- `direction` - one of `in`, `out`, or `both` depending on the type of transition

## Transition events

An element with transitions will dispatch the following events in addition to any standard DOM events:

- `introstart`
- `introend`
- `outrostart`
- `outroend`

```svelte
{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
		on:introstart={() => (status = 'intro started')}
		on:outrostart={() => (status = 'outro started')}
		on:introend={() => (status = 'intro ended')}
		on:outroend={() => (status = 'outro ended')}
	>
		Flies in and out
	</p>
{/if}
```

## in:_fn_/out:_fn_

```svelte
<!--- copy: false --->
in:fn
```

```svelte
<!--- copy: false --->
in:fn={params}
```

```svelte
<!--- copy: false --->
in:fn|global
```

```svelte
<!--- copy: false --->
in:fn|global={params}
```

```svelte
<!--- copy: false --->
in:fn|local
```

```svelte
<!--- copy: false --->
in:fn|local={params}
```

```svelte
<!--- copy: false --->
out:fn
```

```svelte
<!--- copy: false --->
out:fn={params}
```

```svelte
<!--- copy: false --->
out:fn|global
```

```svelte
<!--- copy: false --->
out:fn|global={params}
```

```svelte
<!--- copy: false --->
out:fn|local
```

```svelte
<!--- copy: false --->
out:fn|local={params}
```

Similar to `transition:`, but only applies to elements entering (`in:`) or leaving (`out:`) the DOM.

Unlike with `transition:`, transitions applied with `in:` and `out:` are not bidirectional — an in transition will continue to 'play' alongside the out transition, rather than reversing, if the block is outroed while the transition is in progress. If an out transition is aborted, transitions will restart from scratch.

```svelte
{#if visible}
	<div in:fly out:fade>flies in, fades out</div>
{/if}
```

## animate:_fn_

```svelte
<!--- copy: false --->
animate:name
```

```svelte
<!--- copy: false --->
animate:name={params}
```

```js
/// copy: false
// @noErrors
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

```ts
/// copy: false
// @noErrors
DOMRect {
	bottom: number,
	height: number,
	​​left: number,
	right: number,
	​top: number,
	width: number,
	x: number,
	y: number
}
```

An animation is triggered when the contents of a [keyed each block](control-flow#each) are re-ordered. Animations do not run when an element is added or removed, only when the index of an existing data item within the each block changes. Animate directives must be on an element that is an _immediate_ child of a keyed each block.

Animations can be used with Svelte's [built-in animation functions](/docs/svelte/reference/svelte-animate) or [custom animation functions](#custom-animation-functions).

```svelte
<!-- When `list` is reordered the animation will run-->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

## Animation Parameters

As with actions and transitions, animations can have parameters.

(The double `{{curlies}}` aren't a special syntax; this is an object literal inside an expression tag.)

```svelte
{#each list as item, index (item)}
	<li animate:flip={{ delay: 500 }}>{item}</li>
{/each}
```

## Custom animation functions

Animations can use custom functions that provide the `node`, an `animation` object and any `parameters` as arguments. The `animation` parameter is an object containing `from` and `to` properties each containing a [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect#Properties) describing the geometry of the element in its `start` and `end` positions. The `from` property is the DOMRect of the element in its starting position, and the `to` property is the DOMRect of the element in its final position after the list has been reordered and the DOM updated.

If the returned object has a `css` method, Svelte will create a CSS animation that plays on the element.

The `t` argument passed to `css` is a value that goes from `0` and `1` after the `easing` function has been applied. The `u` argument is equal to `1 - t`.

The function is called repeatedly _before_ the animation begins, with different `t` and `u` arguments.

<!-- TODO: Types -->

```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) => `transform: translate(${u * dx}px, ${u * dy}px) rotate(${t * 360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

A custom animation function can also return a `tick` function, which is called _during_ the animation with the same `t` and `u` arguments.

> If it's possible to use `css` instead of `tick`, do so — CSS animations can run off the main thread, preventing jank on slower devices.

```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			tick: (t, u) => Object.assign(node.style, { color: t > 0.5 ? 'Pink' : 'Blue' })
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

## {#key ...}

```svelte
<!--- copy: false  --->
{#key expression}...{/key}
```

Key blocks destroy and recreate their contents when the value of an expression changes.

This is useful if you want an element to play its transition whenever a value changes.

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```

When used around components, this will cause them to be reinstantiated and reinitialised.

```svelte
{#key value}
	<Component />
{/key}
```
