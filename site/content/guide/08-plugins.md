---
title: Plugins
---

Svelte can be extended with plugins and extra methods.

### Transition plugins

The [svelte-transitions](https://github.com/sveltejs/svelte-transitions) package includes a selection of officially supported transition plugins, such as [fade](https://github.com/sveltejs/svelte-transitions-fade), [fly](https://github.com/sveltejs/svelte-transitions-fly) and [slide](https://github.com/sveltejs/svelte-transitions-slide). You can include them in a component like so:

```html
<!-- { title: 'svelte-transitions' } -->
<label>
	<input type=checkbox bind:checked=visible> visible
</label>

{#if visible}
	<!-- use `in`, `out`, or `transition` (bidirectional) -->
	<div transition:fly="{y:20}">hello!</div>
{/if}

<script>
	import { fly } from 'svelte-transitions';

	export default {
		transitions: { fly }
	};
</script>
```

```json
/* { hidden: true } */
{
	visible: true
}
```


### Extra methods

The [svelte-extras](https://github.com/sveltejs/svelte-extras) package includes a handful of methods for tweening (animating), manipulating arrays and so on.

```html
<!-- { title: 'svelte-extras' } -->
<input bind:value=newTodo placeholder="buy milk">
<button on:click="push('todos', newTodo)">add todo</button>

<ul>
	{#each todos as todo, i}
		<li>
			<button on:click="splice('todos', i, 1)">x</button>
			{todo}
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	li button {
		color: rgb(200,0,0);
		background: rgba(200,0,0,0.1);
		border-color: rgba(200,0,0,0.2);
		padding: 0.2em 0.5em;
	}
</style>

<script>
	import { push, splice } from 'svelte-extras';

	export default {
		data() {
			return {
				newTodo: '',
				todos: []
			};
		},

		methods: {
			push,
			splice
		}
	};
</script>
```

```json
/* { hidden: true } */
{
	todos: [
		"wash the car",
		"take the dog for a walk",
		"mow the lawn"
	]
}
```