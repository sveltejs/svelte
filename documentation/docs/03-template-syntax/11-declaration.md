---
title: {<declaration ...>}
---

Declaration tags define local variables and functions inside markup.

You can use `let`, `const`, `var` and `function` declarations:

```svelte
{#each boxes as box}
	{const area = box.width * box.height}
	{function label(value) {
		return `${value} square pixels`;
	}}

	<p>{label(area)}</p>
{/each}
```

Unlike [`{@const ...}`](@const), declaration tags are plain JavaScript declarations. This means `{const ...}` is not reactive by itself; use runes such as `$state` or `$derived` when you need reactive values:

```svelte
{#if user}
	{let name = $state(user.name)}
	{let greeting = $derived(`Hello ${name}`)}

	<input bind:value={name} />
	<p>{greeting}</p>
{/if}
```

Declaration tags are only allowed as an immediate child of a block — `{#if ...}`, `{#each ...}`, `{#snippet ...}` and so on — a `<Component />` or a `<svelte:boundary>`.
