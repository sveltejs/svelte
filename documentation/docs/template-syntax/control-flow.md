---
title: Control flow
---

- if
- each
- await (or move that into some kind of data loading section?)
- NOT: key (move into transition section, because that's the common use case)

Svelte augments HTML with control flow blocks to be able to express conditionally rendered content or lists.

The syntax between these blocks is the same:

- `{#` denotes the start of a block
- `{:` denotes a different branch part of the block. Depending on the block, there can be multiple of these
- `{/` denotes the end of a block

## {#if ...}

```svelte
<!--- copy: false  --->
{#if expression}...{/if}
```

```svelte
<!--- copy: false  --->
{#if expression}...{:else if expression}...{/if}
```

```svelte
<!--- copy: false  --->
{#if expression}...{:else}...{/if}
```

Content that is conditionally rendered can be wrapped in an if block.

```svelte
{#if answer === 42}
	<p>what was the question?</p>
{/if}
```

Additional conditions can be added with `{:else if expression}`, optionally ending in an `{:else}` clause.

```svelte
{#if porridge.temperature > 100}
	<p>too hot!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
```

(Blocks don't have to wrap elements, they can also wrap text within elements!)

## {#each ...}

```svelte
<!--- copy: false  --->
{#each expression as name}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name}...{:else}...{/each}
```

Iterating over lists of values can be done with an each block.

```svelte
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

You can use each blocks to iterate over any array or array-like value — that is, any object with a `length` property.

An each block can also specify an _index_, equivalent to the second argument in an `array.map(...)` callback:

```svelte
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

If a _key_ expression is provided — which must uniquely identify each list item — Svelte will use it to diff the list when data changes, rather than adding or removing items at the end. The key can be any object, but strings and numbers are recommended since they allow identity to persist when the objects themselves change.

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

An each block can also have an `{:else}` clause, which is rendered if the list is empty.

```svelte
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```

It is possible to iterate over iterables like `Map` or `Set`. Iterables need to be finite and static (they shouldn't change while being iterated over). Under the hood, they are transformed to an array using `Array.from` before being passed off to rendering. If you're writing performance-sensitive code, try to avoid iterables and use regular arrays as they are more performant.

## Other block types

Svelte also provides [`#snippet`](snippets), [`#key`](transitions-and-animations) and [`#await`](data-fetching) blocks. You can find out more about them in their respective sections.
