---
title: svelte/action
---

Actions are functions that are called when an element is created. They can return an object with a `destroy` method that is called after the element is unmounted:

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action}  */
	function foo(node) {
		// the node has been mounted in the DOM

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo />
```

An action can have a parameter. If the returned value has an `update` method, it will be called immediately after Svelte has applied updates to the markup whenever that parameter changes.

> Don't worry that we're redeclaring the `foo` function for every component instance — Svelte will hoist any functions that don't depend on local state out of the component definition.

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {string} */
	export let bar;

	/** @type {import('svelte/action').Action<HTMLElement, string>}  */
	function foo(node, bar) {
		// the node has been mounted in the DOM

		return {
			update(bar) {
				// the value of `bar` has changed
			},

			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo={bar} />
```

## Attributes

Sometimes actions emit custom events and apply custom attributes to the element they are applied to. To support this, actions typed with `Action` or `ActionReturn` type can have a last parameter, `Attributes`:

```svelte
<!--- file: App.svelte --->
<script>
	/**
	 * @type {import('svelte/action').Action<HTMLDivElement, { prop: any }, { 'on:emit': (e: CustomEvent<string>) => void }>}
	 */
	function foo(node, { prop }) {
		// the node has been mounted in the DOM

		//...LOGIC
		node.dispatchEvent(new CustomEvent('emit', { detail: 'hello' }));

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo={{ prop: 'someValue' }} on:emit={handleEmit} />
```

## Types

> TYPES: svelte/action
