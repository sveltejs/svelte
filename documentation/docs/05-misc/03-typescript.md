---
title: TypeScript
---

You can use TypeScript within Svelte components. IDE extensions like the [Svelte VSCode extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) will help you catch errors right in your editor, and [`svelte-check`](https://www.npmjs.com/package/svelte-check) does the same on the command line, which you can integrate into your CI.

## Setup

To use TypeScript within Svelte components, you need to add a preprocessor that will turn TypeScript into JavaScript.

### Using SvelteKit or Vite

The easiest way to get started is scaffolding a new SvelteKit project by typing `npm create svelte@latest`, following the prompts and chosing the TypeScript option.

```ts
/// file: svelte.config.js
// @noErrors
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

If you don't need or want all the features SvelteKit has to offer, you can scaffold a Svelte-flavoured Vite project instead by typing `npm create vite@latest` and selecting the `svelte-ts` option.

```ts
/// file: svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

In both cases, a `svelte.config.js` with `vitePreprocess` will be added. Vite/SvelteKit will read from this config file.

### Other build tools

If you're using tools like Rollup or Webpack instead, install their respective Svelte plugins. For Rollup that's [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) and for Webpack that's [svelte-loader](https://github.com/sveltejs/svelte-loader). For both, you need to install `typescript` and `svelte-preprocess` and add the preprocessor to the plugin config (see the respective READMEs for more info). If you're starting a new project, you can also use the [rollup](https://github.com/sveltejs/template) or [webpack](https://github.com/sveltejs/template-webpack) template to scaffold the setup from a script.

> If you're starting a new project, we recommend using SvelteKit or Vite instead

## `<script lang="ts">`

To use TypeScript inside your Svelte components, add `lang="ts"` to your `script` tags:

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>
```

### Props

Props can be typed directly on the `export let` statement:

```svelte
<script lang="ts">
	export let name: string;
</script>
```

### Slots

Slot and slot prop types are inferred from the types of the slot props passed to them:

```svelte
<script lang="ts">
	export let name: string;
</script>

<slot {name} />

<!-- Later -->
<Comp let:name>
	<!--    ^ Inferred as string -->
	{name}
</Comp>
```

### Events

Events can be typed with `createEventDispatcher`:

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		event: null; // does not accept a payload
		type: string; // has a required string payload
		click: string | null; // has an optional string payload
	}>();

	function handleClick() {
		dispatch('event');
		dispatch('click', 'hello');
	}

	function handleType() {
		dispatch('event');
		dispatch('type', Math.random() > 0.5 ? 'world' : null);
	}
</script>

<button on:click={handleClick} on:keydown={handleType}>Click</button>
```

## Enhancing built-in DOM types

Svelte provides a best effort of all the HTML DOM types that exist. Sometimes you may want to use experimental attributes or custom events coming from an action. In these cases, TypeScript will throw a type error, saying that it does not know these types. If it's a non-experimental standard attribute/event, this may very well be a missing typing from our [HTML typings](https://github.com/sveltejs/svelte/blob/master/elements/index.d.ts). In that case, you are welcome to open an issue and/or a PR fixing it.

In case this is a custom or experimental attribute/event, you can enhance the typings like this:

```ts
/// file: additional-svelte-typings.d.ts
declare namespace svelteHTML {
	// enhance elements
	interface IntrinsicElements {
		'my-custom-element': { someattribute: string; 'on:event': (e: CustomEvent<any>) => void };
	}
	// enhance attributes
	interface HTMLAttributes<T> {
		// If you want to use on:beforeinstallprompt
		'on:beforeinstallprompt'?: (event: any) => any;
		// If you want to use myCustomAttribute={..} (note: all lowercase)
		mycustomattribute?: any; // You can replace any with something more specific if you like
	}
}
```

Then make sure that `d.ts` file is referenced in your `tsconfig.json`. If it reads something like `"include": ["src/**/*"]` and your `d.ts` file is inside `src`, it should work. You may need to reload for the changes to take effect.

## Experimental advanced typings

A few features are missing from taking full advantage of TypeScript in more advanced use cases like typing that a component implements a certain interface, explicitly typing slots, or using generics. These things are possible using experimental advanced type capabilities. See [this RFC](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md) for more information on how to make use of them.

> The API is experimental and may change at any point

## Limitations

### No TS in markup

You cannot use TypeScript in your template's markup. For example, the following does not work:

```svelte
<script lang="ts">
	let count = 10;
</script>

<h1>Count as string: {count as string}!</h1> <!-- ❌ Does not work -->
{#if count > 4}
	{@const countString: string = count} <!-- ❌ Does not work -->
	{countString}
{/if}
```

### Reactive Declarations

You cannot type your reactive declarations with TypeScript in the way you type a variable. For example, the following does not work:

```svelte
<script lang="ts">
	let count = 0;

	$: doubled: number = count * 2; // ❌ Does not work
</script>
```

You cannot add a `: TYPE` because it's invalid syntax in this position. Instead, you can move the definition to a `let` statement just above:

```svelte
<script lang="ts">
	let count = 0;

	let doubled: number;
	$: doubled = count * 2;
</script>
```

## Types

> TYPES: svelte
