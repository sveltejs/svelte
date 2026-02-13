---
title: $state
tags: rune-state
---

The `$state` rune allows you to create _reactive state_, which means that your UI _reacts_ when it changes.

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

Unlike other frameworks you may have encountered, there is no API for interacting with state — `count` is just a number, rather than an object or a function, and you can update it like you would update any other variable.

### Deep state

If `$state` is used with an array or a simple object, the result is a deeply reactive _state proxy_. [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) allow Svelte to run code when you read or write properties, including via methods like `array.push(...)`, triggering granular updates.

State is proxified recursively until Svelte finds something other than an array or simple object (like a class or an object created with `Object.create`). In a case like this...

```js
let todos = $state([
	{
		done: false,
		text: 'add more todos'
	}
]);
```

...modifying an individual todo's property will trigger updates to anything in your UI that depends on that specific property:

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
todos[0].done = !todos[0].done;
```

If you push a new object to the array, it will also be proxified:

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
todos.push({
	done: false,
	text: 'eat lunch'
});
```

> [!NOTE] When you update properties of proxies, the original object is _not_ mutated. If you need to use your own proxy handlers in a state proxy, [you should wrap the object _after_ wrapping it in `$state`](https://svelte.dev/playground/hello-world?version=latest#H4sIAAAAAAAACpWR3WoDIRCFX2UqhWyIJL3erAulL9C7XnQLMe5ksbUqOpsfln33YuyGFNJC8UKdc2bOhw7Myk9kJXsJ0nttO9jcR5KEG9AWJDwHdzwxznbaYGTl68Do5JM_FRifuh-9X8Y9Gkq1rYx4q66cJbQUWcmqqIL2VDe2IYMEbvuOikBADi-GJDSkXG-phId0G-frye2DO2psQYDFQ0Ys8gQO350dUkEydEg82T0GOs0nsSG9g2IqgxACZueo2ZUlpdvoDC6N64qsg1QKY8T2bpZp8gpIfbCQ85Zn50Ud82HkeY83uDjspenxv3jXcSDyjPWf9L1vJf0GH666J-jLu1ery4dV257IWXBWGa0-xFDMQdTTn2ScxWKsn86ROsLwQxqrVR5QM84Ij8TKFD2-cUZSm4O2LSt30kQcvwCgCmfZnAIAAA==).

Note that if you destructure a reactive value, the references are not reactive — as in normal JavaScript, they are evaluated at the point of destructuring:

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
let { done, text } = todos[0];

// this will not affect the value of `done`
todos[0].done = !todos[0].done;
```

### Classes

Class instances are not proxied. Instead, you can use `$state` in class fields (whether public or private), or as the first assignment to a property immediately inside the `constructor`:

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset() {
		this.text = '';
		this.done = false;
	}
}
```

> [!NOTE] The compiler transforms `done` and `text` into `get`/`set` methods on the class prototype referencing private fields. This means the properties are not enumerable.

When calling methods in JavaScript, the value of [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) matters. This won't work, because `this` inside the `reset` method will be the `<button>` rather than the `Todo`:

```svelte
<button onclick={todo.reset}>
	reset
</button>
```

You can either use an inline function...

```svelte
<button onclick=+++{() => todo.reset()}>+++
	reset
</button>
```

...or use an arrow function in the class definition:

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	+++reset = () => {+++
		this.text = '';
		this.done = false;
	}
}
```

### Built-in classes

Svelte provides reactive implementations of built-in classes like `Set`, `Map`, `Date` and `URL` that can be imported from [`svelte/reactivity`](svelte-reactivity).

## `$state.raw`

In cases where you don't want objects and arrays to be deeply reactive you can use `$state.raw`.

State declared with `$state.raw` cannot be mutated; it can only be _reassigned_. In other words, rather than assigning to a property of an object, or using an array method like `push`, replace the object or array altogether if you'd like to update it:

```js
let person = $state.raw({
	name: 'Heraclitus',
	age: 49
});

// this will have no effect
person.age += 1;

// this will work, because we're creating a new person
person = {
	name: 'Heraclitus',
	age: 50
};
```

This can improve performance with large arrays and objects that you weren't planning to mutate anyway, since it avoids the cost of making them reactive. Note that raw state can _contain_ reactive state (for example, a raw array of reactive objects).

As with `$state`, you can declare class fields using `$state.raw`.

## `$state.snapshot`

To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:

```svelte
<script>
	let counter = $state({ count: 0 });

	function onclick() {
		// Will log `{ count: ... }` rather than `Proxy { ... }`
		console.log($state.snapshot(counter));
	}
