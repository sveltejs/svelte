---
title: Advanced
---


### Keyed each blocks

Associating a *key* with a block allows Svelte to be smarter about how it adds and removes items to and from a list. To do so, add an `(expression)` that uniquely identifies each member of the list:

```html
<!-- { repl: false } -->
{#each people as person (person.name)}
	<div>{person.name}</div>
{/each}
```

It's easier to show the effect of this than to describe it. Open the following example in the REPL:

```html
<!-- { title: 'Keyed each blocks' } -->
<button on:click="{update}">update</button>

<section>
	<h2>Keyed</h2>
	{#each people as person (person.name)}
		<div transition:slide>{person.name}</div>
	{/each}
</section>

<section>
	<h2>Non-keyed</h2>
	{#each people as person}
		<div transition:slide>{person.name}</div>
	{/each}
</section>

<style>
	button {
		display: block;
	}

	section {
		width: 10em;
		float: left;
	}
</style>

<script>
	import { slide } from 'svelte/transition';

	const names = ['Alice', 'Barry', 'Cecilia', 'Douglas', 'Eleanor', 'Felix', 'Grace', 'Horatio', 'Isabelle'];
	
	function random() {
		return names
			.filter(() => Math.random() < 0.5)
			.map(name => ({ name }));
	}
	
	let people = random();
	
	function update() {
		people = random();
	}
</script>
```


### Hydration

If you're using [server-side rendering](guide#server-side-rendering), it's likely that you'll need to create a client-side version of your app *on top of* the server-rendered version. A naive way to do that would involve removing all the existing DOM and rendering the client-side app in its place:

```js
import App from './App.html';

const target = document.querySelector('#element-with-server-rendered-html');

// avoid doing this!
target.innerHTML = '';
new App({
	target
});
```

Ideally, we want to reuse the existing DOM instead. This process is called *hydration*. First, we need to tell the compiler to include the code necessary for hydration to work by passing the `hydratable: true` option:

```js
const { js } = svelte.compile(source, {
	hydratable: true
});
```

(Most likely, you'll be passing this option to [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) or [svelte-loader](https://github.com/sveltejs/svelte-loader).)

Then, when we instantiate the client-side component, we tell it to use the existing DOM with `hydrate: true`:

```js
import App from './App.html';

const target = document.querySelector('#element-with-server-rendered-html');

new App({
	target,
	hydrate: true
});
```

> It doesn't matter if the client-side app doesn't perfectly match the server-rendered HTML — Svelte will repair the DOM as it goes.


### Immutable

Because arrays and objects are *mutable*, Svelte must err on the side of caution when deciding whether or not to update things that refer to them.

But if all your data is [immutable](https://en.wikipedia.org/wiki/Immutable_object), you can use the `{ immutable: true }` compiler option to use strict object comparison (using `===`) everywhere in your app. If you have one component that uses immutable data you can set it to use the strict comparison for just that component.

In the example below, `searchResults` would normally be recalculated whenever `items` *might* have changed, but with `immutable: true` it will only update when `items` has *definitely* changed. This can improve the performance of your app.

```html
<!-- { repl: false } -->
{#each searchResults as item}
	<div>{item.name}</div>
{/each}

<script>
	import FuzzySearch from 'fuzzy-search';

	export default {
		immutable: true,

		computed: {
			searchResults: ({ searchString, items }) => {
				if (!searchString) return items;

				const searcher = new FuzzySearch(items, ['name', 'location']);
				return searcher.search(searchString);
			}
		}
	}
</script>
```

[Here's a live example](repl?demo=immutable) showing the effect of `immutable: true`.
