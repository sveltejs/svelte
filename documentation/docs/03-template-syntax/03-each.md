---
title: {#each ...}
tags: template-each
---

```svelte
<!--- copy: false  --->
{#each expression as name}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index}...{/each}
```

Iterating over values can be done with an each block. The values in question can be arrays, array-like objects (i.e. anything with a `length` property), or iterables like `Map` and `Set`. (Internally, they are converted to arrays with [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).)

If the value is `null` or `undefined`, it is treated the same as an empty array (which will cause [else blocks](#Else-blocks) to be rendered, where applicable).

```svelte
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

An each block can also specify an _index_, equivalent to the second argument in an `array.map(...)` callback:

```svelte
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

## Keyed each blocks

```svelte
<!--- copy: false  --->
{#each expression as name (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index (key)}...{/each}
```

If a _key_ expression is provided — which must uniquely identify each list item — Svelte will use it to intelligently update the list when data changes by inserting, moving and deleting items, rather than adding or removing items at the end and updating the state in the middle.

The key can be any object, but strings and numbers are recommended since they allow identity to persist when the objects themselves change.

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}

<!-- or with additional index value -->
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

You can freely use destructuring and rest patterns in each blocks.

```svelte
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}

{#each objects as { id, ...rest }}
	<li><span>{id}</span><MyComponent {...rest} /></li>
{/each}

{#each items as [id, ...rest]}
	<li><span>{id}</span><MyComponent values={rest} /></li>
{/each}
```

## Each blocks without an item

```svelte
<!--- copy: false  --->
{#each expression}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression, index}...{/each}
```

In case you just want to render something `n` times, you can omit the `as` part:

<!-- codeblock:start {"title":"Chess board"} -->
```svelte
<!--- file: App.svelte --->
<div class="chess-board">
	{#each { length: 8 }, rank}
		{#each { length: 8 }, file}
			<div class:black={(rank + file) % 2 === 1}></div>
		{/each}
	{/each}
</div>

<style>
	.chess-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		rows: repeat(8, 1fr);
		border: 1px solid black;
		aspect-ratio: 1;

		.black {
			background: black;
		}
	}
</style>
```
<!-- codeblock:end -->

## Else blocks

```svelte
<!--- copy: false  --->
{#each expression as name}...{:else}...{/each}
```

An each block can also have an `{:else}` clause, which is rendered if the list is empty.

```svelte
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```
