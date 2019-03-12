---
title: Component format
---

Components are the building blocks of Svelte applications. They are written into `.svelte` files, using a superset of HTML:

```html
<script>
	// logic goes here
</script>

<style>
	/* styles go here */
</style>

<!-- markup (zero or more items) goes here -->
```

All three sections — script, styles and markup — are optional.


### Script

A `<script>` block contains JavaScript that runs when a component instance is created. Variables declared (or imported) at the top level are 'visible' from the component's markup. There are four additional rules:

#### 1. `export` creates a component prop

Svelte uses the `export` keyword to mark a variable declaration as a *property* or *prop*, which means it becomes accessible to consumers of the component:

```html
<script>
	// these properties can be set externally
	export let foo;
	export let bar = 'optional default value';

	// Values that are passed in as props
	// are immediately available
	console.log(foo, bar);

	// function declarations cannot be set externally,
	// but can be accessed from outside
	export function instanceMethod() {
		alert(foo);
	}
</script>
```


#### 2. Assignments are 'reactive'

To change component state and trigger a re-render, just assign to a locally declared variable:

```html
<script>
	let count = 0;

	function handleClick () {
		// calling this function will trigger a re-render
		// if the markup references `count`
		count = count + 1;
	}
</script>
```

Update expressions (`count += 1`) and property assignments (`obj.x = y`) have the same effect.


#### 3. `$:` marks a statement as reactive

Any top-level statement (i.e. not inside a block or a function) can be made reactive by prefixing it with the `$:` label. Reactive statements run immediately before the component updates, whenever the values that they depend on have changed:

```html
<script>
	export let title;

	// this will update `document.title` whenever
	// the `title` prop changes
	$: document.title = title;

	$: {
		console.log(`multiple statements can be combined`);
		console.log(`the current title is ${title}`);
	}
</script>
```

If a statement consists entirely of an assignment to an undeclared variable, Svelte will inject a `let` declaration on your behalf:

```html
<script>
	export let num;
	$: squared = num * num;
	$: cubed = squared * num;
</script>
```


#### 4. Prefix stores with `$` to access their values

Any time you have a reference to a store, you can access its value inside a component by prefixing it with the `$` character. This causes Svelte to declare the prefixed variable, and set up a store subscription that will be unsubscribed when appropriate:

```html
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1
</script>
```

Local variables (that do not represent store values) must *not* have a `$` prefix.


#### Module context

A `<script>` tag with a `context="module"` attribute runs once when the module first evaluates, rather than for each component instance. Values declared in this block are accessible from a regular `<script>` (and the component markup) but not vice versa.

You can `export` bindings from this block, and they will become exports of the compiled module:

```html
<script context="module">
	let totalComponents = 0;

	// this allows an importer to do e.g.
	// `import Example, { alertTotal } from './Example.svelte'`
	export function alertTotal() {
		alert(totalComponents);
	}
</script>

<script>
	totalComponents += 1;
	console.log(`total number of times this component has been created: ${totalComponents}`);
</script>
```

You cannot `export default`, since the default export is the component itself.


### Styles

CSS inside a `<style>` block will be scoped to that component:

```html
<style>
	p {
		/* this will only affect <p> elements in this component */
		color: burlywood;
	}
</style>
```

This works by adding a class to affected elements, which is based on a hash of the component styles (e.g. `svelte-123xyz`).

To apply styles to a selector globally, use the `:global(...)` modifier:

```html
<style>
	:global(body) {
		/* this will apply to <body> */
		margin: 0;
	}

	div :global(strong) {
		/* this will apply to all <strong> elements, in any
			 component, that are inside <div> elements belonging
			 to this component */
		color: goldenrod;
	}
</style>
```


### Markup

#### Tags

A lowercase tag, like `<div>`, denotes a regular HTML element. A capitalised tag, such as `<Widget>`, indicates a *component*.


#### Attributes

By default, attributes work exactly like their HTML counterparts:

```html
<div class="foo">
	<button disabled>can't touch this</button>
</div>
```

As in HTML, values may be unquoted:

```html
<input type=checkbox>
```

Attribute values can contain JavaScript expressions:

```html
<a href="page/{p}">page {p}</a>
```

Or they can *be* JavaScript expressions:

```html
<button disabled={!clickable}>...</button>
```

An expression might include characters that would cause syntax highlighting to fail in regular HTML, in which case quoting the value is permitted. The quotes do not affect how the value is parsed:

```html
<button disabled="{number !== 42}">...</button>
```

It's often necessary to pass a property to an element or component directly, so a shorthand is permitted — these two are equivalent:

```html
<button disabled={disabled}>...</button>
<button {disabled}>...</button>
```

*Spread attributes* allow many attributes or properties to be passed to an element or component at once:

```html
<Widget {...things}/>
```

An element or component can have multiple spread attributes, interspersed with regular ones.


#### Text expressions

Text can also contain JavaScript expressions:

```html
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>
```

#### HTML expressions

In a text expression, characters like `<` and `>` are escaped. An expression can inject HTML with `{@html expression}`:

```html
<div class="blog-post">
	<h1>{post.title}</h1>
	{@html post.content}
</div>
```

> Svelte does not sanitize expressions before injecting HTML. If the data comes from an untrusted source, you must sanitize it, or you are exposing your users to an XSS vulnerability.


#### If blocks

Content that is conditionally rendered can be wrapped in an `{#if condition}` block, where `condition` is any valid JavaScript expression:

