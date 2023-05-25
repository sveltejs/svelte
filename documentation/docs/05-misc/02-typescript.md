---
title: TypeScript
---

You can use TypeScript to type your Svelte components. The Svelte VSCode extension and the [`svelte-check` CLI](https://www.npmjs.com/package/svelte-check) will check your code for errors and provide hints about how to fix them.

## Setup

Install `typescript` and `svelte-preprocess`:

```sh
npm install typescript svelte-preprocess --save-dev
```

Then, create a `svelte.config.js` file at the root of your project(if it doesn't exist already) and add the following:

```ts
import preprocess from 'svelte-preprocess';

const config = {
	preprocess: preprocess()
};

export default config;
```

The line `preprocess: preprocess()` is the important one.

### Using Vite or SvelteKit

If you're using `vite-plugin-svelte`, which is part of SvelteKit and also used in the Vite Svelte template, you can use `vitePreprocess`. It is slightly faster and does not require installing additional dependencies such as `svelte-preprocess`.

```ts
/// file: svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

If you're using SvelteKit, `vitePreprocess` can be imported from `@sveltejs/kit/vite`

```ts
/// file: svelte.config.js
// @noErrors
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

## `<script lang="ts">`

To add types to your JavaScript inside the `<script>` tag, you can use the `script` tag's `lang` attribute:

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>
```

This enables all TypeScript features inside your Svelte components.

## Props

Props can be directly typed by using the `export let` syntax:

```svelte
<script lang="ts">
	export let name: string;
</script>
```

> See this [guide](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-props) for more information about the experimental `$$Props` interface.

## Slots

Slot and slot prop types are inferred from the types of the slot props passed to them.

For example:

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

> See this [guide](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-slots) for more information about the experimental `$$Slots` interface.

## Events

Events can be typed with `createEventDispatcher`:

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		click: string;
		type: string;
	}>();

	function handleClick() {
		dispatch('click', { detail: 'hello' });
	}

	function handleType() {
		dispatch('type', { detail: 'world' });
	}
</script>

<button on:click={handleClick} on:keydown={handleType}>Click</button>
```

However, sometimes an event dispatcher may be coming from another module. For example:

```svelte
<script>
	import { mixinDispatch } from 'somewhere';

	function handleClick() {
		mixinDispatch.mixinEvent('foo');
	}
</script>

<button on:click={handleClick}>Mixin</button>
```

In this case, Svelte can't understand the custom event types, so you can use the experimental `$$Events` interface.

> See this [guide](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md#typing-events) for more information about the experimental `$$Events` interface.

## Limitations

### No TS in markup

You cannot use TypeScript in your template's markup. For example, the following does not work:

```svelte
<script lang="ts">
	let count = 10;
</script>

<h1>Count as string: {count as string}!</h1> <!-- ❌ Does not work -->
```

Or with `{@const}`

```svelte
{@const countString: string = count} <!-- ❌ Does not work -->
{@const countString = count as string} <!-- ❌ Does not work -->
```

### Reactive Declarations

You cannot type your reactive declarations with TypeScript in the way you type a variable. For example, the following does not work:

```svelte
<script lang="ts">
	let count = 0;

	$: doubled: number = count * 2; // ❌ Does not work
</script>
```

You cannot add a `: TYPE` after variable declaration's variable. Instead, you can use the `as` or `satisfies` keyword:

```svelte
<script lang="ts">
	let count = 0;

	$: doubled = (count * 2) as number;
	$: doubled = (count * 2) satisfies number;
</script>
```

## Types

> TYPES: svelte
