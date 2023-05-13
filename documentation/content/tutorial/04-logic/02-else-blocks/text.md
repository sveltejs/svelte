---
title: Else blocks
---

Since the two conditions — `if user.loggedIn` and `if !user.loggedIn` — are mutually exclusive, we can simplify this component slightly by using an `else` block:

```svelte
{#if user.loggedIn}
	<button on:click={toggle}> Log out </button>
{:else}
	<button on:click={toggle}> Log in </button>
{/if}
```

> A `#` character always indicates a _block opening_ tag. A `/` character always indicates a _block closing_ tag. A `:` character, as in `{:else}`, indicates a _block continuation_ tag. Don't worry — you've already learned almost all the syntax Svelte adds to HTML.
