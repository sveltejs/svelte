---
title: $state
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

> [!NOTE] Classes like `Set` and `Map` will not be proxied, but Svelte provides reactive implementations for various built-ins like these that can be imported from [`svelte/reactivity`](./svelte-reactivity).

State is proxified recursively until Svelte finds something other than an array or simple object. In a case like this...

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
// @filename: ambient.d.ts
declare global {
	const todos: Array<{ done: boolean, text: string }>
}

// @filename: index.js
// ---cut---
todos[0].done = !todos[0].done;
```

If you push a new object to the array, it will also be proxified:

```js
// @filename: ambient.d.ts
declare global {
	const todos: Array<{ done: boolean, text: string }>
}

// @filename: index.js
// ---cut---
todos.push({
	done: false,
	text: 'eat lunch'
});
```

> [!NOTE] When you update properties of proxies, the original object is _not_ mutated.

Since `$state` stops at boundaries that are not simple arrays or objects, the following will not trigger any reactivity:

```svelte
<script>
	class Todo {
		done = false;
		text;

		constructor(text) {
			this.text = text;
		}
	}

	let todo = $state(new Todo('Buy groceries'));
</script>

<button onclick={
	// this won't trigger a rerender
	todo.done = !todo.done
}>
	[{todo.done ? 'x' : ' '}] {todo.text}
</button>
```

You can however use `$state` _inside_ the class to make it work, as explained in the next section.

### Classes

You can use `$state` in class fields (whether public or private):

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);
	text = $state();

	constructor(text) {
		this.text = text;
	}

	reset() {
		this.text = '';
		this.done = false;
	}
}
```

Under the hood, the compiler transforms `done` and `text` into `get`/`set` methods on the class prototype referencing private fields. That means the properties are _not_ enumerable.

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

## Passing `$state` across boundaries

Since there's no wrapper around `$state`, `$state.raw`, or [`$derived`]($derived), you have to be aware of keeping reactivity alive when passing it across boundaries — e.g. when you pass a reactive object into or out of a function. The most succinct way of thinking about this is to treat `$state`, `$state.raw`, and [`$derived`]($derived) as "just JavaScript", and reuse the knowledge of how normal JavaScript variables work when crossing boundaries. Take the following example:

```js
// @errors: 7006
function createTodo(initial) {
	let text = initial;
	let done = false;
	return {
		text,
		done,
		log: () => console.log(text, done)
	}
}

const todo = createTodo('wrong');
todo.log(); // logs "'wrong', false"
todo.done = true;
todo.log(); // still logs "'wrong', false"
```

The value change does not propagate back into the function body of `createTodo`, because `text` and `done` are read at the point of return, and are therefore a fixed value. To make that work, we have to bring the read and write into the scope of the function body. This can be done via getter/setters or via function calls:

```js
// @errors: 7006
function createTodo(initial) {
	let text = initial;
	let done = false;
	return {
		// using getter/setter
		get text() { return text },
		set text(v) { text = v },
		// using functions
		isDone() { return done },
		toggle() { done = !done },
		// log
		log: () => console.log(text, done)
	}
}

const todo = createTodo('right');
todo.log(); // logs "'right', false"
todo.text = 'changed'; // invokes the setter
todo.toggle(); // invokes the function
todo.log(); // logs "'changed', true"
```

What you could also do is to instead create an object and return that as a whole. While the variable itself is fixed in time, its properties are not, and so they can be changed from the outside and the changes are observable from within the function:

```js
// @errors: 7006
function createTodo(initial) {
	const todo = { text: initial, done: false }
	return {
		todo,
		log: () => console.log(todo.text, todo.done)
	}
}

const todo = createTodo('right');
todo.log(); // logs "'right', false"
todo.todo.done = true; // mutates the object
todo.log(); // logs "'right', true"
```

Classes are similar, their properties are "live" due to the `this` context:

```js
// @errors: 7006
class Todo {
	done = false;
	text;

	constructor(text) {
		this.text = text;
	}

	log() {
		console.log(this.done, this.text)
	}
}

const todo = new Todo('right');
todo.log(); // logs "'right', false"
todo.done = true;
todo.log(); // logs "'right', true"
```

Notice how we didn't use _any_ Svelte specifics, this is just regular JavaScript semantics. `$state` and `$state.raw` (and [`$derived`]($derived)) don't change these, they just add reactivity on top, so that when you change a variable something can happen in reaction to it.

As a consequence, the answer to preserving reactivity across boundaries is to use getters/setters or functions (in case of `$state`, `$state.raw` and `$derived`), an object with mutable properties (in case of `$state`), or a class with reactive properties.

```js
// @errors: 7006
/// file: getters-setters-functions.svelte.js
function doubler(count) {
	const double = $derived(count() * 2)
	return {
		get current() { return double }
	};
}

let count = $state(0);
const double = doubler(() => count);
$effect(() => console.log(double.current)); // $effect logs 0
count = 1; // $effect logs 2
```

```js
// @errors: 7006
/// file: mutable-object.svelte.js
function logger(value) {
	$effect(() => console.log(value.current));
}

let count = $state({ current: 0 });
logger(count); // $effect logs 0
count.current = 1; // $effect logs 1
```

```js
// @errors: 7006
/// file: class.svelte.js
function logger(counter) {
	$effect(() => console.log(counter.count));
}

class Counter {
	count = $state(0);
	increment() { this.count++; }
}
let counter = new Counter();
logger(counter); // $effect logs 0
counter.increment(); // $effect logs 1
```

For the same reasons, you should not destructure reactive objects, because that means their value is read at that point in time, and not updated anymore from inside whatever created it.

```js
// @errors: 7006
class Counter {
	count = $state(0);
	increment = () => { this.count++; }
}

// don't do this
let { count, increment } = new Counter();
count; // 0
increment();
count; // still 0

// do this instead
let counter = new Counter();
counter.count; // 0
counter.increment();
counter.count; // 1
```

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