```html
{#if answer === 42}
	<p>what was the question?</p>
{/if}
```

Additional conditions can be added with `{:else if condition}`, optionally ending in an `{:else}` clause:

```html
{#if porridge.temperature > 100}
	<p>too hot!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
```


#### Each blocks

Iterating over lists of values can be done with an `{#each list as item}` block, where `list` is any valid JavaScript expression and `item` is a valid JavaScript identifier, or a destructuring pattern.

```html
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

An `#each` block can also specify an *index*, equivalent to the second argument in an `array.map(...)` callback:

```html
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

It can also specify a *key expression* in parentheses — again, any valid JavaScript expression — which is used for list diffing when items are added or removed from the middle of the list:

```html
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

You can freely use destructuring patterns in `each` blocks:

```html
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}
```

An `#each` block can also have an `{:else}` clause, which is rendered if the list is empty:

```html
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```


#### Await blocks

Await blocks allow you to branch on the three possible states of a Promise — pending, fulfilled or rejected:

```html
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

The `catch` block can be omitted if no error is possible, and the initial block can be omitted if you don't care about the pending state:

```html
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```


#### DOM events

Use the `on:` directive to listen to DOM events:

```html
<script>
	let count = 0;

	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

You can add *modifiers* to DOM events with the `|` character:

```html
<form on:submit|preventDefault={handleSubmit}>
	<!-- the `submit` event's default is prevented,
	     so the page won't reload -->
</form>
```

The following modifiers are available:

* `preventDefault` — calls `event.preventDefault()` before running the handler
* `stopPropagation` — calls `event.stopPropagation()`, preventing the event reaching the next element
* `passive` — improves scrolling performance on touch/wheel events (Svelte will add it automatically where it's safe to do so)
* `capture` — fires the handler during the *capture* phase instead of the *bubbling* phase
* `once` — remove the handler after the first time it runs

Modifiers can be chained together, e.g. `on:click|once|capture={...}`.

If the `on:` directive is used without a value, the component will *forward* the event, meaning that a consumer of the component can listen for it.


#### Component events

Components can emit events using [createEventDispatcher](#docs/createEventDispatcher), or by forwarding DOM events. Listening for component events looks the same as listening for DOM events:

```html
<SomeComponent on:whatever={handler}/>
```



#### Element bindings

Data ordinarily flows from parent to child. The `bind:` directive allows data to flow the other way, from child to parent. Most bindings are specific to particular elements:

```html
<!-- inputs and textareas -->
<input bind:value={name}>
<textarea bind:value={text}></textarea>

<!-- numeric inputs (the value is coerced to a number) -->
<input type="number" bind:value={num}>
<input type="range" bind:value={num}>

<!-- checkbox inputs -->
<input type="checkbox" bind:checked={yes}>

<!-- grouped inputs (single value) -->
<input type="radio" bind:group={tortilla} value="Plain">
<input type="radio" bind:group={tortilla} value="Whole wheat">
<input type="radio" bind:group={tortilla} value="Spinach">

<!-- grouped inputs (multiple value) -->
<input type="checkbox" bind:group={fillings} value="Rice">
<input type="checkbox" bind:group={fillings} value="Beans">
<input type="checkbox" bind:group={fillings} value="Cheese">
<input type="checkbox" bind:group={fillings} value="Guac (extra)">

<!-- dropdowns -->
<select bind:value={selected}>
	<!-- option values do not have to be
	     strings, or even primitive values -->
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

If the name matches the value, you can use a shorthand. These are equivalent:

```html
<input bind:value={value}>
<input bind:value>
```

Media elements (`<audio>` and `<video>`) have their own set of bindings — four *readonly* ones...

* `duration` (readonly) — the total duration of the video, in seconds
* `buffered` (readonly) — an array of `{start, end}` objects
* `seekable` (readonly) — ditto
* `played` (readonly) — ditto

...and three *two-way* bindings:

* `currentTime` — the current point in the video, in seconds
* `paused` — this one should be self-explanatory
* `volume` — a value between 0 and 1


Block-level elements have readonly `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight` bindings, measured using a technique similar to [this one](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/).

To get a reference to a DOM node, use `bind:this`:

```html
<script>
	import { onMount } from 'svelte';

	let canvasElement;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvasElement}></canvas>
```


#### Component bindings

You can bind to component props using the same mechanism:

```html
<Keypad bind:value={pin}/>
```

Components also support `bind:this`, allowing you to interact with component instances programmatically.


#### Classes

A `class:` directive provides a shorter way of toggling a class on an element. These are equivalent:

```html
<div class="{active ? 'active' : ''}">...</div>
<div class:active={active}>...</div>

<!-- equivalent shorthand, for when name and value match -->
<div class:active>...</div>
```


#### Actions

Actions are functions that are called when an element is created. They must return an object with a `destroy` method that is called after the element is unmounted:

```html
<script>
	function foo(node) {
		// the node has been mounted in the DOM

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo></div>
```

An action can have arguments. If the returned value has an `update` method, it will be called whenever those arguments change, immediately after Svelte has applied updates to the markup:

```html
<script>
	export let bar;

	function foo(node, bar) {
		// the node has been mounted in the DOM

		return {
			update(bar) {
				// the value of `bar` has changed
			},

			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

<div use:foo={bar}></div>
```

> Don't worry about the fact that we're redeclaring the `foo` function for every component instance — Svelte will hoist any functions that don't depend on local state out of the component definition.



#### TODO

* transitions
* animations
* slots
* special elements