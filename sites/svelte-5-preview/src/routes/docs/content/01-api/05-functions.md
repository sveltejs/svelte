---
title: Functions
---

As well as runes, Svelte 5 will introduce a couple of new functions, in addition to existing functions like `getContext`, `setContext` and `tick`. These are introduced as functions rather than runes because they are used directly and the compiler does not need to touch them to make them function as it does with runes. However, these functions may still use Svelte internals.

## `untrack`

To prevent something from being treated as an `$effect`/`$derived` dependency, use `untrack`:

```svelte
<script>
	import { untrack } from 'svelte';

	let { a, b } = $props();

	$effect(() => {
		// this will run when `a` changes,
		// but not when `b` changes
		console.log(a);
		console.log(untrack(() => b));
	});
</script>
```

## `unstate`

To remove reactivity from objects and arrays created with `$state`, use `unstate`:

```svelte
<script>
	import { unstate } from 'svelte';

	let counter = $state({ count: 0 });

	$effect(() => {
		// Will log { count: 0 }
		console.log(unstate(counter));
	});
</script>
```

This is handy when you want to pass some state to an external library or API that doesn't expect a reactive object – such as `structuredClone`.

For classes that might contain `$state`, the `UNSTATE_SYMBOL` can be imported and applied as a class method to enable deep unwrapped of reactive state
through class components:

```js
import { unstate, UNSTATE_SYMBOL } from 'svelte';

class Collection {
	#items = $state([]);

	add(item) {
		this.#items.push(item);
	}

	[UNSTATE_SYMBOL]() {
		return { items: unstate(this.#items) };
	}
}

const collection = new Collection();
collection.add('Hello world');

// Will log { items: ['Hello world'] }
console.log(unstate(collection));
```

> Note that `unstate` will return a new object from the input when removing reactivity. If the object passed isn't reactive, it will be returned as is.
