---
title: export let
---

Svelte uses the `export` keyword to mark a variable declaration as a _property_ or _prop_, which means it becomes accessible to consumers of the component (see the section on [attributes and props](/docs/basic-markup#attributes-and-props) for more information).

```svelte
<script>
	export let foo;

	// Values that are passed in as props
	// are immediately available
	console.log({ foo });
</script>
```

You can specify a default initial value for a prop. It will be used if the component's consumer doesn't specify the prop on the component (or if its initial value is `undefined`) when instantiating the component. Note that if the values of props are subsequently updated, then any prop whose value is not specified will be set to `undefined` (rather than its initial value).

In development mode (see the [compiler options](/docs/svelte-compiler#compile)), a warning will be printed if no default initial value is provided and the consumer does not specify a value. To squelch this warning, ensure that a default initial value is specified, even if it is `undefined`.

```svelte
<script>
	export let bar = 'optional default initial value';
	export let baz = undefined;
</script>
```

If you export a `const`, `class` or `function`, it is readonly from outside the component. Functions are valid prop values, however, as shown below.

```svelte
<!--- file: App.svelte --->
<script>
	// these are readonly
	export const thisIs = 'readonly';

	/** @param {string} name */
	export function greet(name) {
		alert(`hello ${name}!`);
	}

	// this is a prop
	export let format = (n) => n.toFixed(2);
</script>
```

Readonly props can be accessed as properties on the element, tied to the component using [`bind:this` syntax](/docs/component-directives#bind-this).

You can use reserved words as prop names.

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {string} */
	let className;

	// creates a `class` property, even
	// though it is a reserved word
	export { className as class };
</script>
```

> [!NOTE]
> In Svelte 5+, use the [`$props`]($props) rune instead
