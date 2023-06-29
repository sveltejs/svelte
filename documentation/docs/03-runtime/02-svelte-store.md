---
title: 'svelte/store'
---

The `svelte/store` module exports functions for creating [readable](/docs/svelte-store#readable), [writable](/docs/svelte-store#writable) and [derived](/docs/svelte-store#derived) stores.

Keep in mind that you don't _have_ to use these functions to enjoy the [reactive `$store` syntax](/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) in your components. Any object that correctly implements `.subscribe`, unsubscribe, and (optionally) `.set` is a valid store, and will work both with the special syntax, and with Svelte's built-in [`derived` stores](/docs/svelte-store#derived).

This makes it possible to wrap almost any other reactive state handling library for use in Svelte. Read more about the [store contract](/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) to see what a correct implementation looks like.

## `writable`

> EXPORT_SNIPPET: svelte/store#writable

Function that creates a store which has values that can be set from 'outside' components. It gets created as an object with additional `set` and `update` methods.

`set` is a method that takes one argument which is the value to be set. The store value gets set to the value of the argument if the store value is not already equal to it.

`update` is a method that takes one argument which is a callback. The callback takes the existing store value as its argument and returns the new value to be set to the store.

```js
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe((value) => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update((n) => n + 1); // logs '2'
```

If a function is passed as the second argument, it will be called when the number of subscribers goes from zero to one (but not from one to two, etc). That function will be passed a `set` function which changes the value of the store, and an `update` function which works like the `update` method on the store, taking a callback to calculate the store's new value from its old value. It must return a `stop` function that is called when the subscriber count goes from one to zero.

```js
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0, () => {
	console.log('got a subscriber');
	return () => console.log('no more subscribers');
});

count.set(1); // does nothing

const unsubscribe = count.subscribe((value) => {
	console.log(value);
}); // logs 'got a subscriber', then '1'

unsubscribe(); // logs 'no more subscribers'
```

Note that the value of a `writable` is lost when it is destroyed, for example when the page is refreshed. However, you can write your own logic to sync the value to for example the `localStorage`.

## `readable`

> EXPORT_SNIPPET: svelte/store#readable

Creates a store whose value cannot be set from 'outside', the first argument is the store's initial value, and the second argument to `readable` is the same as the second argument to `writable`.

```js
<!--- file: App.svelte --->
// ---cut---
import { readable } from 'svelte/store';

const time = readable(new Date(), (set) => {
	set(new Date());

	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

const ticktock = readable('tick', (set, update) => {
	const interval = setInterval(() => {
		update((sound) => (sound === 'tick' ? 'tock' : 'tick'));
	}, 1000);

	return () => clearInterval(interval);
});
```

## `derived`

> EXPORT_SNIPPET: svelte/store#derived

Derives a store from one or more other stores. The callback runs initially when the first subscriber subscribes and then whenever the store dependencies change.

In the simplest version, `derived` takes a single store, and the callback returns a derived value.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const doubled = derived(a, ($a) => $a * 2);
```

The callback can set a value asynchronously by accepting a second argument, `set`, and an optional third argument, `update`, calling either or both of them when appropriate.

In this case, you can also pass a third argument to `derived` — the initial value of the derived store before `set` or `update` is first called. If no initial value is specified, the store's initial value will be `undefined`.

```js
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// @errors: 18046 2769 7006
// ---cut---
import { derived } from 'svelte/store';

const delayed = derived(a, ($a, set) => {
	setTimeout(() => set($a), 1000);
}, 2000);

const delayedIncrement = derived(a, ($a, set, update) => {
	set($a);
	setTimeout(() => update(x => x + 1), 1000);
	// every time $a produces a value, this produces two
	// values, $a immediately and then $a + 1 a second later
});
```

If you return a function from the callback, it will be called when a) the callback runs again, or b) the last subscriber unsubscribes.

```js
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const frequency: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const tick = derived(
	frequency,
	($frequency, set) => {
		const interval = setInterval(() => {
			set(Date.now());
		}, 1000 / $frequency);

		return () => {
			clearInterval(interval);
		};
	},
	2000
);
```

In both cases, an array of arguments can be passed as the first argument instead of a single store.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
	const b: Writable<number>;
}

export {};

// @filename: index.ts

// ---cut---
import { derived } from 'svelte/store';

const summed = derived([a, b], ([$a, $b]) => $a + $b);

const delayed = derived([a, b], ([$a, $b], set) => {
	setTimeout(() => set($a + $b), 1000);
});
```

## `readonly`

> EXPORT_SNIPPET: svelte/store#readonly

This simple helper function makes a store readonly. You can still subscribe to the changes from the original one using this new readable store.

```js
import { readonly, writable } from 'svelte/store';

const writableStore = writable(1);
const readableStore = readonly(writableStore);

readableStore.subscribe(console.log);

writableStore.set(2); // console: 2
// @errors: 2339
readableStore.set(2); // ERROR
```

## `get`

> EXPORT_SNIPPET: svelte/store#get

Generally, you should read the value of a store by subscribing to it and using the value as it changes over time. Occasionally, you may need to retrieve the value of a store to which you're not subscribed. `get` allows you to do so.

> This works by creating a subscription, reading the value, then unsubscribing. It's therefore not recommended in hot code paths.

```js
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const store: Writable<string>;
}

export {};

// @filename: index.ts
// ---cut---
import { get } from 'svelte/store';

const value = get(store);
```

## Types

> TYPES: svelte/store
