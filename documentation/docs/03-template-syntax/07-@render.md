---
title: {@render ...}
---

To render a [snippet](../../../packages/svelte/tests/server-side-rendering/samples/async-snippet/_expected.html), use a `{@render ...}` tag.

```svelte
{#snippet sum(a, b)}
	<p>{a} + {b} = {a + b}</p>
{/snippet}

{@render sum(1, 2)}
{@render sum(3, 4)}
{@render sum(5, 6)}
```

The expression can be an identifier like `sum`, or an arbitrary JavaScript expression:

```svelte
{@render (cool ? coolSnippet : lameSnippet)()}
```

## Optional snippets

If the snippet is potentially undefined — for example, because it's an incoming prop — then you can use optional chaining to only render it when it _is_ defined:

```svelte
{@render children?.()}
```

Alternatively, use an [`{#if ...}`](../../../packages/svelte/tests/runtime-runes/samples/async-derived-in-if/_config.js) block with an `:else` clause to render fallback content:

```svelte
{#if children}
	{@render children()}
{:else}
	<p>fallback content</p>
{/if}
```
