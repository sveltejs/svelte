---
title: 'svelte/store'
---

The `svelte/store` module exports functions for creating [readable](/docs/svelte-store#readable), [writable](/docs/svelte-store#writable) and [derived](/docs/svelte-store#derived) stores.

Keep in mind that you don't _have_ to use these functions to enjoy the [reactive `$store` syntax](/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) in your components. Any object that correctly implements the `subscribe` (including returning unsubscribe functions) and (optionally) `set` methods is a valid store, and will work both with the special syntax and with Svelte's built-in [derived stores](/docs/svelte-store#derived).

This makes it possible to wrap almost any other reactive state handling library for use in Svelte. Read more about the [store contract](/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) to see what a correct implementation looks like.

## `writable`

> EXPORT_SNIPPET: svelte/store#writable

Function that creates a store which has values that can be set from 'outside' components. It gets created as an object with additional `set` and `update` methods.

`set` is a method that takes one argument which is the value to be set. The store value gets set to the value of the argument if the store value is not already equal to it.

`update` is a method that takes one argument which is a callback. The callback takes the existing store value as its argument and returns the new value to be set to the store.

```ts
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe((value) => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update((n) => n + 1); // logs '2'
```

If a function is passed as the second argument, it will be called when the number of subscribers goes from zero to one (but not from one to two, etc). That function will be passed a `set` function which changes the value of the store, and an `update` function which works like the `update` method on the store, taking a callback to calculate the store's new value from its old value. It must return a `stop` function that is called when the subscriber count goes from one to zero.

```ts
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

Creates a store which can be subscribed to, but does not have the `set` and `update` methods that a writable store has. The value of a readable store is instead set by the `initial_value` argument at creation and then updated internally by an `on_start` function. This function is called when the store receives its first subscriber.

The `on_start` function allows the creation of stores whose value changes automatically based on application-specific logic. It's passed `set` and `update` functions that behave like the methods available on writable stores.

The `on_start` function can optionally return an `on_stop` function which will be called when the store loses its last subscriber. This allows stores to go dormant when not being used by any other code.

```ts
import { readable } from 'svelte/store';

const lastPressedSimpleKey = readable('', (set) => {
	const handleEvent = (event: KeyboardEvent) => {
		if (event.key.length === 1) {
			set(event.key);
		}
	};

	window.addEventListener('keypress', handleEvent, { passive: true });

	return function onStop() {
		window.removeEventListener('keypress', handleEvent);
	};
});

lastPressedSimpleKey.subscribe((value) => {
	console.log(`Most recently pressed simple key is "${value}".`);
});
```

`on_start` could also set up a timer to poll an API for data which changes frequently, or even establish a WebSocket connection. The following example creates a store which polls [Open Notify's public ISS position API](http://open-notify.org/Open-Notify-API/ISS-Location-Now/) every 3 seconds.

> If `set` or `update` are called after the store has lost its last subscriber, they will have no effect. You should still take care to clean up any asynchronous callbacks registered in `on_start` by providing a suitable `on_stop` function, but a few accidental late calls will not negatively affect the store.
>
> For instance, in the example below `set` may be called late if the `issPosition` store loses its last subscriber after a `fetch` call is made but before the corresponding HTTP response is received.

```ts
import { readable } from 'svelte/store';

const issPosition = readable({ latitude: 0, longitude: 0 }, (set) => {
	const interval = setInterval(() => {
		fetch('http://api.open-notify.org/iss-now.json')
			.then((response) => response.json())
			.then((payload) => set(payload.iss_position));
	}, 3000);

	return function onStop() {
		clearInterval(interval);
	};
});

issPosition.subscribe(({ latitude, longitude }) => {
	console.log(
		`The ISS is currently above ${latitude}°, ${longitude}°` +
			` in the ${latitude > 0 ? 'northern' : 'southern'} hemisphere.`
	);
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

The `derive_value` function can set values asynchronously by accepting a second argument, `set`, and an optional third argument, `update`, and calling either or both of these functions when appropriate.

> If `set` and `update` are, in combination, called multiple times synchronously, only the last change will cause the store's subscribers to be notified. For instance, calling `update` and then `set` synchronously in a `derive_value` function will only cause the value passed to `set` to be sent to subscribers.

In this case, you can also pass a third argument to `derived` — the initial value of the derived store before `set` or `update` is first called. If no initial value is specified, the store's initial value will be `undefined`.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// @errors: 18046 2769 7006 2722
// ---cut---
import { derived } from 'svelte/store';

const delayed = derived(
	a,
	($a, set) => {
		setTimeout(() => set($a), 1000);
	},
	2000
);

const delayedIncrement = derived(a, ($a, set, update) => {
	set($a);
	setTimeout(() => update((x) => x + 1), 1000);
	// every time $a produces a value, this produces two
	// values, $a immediately and then $a + 1 a second later
});
```

If you return a function from the `derive_value` function, it will be called a) before the function runs again, or b) after the last subscriber unsubscribes.

```ts
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

### TypeScript type inference

If a multi-argument `derive_value` function is passed to `derive`, TypeScript may not be able to infer the type of the derived store, yielding a store of type `Readable<unknown>`. Set an initial value for the store to resolve this; `undefined` with a type assertion is sufficient. Alternatively, you may use type arguments, although this requires specifying the types of the dependency stores, too.

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

// @errors: 2769
const aInc = derived(
	a,
	($a, set) => setTimeout(() => set($a + 1), 1000),
	undefined as unknown as number
);

const concatenated = derived<[number, number], string>([a, aInc], ([$a, $aInc], set) =>
	setTimeout(() => set(`${$a}${$aInc}`), 1000)
);
```

`derived` can derive new stores from stores not created by Svelte, including from RxJS `Observable`s. In this case, TypeScript may not be able to infer the types of data held by the dependency stores. Use a type assertion to `ExternalStore` or a type argument to provide the missing context.

Until TypeScript gains support for [partial type argument inference](https://github.com/microsoft/TypeScript/issues/26242), the latter option requires also specifying the return type of `derive_store`.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
	const observable: {
		subscribe: (fn: (value: unknown) => void) => { unsubscribe: () => void };
	};
}

export {};

// @filename: index.ts
// ---cut---
import { derived, type ExternalStore } from 'svelte/store';

const sum = derived(
	[a, observable as ExternalStore<number>],
	([$a, $observable]) => $a + $observable
);

const sumMore = derived<[number, number], number>(
	[sum, observable],
	([$sum, $observable]) => $sum + $observable
);
```

## `readonly`

> EXPORT_SNIPPET: svelte/store#readonly

This simple helper function makes a store readonly. You can still subscribe to the changes from the original one using this new readable store.

```ts
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

> By default, `get` subscribes to the given store, makes note of its value, then unsubscribes again. Passing `true` as a second argument causes `get` to directly read the internal state of the store instead, which, in the case of a derived store, may be outdated or `undefined`. Where performance is important, it's recommended to set `allow_stale` to `true` or not use `get`.

```ts
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
