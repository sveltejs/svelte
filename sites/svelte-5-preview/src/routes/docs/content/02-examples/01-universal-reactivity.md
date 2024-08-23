---
title: Universal reactivity
---

In Svelte 5, you can create reactive state anywhere in your app — not just at the top level of your components.

Suppose we have a component like this:

```svelte
<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>
	clicks: {count}
</button>
```

We can encapsulate this logic in a function, so that it can be used in multiple places:

```diff
<script>
+	function createCounter() {
		let count = $state(0);

		function increment() {
			count += 1;
		}

+		return {
+			get count() { return count },
+			increment
+		};
+	}
+
+	const counter = createCounter();
</script>

-<button onclick={increment}>
-	clicks: {count}
+<button onclick={counter.increment}>
+	clicks: {counter.count}
</button>
```

> Note that we're using a [`get` property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) in the returned object, so that `counter.count` always refers to the current value rather than the value at the time the `createCounter` function was called.
>
> As a corollary, `const { count, increment } = createCounter()` won't work. That's because in JavaScript, [destructured declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) are evaluated at the time of destructuring — in other words, `count` will never update.

We can also extract that function out into a separate `.svelte.js` or `.svelte.ts` module...

```js
export function createCounter() {
	let count = $state(0);

	function increment() {
		count += 1;
	}

	return {
		get count() {
			return count;
		},
		increment
	};
}
```

...and import it into our component:

```diff
<script>
+	import { createCounter } from './counter.svelte.js';
-	function createCounter() {...}

	const counter = createCounter();
</script>

<button onclick={counter.increment}>
	clicks: {counter.count}
</button>
```

[See this example in the playground.](/#H4sIAAAAAAAAE2VQ0U7DMAz8FStC2iaqDl67dhLiMxgPI3NRRutUiYNAVf6dJG1TBk-W7bvznUfRqg6tqF5GQeceRSWehkEUgr-H2NhP7BhDb7UzMk5qK40a-HiiE6t-0IZhBGnwzPisHTEa8NAa3cOm3MtpUk4y5dVuDoEXmFKTZZjX0NwKbHcBVe_XQ1S_OWZNoEl2Sn404yKsKDB7JPbJUNraCvI-VR_VJoVjiNLri2oVXkTFxqEvcvJbt-sTrvb3A_ArhW4dSVbB0x_rMEYjHc7pQrY7ywGwfdjN2TMzm19Y8S-Rc9_AYwRH57EYZGdowbwv2istQ9L8MA19MdV8JimGpf__hFf_Ay1mGDQKAgAA)

## Stores equivalent

In Svelte 4, the way you'd do this is by creating a [custom store](https://learn.svelte.dev/tutorial/custom-stores), perhaps like this:

```js
import { writable } from 'svelte/store';

export function createCounter() {
	const { subscribe, update } = writable(0);

	function increment() {
		update((count) => count + 1);
	}

	return {
		subscribe,
		increment
	};
}
```

Back in the component, we retrieve the store value by prefixing its name with `$`:

```diff
<script>
	import { createCounter } from './counter.js';

	const counter = createCounter();
</script>

<button onclick={counter.increment}>
-	clicks: {counter.count}
+	clicks: {$counter}
</button>
```

The store approach has some significant drawbacks. A counter is just about the simplest custom store we could create, and yet we have to completely change how the code is written — importing `writable`, understanding its API, grabbing references to `subscribe` and `update`, changing the implementation of `increment` from `count += 1` to something far more cryptic, and prefixing the store name with a `$` to retrieve its value. That's a lot of stuff you need to understand.

With runes, we just copy the existing code into a new function.

## Gotchas

Reactivity doesn't magically cross function boundaries. In other words, replacing the `get` property with a regular property wouldn't work...

```diff
export function createCounter() {
	let count = $state(0);

	function increment() {
		count += 1;
	}

	return {
-		get count() { return count },
+		count,
		increment
	};
}
```

...because the value of `count` in the returned object would always be `0`. Using the `$state` rune doesn't change that fact — it simply means that when you _do_ read `count` (whether via a `get` property or a normal function) inside your template or inside an effect, Svelte knows what to update when `count` changes.
