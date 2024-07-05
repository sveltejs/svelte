---
title: Component fundamentals
---

- script (module) / template / style (rough overview)
- `$props` / `$state` (in the context of components)

Components are the building blocks of Svelte applications. They are written into `.svelte` files, using a superset of HTML.

All three sections — script, styles and markup — are optional.

```svelte
<script>
	// logic goes here
</script>

<!-- markup (zero or more items) goes here -->

<style>
	/* styles go here */
</style>
```

## &lt;script&gt;

A `<script>` block contains JavaScript (or TypeScript, when adding the `lang="ts"` attribute) that runs when a component instance is created. Variables declared (or imported) at the top level are 'visible' from the component's markup.

### Public API of a component

Svelte uses the `$props` rune to declare _properties_ or _props_, which means describing the public interface of the component which becomes accessible to consumers of the component.

> `$props` is one of several runes, which are special hints for Svelte's compiler to make things reactive.

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
		a: number;
		b: boolean;
		c: string;
		[key: string]: unknown;
	}

	let { a, b, c, ...everythingElse }: Props = $props();
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

Readonly props can be accessed as properties on the element, tied to the component using [`bind:this` syntax](/docs/component-directives#bind-this).

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

## &lt;script context="module"&gt;

A `<script>` tag with a `context="module"` attribute runs once when the module first evaluates, rather than for each component instance. Values declared in this block are accessible from a regular `<script>` (and the component markup) but not vice versa.

You can `export` bindings from this block, and they will become exports of the compiled module.

You cannot `export default`, since the default export is the component itself.

```svelte
<script context="module">
	let totalComponents = 0;

	// the export keyword allows this function to imported with e.g.
	// `import Example, { alertTotal } from './Example.svelte'`
	export function alertTotal() {
		alert(totalComponents);
	}
</script>

<script>
	totalComponents += 1;
	console.log(`total number of times this component has been created: ${totalComponents}`);
</script>
```

## &lt;style&gt;

CSS inside a `<style>` block will be scoped to that component.

```svelte
<style>
	p {
		/* this will only affect <p> elements in this component */
		color: burlywood;
	}
</style>
```

For more information regarding styling, read the documentation around [styles and classes](styles-and-classes).
