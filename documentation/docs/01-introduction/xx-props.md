---
title: Public API of a component
---

### Public API of a component

Svelte uses the `$props` rune to declare _properties_ or _props_, which means describing the public interface of the component which becomes accessible to consumers of the component.

> [!NOTE] `$props` is one of several runes, which are special hints for Svelte's compiler to make things reactive.

```svelte
<script>
	let { foo, bar, baz } = $props();

	// Values that are passed in as props
	// are immediately available
	console.log({ foo, bar, baz });
</script>
```

You can specify a fallback value for a prop. It will be used if the component's consumer doesn't specify the prop on the component when instantiating the component, or if the passed value is `undefined` at some point.

```svelte
<script>
	let { foo = 'optional default initial value' } = $props();
</script>
```

To get all properties, use rest syntax:

```svelte
<script>
	let { a, b, c, ...everythingElse } = $props();
</script>
```

You can use reserved words as prop names.

```svelte
<script>
	// creates a `class` property, even
	// though it is a reserved word
	let { class: className } = $props();
</script>
```

If you're using TypeScript, you can declare the prop types:

```svelte
<script lang="ts">
	interface Props {
		required: string;
		optional?: number;
		[key: string]: unknown;
	}

	let { required, optional, ...everythingElse }: Props = $props();
</script>
```

If you're using JavaScript, you can declare the prop types using JSDoc:

```svelte
<script>
	/** @type {{ x: string }} */
	let { x } = $props();

	// or use @typedef if you want to document the properties:

	/**
	 * @typedef {Object} MyProps
	 * @property {string} y Some documentation
	 */

	/** @type {MyProps} */
	let { y } = $props();
</script>
```

If you export a `const`, `class` or `function`, it is readonly from outside the component.

```svelte
<script>
	export const thisIs = 'readonly';

	export function greet(name) {
		alert(`hello ${name}!`);
	}
</script>
```

Readonly props can be accessed as properties on the element, tied to the component using [`bind:this` syntax](bindings#bind:this).

### Reactive variables

To change component state and trigger a re-render, just assign to a locally declared variable that was declared using the `$state` rune.

Update expressions (`count += 1`) and property assignments (`obj.x = y`) have the same effect.

```svelte
<script>
	let count = $state(0);

	function handleClick() {
		// calling this function will trigger an
		// update if the markup references `count`
		count = count + 1;
	}
</script>
```

Svelte's `<script>` blocks are run only when the component is created, so assignments within a `<script>` block are not automatically run again when a prop updates.

```svelte
<script>
	let { person } = $props();
	// this will only set `name` on component creation
	// it will not update when `person` does
	let { name } = person;
</script>
```

If you'd like to react to changes to a prop, use the `$derived` or `$effect` runes instead.

```svelte
<script>
	let count = $state(0);

	let double = $derived(count * 2);

	$effect(() => {
		if (count > 10) {
			alert('Too high!');
		}
	});
</script>
```

For more information on reactivity, read the documentation around runes.