</script>
```

This is handy when you want to pass some state to an external library or API that doesn't expect a proxy, such as `structuredClone`.

## `$state.eager`

When state changes, it may not be reflected in the UI immediately if it is used by an `await` expression, because [updates are synchronized](await-expressions#Synchronized-updates).

In some cases, you may want to update the UI as soon as the state changes. For example, you might want to update a navigation bar when the user clicks on a link, so that they get visual feedback while waiting for the new page to load. To do this, use `$state.eager(value)`:

```svelte
<nav>
	<a href="/" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a>
	<a href="/about" aria-current={$state.eager(pathname) === '/about' ? 'page' : null}>about</a>
</nav>
```

Use this feature sparingly, and only to provide feedback in response to user action — in general, allowing Svelte to coordinate updates will provide a better user experience.

## Passing state into functions

JavaScript is a _pass-by-value_ language — when you call a function, the arguments are the _values_ rather than the _variables_. In other words:

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {number} a
 * @param {number} b
 */
function add(a, b) {
	return a + b;
}

let a = 1;
let b = 2;
let total = add(a, b);
console.log(total); // 3

a = 3;
b = 4;
console.log(total); // still 3!
```

If `add` wanted to have access to the _current_ values of `a` and `b`, and to return the current `total` value, you would need to use functions instead:

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {() => number} getA
 * @param {() => number} getB
 */
function add(+++getA, getB+++) {
	return +++() => getA() + getB()+++;
}

let a = 1;
let b = 2;
let total = add+++(() => a, () => b)+++;
console.log(+++total()+++); // 3

a = 3;
b = 4;
console.log(+++total()+++); // 7
```

State in Svelte is no different — when you reference something declared with the `$state` rune...

```js
let a = +++$state(1)+++;
let b = +++$state(2)+++;
```

...you're accessing its _current value_.

Note that 'functions' is broad — it encompasses properties of proxies and [`get`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)/[`set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) properties...

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {{ a: number, b: number }} input
 */
function add(input) {
	return {
		get value() {
			return input.a + input.b;
		}
	};
}

let input = $state({ a: 1, b: 2 });
let total = add(input);
console.log(total.value); // 3

input.a = 3;
input.b = 4;
console.log(total.value); // 7
```

...though if you find yourself writing code like that, consider using [classes](#Classes) instead.

## Passing state across modules

You can declare state in `.svelte.js` and `.svelte.ts` files, but you can only _export_ that state if it's not directly reassigned. In other words you can't do this:

```js
/// file: state.svelte.js
export let count = $state(0);

export function increment() {
	count += 1;
}
```

That's because every reference to `count` is transformed by the Svelte compiler — the code above is roughly equivalent to this:

```js
/// file: state.svelte.js (compiler output)
// @filename: index.ts
interface Signal<T> {
	value: T;
}

interface Svelte {
	state<T>(value?: T): Signal<T>;
	get<T>(source: Signal<T>): T;
	set<T>(source: Signal<T>, value: T): void;
}
declare const $: Svelte;
// ---cut---
export let count = $.state(0);

export function increment() {
	$.set(count, $.get(count) + 1);
}
```

> [!NOTE] You can see the code Svelte generates by clicking the 'JS Output' tab in the [playground](/playground).

Since the compiler only operates on one file at a time, if another file imports `count` Svelte doesn't know that it needs to wrap each reference in `$.get` and `$.set`:

```js
// @filename: state.svelte.js
export let count = 0;

// @filename: index.js
// ---cut---
import { count } from './state.svelte.js';

console.log(typeof count); // 'object', not 'number'
```

This leaves you with two options for sharing state between modules — either don't reassign it...

```js
// This is allowed — since we're updating
// `counter.count` rather than `counter`,
// Svelte doesn't wrap it in `$.state`
export const counter = $state({
	count: 0
});

export function increment() {
	counter.count += 1;
}
```

...or don't directly export it:

```js
let count = $state(0);

export function getCount() {
	return count;
}

export function increment() {
	count += 1;
}
```
