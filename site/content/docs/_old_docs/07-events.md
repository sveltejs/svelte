---
title: Events
---

In most applications, you'll need to respond to the user's actions. In Svelte, this is done with the `on:[event]` directive.

### Element events

When used on an element, `on:click={handler}` is equivalent to calling `element.addEventListener('click', handler)`. When the element is removed, Svelte calls `removeEventListener` automatically.

```html
<!-- { title: 'Inline event handlers' } -->
<p>Count: {count}</p>
<button on:click="{() => count += 1}">+1</button>
```

```json
/* { hidden: true } */
{
	count: 0
}
```

For more complicated behaviours, you'll probably want to declare an event handler in your `<script>` block:

```html
<!-- { title: 'Event handlers' } -->
<script>
	let count = 0;

	function incrementOrDecrement(event) {
		const d = event.shiftKey
			? -1
			: +1;

		count += d;
	}
</script>

<p>Count: {count}</p>
<button on:click={incrementOrDecrement}>update</button>
```

```json
/* { hidden: true } */
{
	count: 0
}
```


### Event handler modifiers

While you can invoke methods like `event.stopPropagation` directly...

```html
<!-- { repl: false } -->
<div on:click="{e => e.stopPropagation()}">...</div>
```

...it gets annoying if you want to combine that with some other behaviour:

```html
<!-- { repl: false } -->
<script>
	let foo = false;

	function toggleFoo(event) {
		event.stopPropagation();
		event.preventDefault();
		foo = !foo;
	}
</script>

<div on:click={toggleFoo}>...</div>
```

For that reason, Svelte lets you use *event modifiers*:

- [`preventDefault`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- [`stopPropagation`](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [`passive`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters) — improves scrolling performance on touch/wheel events (Svelte will add it automatically where it's safe to do so)
- [`once`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters) — removes the listener after the first invocation
- [`capture`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameter)

> `passive` and `once` are not implemented in `legacy` mode

The example above can be achieved with modifiers — no need for a separate event handler:

```html
<!-- { repl: false } -->
<div on:click|stopPropagation|preventDefault="{() => foo = !foo}">...</div>
```


### Component events

Events are an excellent way for [nested components](docs#nested-components) to communicate with their parents. Let's revisit our earlier example, but turn it into a `<CategoryChooser>` component:

```html
<!-- { filename: 'CategoryChooser.html', repl: false } -->
<p>Select a category:</p>

{#each categories as category}
	<button on:click="fire('select', { category })">select {category}</button>
{/each}

<script>
	export default {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		}
	};
</script>
```

When the user clicks a button, the component will fire a `select` event, where the `event` object has a `category` property. Any component that nests `<CategoryChooser>` can listen for events like so:

```html
<!--{ title: 'Component events' }-->
<CategoryChooser on:select="playTwentyQuestions(event.category)"/>

<script>
	import CategoryChooser from './CategoryChooser.html';

	export default {
		components: {
			CategoryChooser
		},

		methods: {
			playTwentyQuestions(category) {
				alert(`ok! you chose ${category}`);
			}
		}
	};
</script>
```

```html
<!--{ filename: 'CategoryChooser.html', hidden: true }-->
<p>Select a category:</p>

{#each categories as category}
	<button on:click="fire('select', { category })">select {category}</button>
{/each}

<script>
	export default {
		data() {
			return {
				categories: [
					'animal',
					'vegetable',
					'mineral'
				]
			}
		}
	};
</script>
```

Just as `this` in an element's event handler refers to the element itself, in a component event handler `this` refers to the component firing the event.

There is also a shorthand for listening for and re-firing an event unchanged.

```html
<!-- { repl: false } -->
<!-- these are equivalent -->
<Widget on:foo="fire('foo', event)"/>
<Widget on:foo/>
```

Since component events do not propagate as DOM events do, this can be used to pass events through intermediate components. This shorthand technique also applies to element events (`on:click` is equivalent to `on:click="fire('click', event)"`).
