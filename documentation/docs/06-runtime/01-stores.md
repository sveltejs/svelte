---
title: Stores
---

> [!NOTE] Prior to the introduction of runes, stores were the primary state management mechanism for anything that couldn't be expressed as component state or props. With runes — which can be used in [`.svelte.js/ts`](svelte-js-files) files as well as in components — stores are rarely necessary, though you will still sometimes encounter them when using Svelte.

A _store_ is an object that allows reactive access to a value via a simple [_store contract_](#Store-contract). The [`svelte/store`](../svelte-store) module contains minimal store implementations that fulfil this contract.

Inside a component, you can reference the store's value by prefixing it with the `$` character. (You cannot use this prefix to declare or import local variables, as it is reserved for store values.)

The component will subscribe to the store when it mounts, and unsubscribe when it unmounts. The store must be declared (or imported) at the top level of the component — not inside an `if` block or a function, for example.

If the store is [writable](#Store-contract-Writable-stores), assigning to (or mutating) the store value will result in a call to the store's `set` method.

```svelte
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count++;
	console.log($count); // logs 2
</script>
```

## Store contract

To be considered a store, an object must implement the [`Readable`](svelte-store#Readable) interface. It can additionally implement the [`Writable`](svelte-store#Writable) interface. Beyond that, a store can include whatever methods and properties it needs.

### Readable stores

A readable store is an object with a `subscribe(fn)` method, where `fn` is a subscriber function. This subscriber function must be immediately and synchronously called with the store's current value upon calling `subscribe`, and the function must be added to the store's list of subscribers. All of a store's subscribers must later be synchronously called whenever the store's value changes.

The `subscribe` method must return a function which, when called, removes the subscriber.

```ts
// @filename: index.ts
import type { Readable } from 'svelte/store';
const readable = {} as Readable<any>;
// ---cut---
const unsubscribe = readable.subscribe((value) => {
	console.log(value);
});

// later
unsubscribe();
```

> [!NOTE] Advanced: if a second argument is provided to `subscribe`, it must be called before the subscriber itself is called. This provides a mechanism for glitch-free updates.

### Writable stores

A writable store is a readable store with `set` and `update` methods.

The `set` method takes a new value...

```ts
// @filename: index.ts
import type { Writable } from 'svelte/store';
const writable = {} as Writable<string>;
// ---cut---
writable.set('new value');
```

...while the `update` method transforms the existing value:

```ts
// @filename: index.ts
import type { Writable } from 'svelte/store';
const writable = {} as Writable<string>;
const transform = (value: string) => value;
// ---cut---
writable.update((value) => transform(value));
```

Generally, these methods will have a synchronous effect but this is not required by the contract — for example in the case of [`spring`](svelte-motion#spring) and [`tweened`](svelte-motion#tweened) it will set a target value, and subscribers will be notified in `requestAnimationFrame` callbacks.

### RxJS interoperability

For interoperability with [RxJS Observables](https://rxjs.dev/guide/observable), the `subscribe` method is also allowed to return an `{ unsubscribe }` object rather than the function itself.

Note that unless `observable.subscribe(fn)` synchronously calls `fn` (which is not required by the Observable spec), Svelte will see the value of `$observable` as `undefined` until it does.

## Creating custom stores

In general, you won't be implementing the subscription logic yourself. Instead, you will use the reference implementations in [`svelte/store`](svelte/store) even if you expose a custom interface ([demo](/playground/hello-world#H4sIAAAAAAAAE42Q0U7DMAxFf8WKkNaKsm6vpa2EeOEfCA9t6mkRrVMlLgNV-XeUdssQQsBTHPvcm1zPgpoBRSGesO8NnIztO0iw04xdKjJx0D06UTzPgj_GwIWGyC6qh3HcujfsOfTaxuFPfWWIkdiJQpROWT1yLUmyHkZjGWY4Wc1N2yN4OFgzwGZV5o6Nxc29pEAfJlKsDYGy2DA-mokYbZLCHKaSlSEXzNzUhjdazMAhZzCNXcPBuorvJLv0bCrZIk-WLiaSr_JLR5OyOCBxAUkKVX12TBJabgS3sE8j3eEf9N1X2qLDSDrkZJeuIx8-yH795RpNrYmh-r6Be0llft0rlcd9vcAFzDdnlS_z476WVLYTsyEwpHqtXqv5PN_GlL6OZZmv9G-6mNfXsfyPbknu6-WIvMgE4zuLgu2E_sV_AkFYhfmdAgAA)):

```svelte
<!--- file: App.svelte --->
<script>
	import { writable } from 'svelte/store';

	function createCounter() {
		const { subscribe, set, update } = writable(0);

		return {
			subscribe,
			increment: () => update((n) => n + 1),
			decrement: () => update((n) => n - 1),
			reset: () => set(0)
		};
	}

	const counter = createCounter();
</script>

<h1>count: {$counter}</h1>
<button onclick={counter.increment}>increment</button>
<button onclick={counter.decrement}>decrement</button>
<button onclick={counter.reset}>reset</button>
```
